import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb, sql } from './src/lib/neon';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(express.json());

function mapPostgresLead(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    company: row.company || '',
    dealSize: row.deal_size ? Number(row.deal_size) : 0,
    stage: row.stage || 'Discovery Scheduled',
    callType: row.call_type || '',
    bleedingNeck: row.bleeding_neck || '',
    emotionalAnchor: row.emotional_anchor || '',
    coi: row.coi || '',
    futureIdentity: row.future_identity || '',
    budgetAnchor: row.budget_anchor || '',
    nextFollowUp: row.next_follow_up || '',
    notes: row.notes || '',
    tasks: row.tasks ? JSON.parse(row.tasks) : [],
    closerId: row.closer_id || '',
    closerPercentage: row.closer_percentage ? Number(row.closer_percentage) : 0,
    amountPaid: row.amount_paid ? Number(row.amount_paid) : 0,
    paymentConfirmed: !!row.payment_confirmed,
    talkToListenRatio: row.talk_to_listen_ratio ? Number(row.talk_to_listen_ratio) : 0,
    bookingDate: row.booking_date ? new Date(row.booking_date).toISOString() : undefined
  };
}

function mapPostgresMetric(row: any) {
  return {
    id: row.id,
    totalCalls: row.total_calls || '0',
    shows: row.shows || '0',
    closes: row.closes || '0',
    totalRevenue: row.total_revenue || '$0',
    refunds: row.refunds || '$0',
    setToCloseRatio: row.set_to_close_ratio || '0%',
    pipelineVelocity: row.pipeline_velocity || '0 Days',
    talkToListenRatio: row.talk_to_listen_ratio || '0%',
    showToCloseRate: row.show_to_close_rate || '0%',
    averageDealSize: row.average_deal_size || '$0',
    cashCollected: row.cash_collected || '$0'
  };
}

function mapPostgresStakeholder(row: any) {
  return {
    id: row.id,
    leadId: row.lead_id,
    name: row.name || '',
    role: row.role || '',
    quadrant: row.quadrant || 'Monitor',
    status: row.status || 'Neutral',
    primaryFear: row.primary_fear || ''
  };
}

// API Routes

// Helper to run operations in background safely
function runInBackground(promise: Promise<any>, description: string) {
  promise.catch(err => console.error(`Background task failed: ${description}`, err));
}


// API Routes
// Auth Middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[API Request] Method=${req.method} URL=${req.originalUrl} Path=${req.path}`);
  const email = req.headers['x-user-email'] as string;
  
  if (!email) {
    // Unprotected paths
    const bypassPaths = ['/api/auth', '/api/signup', '/api/login', '/api/users', '/api/prices', '/api/webhooks/monnify', '/api/config/monnify'];
    if (bypassPaths.some(p => req.originalUrl.startsWith(p))) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const user = await sql`SELECT is_admin FROM users WHERE email = ${email}`;
    const isAdmin = (user && user.length > 0 && user[0].is_admin) || email === process.env.ADMIN_SOVEREIGN_EMAIL;
    (req as any).userEmail = email;
    (req as any).isAdmin = isAdmin;
    
    // Protect admin routes
    if (req.path.startsWith('/admin') && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Auth failed' });
  }
};

app.use('/api', requireAuth);

app.post('/api/auth/2fa/generate', async (req, res) => {
  const { email } = req.body;
  const secret = speakeasy.generateSecret({ name: `Aegis Vault (${email})` });
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

  res.json({ secret: secret.base32, qrCodeDataUrl });
});

app.post('/api/auth/2fa/verify', async (req, res) => {
  const { secret, token, email } = req.body;
  
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token
  });
  
  if (verified) {
    const userEmail = email || (req as any).userEmail || req.headers['x-user-email'];
    if (userEmail) {
      await sql`UPDATE users SET two_factor_secret = ${secret}, two_factor_enabled = true WHERE email = ${userEmail}`;
    }
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});


// GET /api/cron/calcom-sync - Vercel Cron Job endpoint
app.get('/api/cron/calcom-sync', async (req, res) => {
  console.log('Running Cal.com CRON sync...');
  await syncCalcomEvents();
  res.json({ success: true, message: 'Cal.com sync completed' });
});

app.get('/api/leads', async (req, res) => {
  try {
    let dbLeads;
    if ((req as any).isAdmin) {
      dbLeads = await sql`SELECT * FROM leads ORDER BY id ASC`;
    } else {
      dbLeads = await sql`SELECT * FROM leads WHERE user_email = ${(req as any).userEmail} ORDER BY id ASC`;
    }
    const leads = dbLeads ? dbLeads.map(mapPostgresLead) : [];
    res.json({ leads });
  } catch (dbErr) {
    console.error('Failed to fetch leads from Postgres:', dbErr);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET /api/metrics - Fetch from Neon Postgres
app.get('/api/metrics', async (req, res) => {
  try {
    let dbMetrics;
    if ((req as any).isAdmin) {
      dbMetrics = await sql`SELECT * FROM metrics ORDER BY id ASC`;
    } else {
      dbMetrics = await sql`SELECT * FROM metrics WHERE user_email = ${(req as any).userEmail} ORDER BY id ASC`;
    }
    const metrics = dbMetrics ? dbMetrics.map(mapPostgresMetric) : [];
    
    if (metrics.length === 0) {
      res.json({
        setupRequired: true,
        metrics: [
          { 
            id: '1', totalCalls: '100', shows: '80', closes: '20', totalRevenue: '$150,000', refunds: '$0',
            setToCloseRatio: '25%', pipelineVelocity: '14 Days', talkToListenRatio: '28%', showToCloseRate: '0%', averageDealSize: '$0', cashCollected: '$0'
          }
        ]
      });
    } else {
      res.json({ metrics });
    }
  } catch (dbErr) {
    console.error('Failed to fetch metrics from Neon Postgres:', dbErr);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// POST /api/metrics - Create metric record
app.post('/api/metrics', async (req, res) => {
  const id = Date.now().toString();
  const userEmail = (req as any).userEmail;
  const { totalCalls, shows, closes, totalRevenue, refunds, setToCloseRatio, pipelineVelocity, talkToListenRatio, showToCloseRate, averageDealSize, cashCollected } = req.body;

  try {
    await sql`
      INSERT INTO metrics (
        id, user_email, total_calls, shows, closes, total_revenue, refunds,
        set_to_close_ratio, pipeline_velocity, talk_to_listen_ratio,
        show_to_close_rate, average_deal_size, cash_collected
      ) VALUES (
        ${id}, 
        ${userEmail || ''},
        ${totalCalls || '0'}, 
        ${shows || '0'}, 
        ${closes || '0'}, 
        ${totalRevenue || '$0'}, 
        ${refunds || '$0'}, 
        ${setToCloseRatio || '0%'}, 
        ${pipelineVelocity || '0 Days'}, 
        ${talkToListenRatio || '0%'},
        ${showToCloseRate || '0%'}, 
        ${averageDealSize || '$0'}, 
        ${cashCollected || '$0'}
      )
    `;
    console.log(`Metric ${id} created in Neon Postgres.`);
    res.json({ success: true, id });
  } catch (pgErr) {
    console.error('Failed to insert metric in Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to create metric' });
  }
});

// PATCH /api/metrics/:id - Update metric record
app.patch('/api/metrics/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const currentMetrics = await sql`SELECT * FROM metrics WHERE id = ${id}`;
    if (currentMetrics && currentMetrics.length > 0) {
      const current = currentMetrics[0];
      const merged = {
        totalCalls: updates.totalCalls !== undefined ? updates.totalCalls : current.total_calls,
        shows: updates.shows !== undefined ? updates.shows : current.shows,
        closes: updates.closes !== undefined ? updates.closes : current.closes,
        totalRevenue: updates.totalRevenue !== undefined ? updates.totalRevenue : current.total_revenue,
        refunds: updates.refunds !== undefined ? updates.refunds : current.refunds,
        setToCloseRatio: updates.setToCloseRatio !== undefined ? updates.setToCloseRatio : current.set_to_close_ratio,
        pipelineVelocity: updates.pipelineVelocity !== undefined ? updates.pipelineVelocity : current.pipeline_velocity,
        talkToListenRatio: updates.talkToListenRatio !== undefined ? updates.talkToListenRatio : current.talk_to_listen_ratio,
        showToCloseRate: updates.showToCloseRate !== undefined ? updates.showToCloseRate : current.show_to_close_rate,
        averageDealSize: updates.averageDealSize !== undefined ? updates.averageDealSize : current.average_deal_size,
        cashCollected: updates.cashCollected !== undefined ? updates.cashCollected : current.cash_collected
      };

      await sql`
        UPDATE metrics SET
          total_calls = ${merged.totalCalls}, 
          shows = ${merged.shows}, 
          closes = ${merged.closes}, 
          total_revenue = ${merged.totalRevenue},
          refunds = ${merged.refunds}, 
          set_to_close_ratio = ${merged.setToCloseRatio}, 
          pipeline_velocity = ${merged.pipelineVelocity},
          talk_to_listen_ratio = ${merged.talkToListenRatio}, 
          show_to_close_rate = ${merged.showToCloseRate},
          average_deal_size = ${merged.averageDealSize}, 
          cash_collected = ${merged.cashCollected}
        WHERE id = ${id}
      `;
      console.log(`Metric ${id} updated in Neon Postgres.`);
      res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Metric not found' });
    }
  } catch (pgErr) {
    console.error('Failed to update metric in Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to update metric' });
  }
});

// DELETE /api/metrics/:id - Delete metric record
app.delete('/api/metrics/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await sql`DELETE FROM metrics WHERE id = ${id}`;
    console.log(`Metric ${id} deleted from Neon Postgres.`);
    res.json({ success: true });
  } catch (pgErr) {
    console.error('Failed to delete metric from Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});


// POST /api/leads - Create a new lead
app.post('/api/leads', async (req, res) => {
  const id = `L${Date.now()}`;
  const userEmail = (req as any).userEmail;
  const { name, company, dealSize, stage, callType, bleedingNeck, emotionalAnchor, coi, futureIdentity, budgetAnchor, nextFollowUp, notes, tasks, closerId, closerPercentage, amountPaid, paymentConfirmed, talkToListenRatio, bookingDate } = req.body;

  try {
    await sql`
      INSERT INTO leads (
        id, user_email, name, company, deal_size, stage, call_type, bleeding_neck, 
        emotional_anchor, coi, future_identity, budget_anchor, next_follow_up, notes, tasks,
        closer_id, closer_percentage, amount_paid, payment_confirmed, talk_to_listen_ratio, booking_date
      ) VALUES (
        ${id}, 
        ${userEmail || ''},
        ${name || ''}, 
        ${company || ''}, 
        ${dealSize || 0}, 
        ${stage || 'Discovery Scheduled'}, 
        ${callType || ''}, 
        ${bleedingNeck || ''}, 
        ${emotionalAnchor || ''}, 
        ${coi || ''}, 
        ${futureIdentity || ''}, 
        ${budgetAnchor || ''}, 
        ${nextFollowUp || ''}, 
        ${notes || ''}, 
        ${JSON.stringify(tasks || [])},
        ${closerId || ''},
        ${closerPercentage || 0},
        ${amountPaid || 0},
        ${paymentConfirmed || false},
        ${talkToListenRatio || 0},
        ${bookingDate || null}
      )
    `;
    console.log(`Lead ${id} saved to Neon Postgres.`);
    res.json({ success: true, id });
    io.emit('lead_created', { 
        id, 
        name, 
        company, 
        dealSize, 
        stage, 
        callType, 
        bleedingNeck, 
        emotionalAnchor, 
        coi, 
        futureIdentity, 
        budgetAnchor, 
        nextFollowUp, 
        notes, 
        tasks
      });
  } catch (pgErr) {
    console.error('Failed to insert lead into Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

import bcrypt from 'bcryptjs';

// POST /api/signup - Store new user in Postgres
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'auth/email-already-in-use' });
    }

    const userCount = await sql`SELECT count(*) FROM users`;
    const isAdmin = parseInt(userCount[0].count) === 0;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    await sql`
        INSERT INTO users (id, name, email, phone, subscription, is_admin, password_hash)
        VALUES (${Date.now().toString()}, ${name}, ${email}, ${phone || ''}, 'unassigned', ${isAdmin}, ${hash})
    `;

    console.log(`User ${email} signed up and saved to Postgres (isAdmin: ${isAdmin}).`);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving user to Postgres:', error);
    return res.status(500).json({ error: error.message || 'Failed to save signup' });
  }
});

// POST /api/login - Authenticate user via Postgres
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users || users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = users[0];
    if (!user.password_hash) {
      // First time login for existing user after password feature added - auto-set password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await sql`UPDATE users SET password_hash = ${hash} WHERE email = ${email}`;
    } else {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({ success: true, require2FA: !!user.two_factor_enabled, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/users/:email - Get user details
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users && users.length > 0) {
      const user = users[0];
      return res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          subscription: user.subscription || 'free',
          subscriptionExpiresAt: user.subscription_expires_at,
          isAdmin: !!user.is_admin,
          avatarUrl: user.avatar_url,
          lastPage: user.last_page,
          is2FAEnabled: !!user.two_factor_enabled
        } 
      });
    } else {
      // Auto-create missing user record (might be existing Firebase user backing into Postgres)
      const userCount = await sql`SELECT count(*) FROM users`;
      const isAdmin = parseInt(userCount[0].count) === 0;
      const newId = Date.now().toString();
      await sql`
        INSERT INTO users (id, name, email, phone, subscription, is_admin, last_page)
        VALUES (${newId}, 'Admin User', ${email}, '', 'unassigned', ${isAdmin}, 'pipeline')
      `;
      return res.json({
        user: {
          id: newId,
          name: 'Admin User',
          email: email,
          phone: '',
          subscription: 'unassigned',
          subscriptionExpiresAt: null,
          isAdmin: isAdmin,
          avatarUrl: '',
          lastPage: 'pipeline'
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:email - Update user details
app.patch('/api/users/:email', async (req, res) => {
  console.log('PATCH /api/users/:email', req.params.email, req.body);
  const { email } = req.params;
  const updates = req.body;
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    console.log('User query result:', users);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // allow partial updates
    const current = users[0];
    const name = updates.name !== undefined ? updates.name : (current.name ?? null);
    const phone = updates.phone !== undefined ? updates.phone : (current.phone ?? null);
    const avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : (current.avatar_url ?? null);
    const subscription = updates.subscription !== undefined ? updates.subscription : (current.subscription ?? null);
    const paystackRef = updates.paystack_reference !== undefined ? updates.paystack_reference : (current.paystack_reference ?? null);
    const monnifyRef = updates.monnify_reference !== undefined ? updates.monnify_reference : (current.monnify_reference ?? null);
    const lastPage = updates.lastPage !== undefined ? updates.lastPage : (current.last_page ?? null);
    
    let subscriptionExpiresAt = current.subscription_expires_at ?? null;
    if (updates.subscription && updates.subscription !== 'free' && updates.subscription !== 'unassigned' && updates.billing_cycle) {
       const expiration = new Date();
       if (updates.billing_cycle === 'monthly') expiration.setMonth(expiration.getMonth() + 1);
       if (updates.billing_cycle === 'quarterly') expiration.setMonth(expiration.getMonth() + 3);
       if (updates.billing_cycle === 'annually') expiration.setFullYear(expiration.getFullYear() + 1);
       subscriptionExpiresAt = expiration.toISOString();
    } else if (updates.subscription === 'free' || updates.subscription === 'unassigned') {
       subscriptionExpiresAt = null;
    }

    let passHash = current.password_hash;
    if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        passHash = await bcrypt.hash(updates.password, salt);
    }

    await sql`
      UPDATE users SET 
        name = ${name},
        phone = ${phone},
        avatar_url = ${avatarUrl},
        password_hash = ${passHash},
        subscription = ${subscription},
        paystack_reference = ${paystackRef},
        monnify_reference = ${monnifyRef},
        last_page = ${lastPage},
        subscription_expires_at = ${subscriptionExpiresAt}
      WHERE email = ${email}
    `;

    if (updates.monnify_reference && updates.amount) {
      await sql`
        INSERT INTO payments (user_email, amount, reference, tier)
        VALUES (${email}, ${updates.amount}, ${updates.monnify_reference}, ${updates.subscription})
      `;
    } else if (updates.paystack_reference && updates.amount) {
      await sql`
        INSERT INTO payments (user_email, amount, reference, tier)
        VALUES (${email}, ${updates.amount}, ${updates.paystack_reference}, ${updates.subscription})
      `;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/payments/:email - Get payment history
app.get('/api/payments/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const payments = await sql`SELECT * FROM payments WHERE user_email = ${email} ORDER BY created_at DESC`;
    res.json({ payments: payments.map(p => ({
      id: p.id,
      amount: p.amount,
      reference: p.reference,
      tier: p.tier,
      date: p.created_at
    })) });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/webhooks/monnify - Webhook endpoint for Monnify events
app.post('/api/webhooks/monnify', express.json(), async (req, res) => {
  const monnifySignature = req.headers['monnify-signature'];
  const requestBody = req.body;
  
  console.log('Received Monnify webhook:', requestBody);
  console.log('Monnify Signature:', monnifySignature);
  
  // Example of how to verify using crypto
  // import crypto from 'crypto';
  // const computeHash = crypto.createHmac('sha512', process.env.MONNIFY_SECRET_KEY || '').update(JSON.stringify(requestBody)).digest('hex');
  // if (computeHash !== monnifySignature) return res.status(401).send('Unauthorized');
  
  const { eventType, eventData } = requestBody;
  
  // Here you can handle various event Types like 'SUCCESSFUL_TRANSACTION', 'REFUND_COMPLETED', 'DISBURSEMENT_SUCCESSFUL'
  if (eventType === 'SUCCESSFUL_TRANSACTION') {
    const { customer, paymentReference, paymentStatus, amount } = eventData || {};
    console.log(`Webhook: Transaction successful for ${customer?.email}, ref: ${paymentReference}, status: ${paymentStatus}`);
    
    // You could update your database records here to reflect the successful payment asynchronously
  }
  
  res.status(200).send('Webhook received successfully');
});

// GET /api/subscription/:email - Check user subscription status from Postgres
app.get('/api/subscription/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const users = await sql`SELECT subscription FROM users WHERE email = ${email}`;
    if (users && users.length > 0) {
        return res.json({ tier: users[0].subscription || 'free' });
    }
    return res.json({ tier: 'free' });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// DELETE /api/admin/users/:email - Delete user details
app.delete('/api/admin/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    await sql`DELETE FROM users WHERE email = ${email}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    const dbUsers = await sql`SELECT * FROM users`;
    res.json({ users: dbUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      subscription: u.subscription || 'free',
      avatarUrl: u.avatar_url,
      signupDate: u.signup_date,
    })) });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/prices
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await sql`SELECT * FROM tier_prices`;
    const priceMap = prices.reduce((acc: any, p: any) => { 
      acc[p.tier] = {
        monthly: Number(p.price_monthly ?? p.price),
        quarterly: Number(p.price_quarterly ?? (p.price * 3 * 0.9)),
        annually: Number(p.price_annually ?? (p.price * 12 * 0.8)),
      }; 
      return acc; 
    }, {});
    res.json({
        ...({
            architect: { monthly: 6, quarterly: 16.2, annually: 57.6 },
            syndicate: { monthly: 16, quarterly: 43.2, annually: 153.6 }
        }),
        ...priceMap
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.json({ 
      architect: { monthly: 6, quarterly: 16.2, annually: 57.6 }, 
      syndicate: { monthly: 16, quarterly: 43.2, annually: 153.6 } 
    });
  }
});

// GET /api/config/monnify
app.get('/api/config/monnify', (req, res) => {
  res.json({
    apiKey: process.env.VITE_MONNIFY_API_KEY || process.env.MONNIFY_API_KEY || 'MK_TEST_5BQALXXL2N',
    contractCode: process.env.VITE_MONNIFY_CONTRACT_CODE || process.env.MONNIFY_CONTRACT_CODE || '6732385923',
  });
});


// POST /api/admin/prices
app.post('/api/admin/prices', async (req, res) => {
  if (!(req as any).isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { architect, syndicate } = req.body;
  try {
    if (architect) {
      await sql`UPDATE tier_prices SET 
        price = ${architect.monthly}, price_monthly = ${architect.monthly}, 
        price_quarterly = ${architect.quarterly}, price_annually = ${architect.annually} 
        WHERE tier = 'architect'`;
    }
    if (syndicate) {
      await sql`UPDATE tier_prices SET 
        price = ${syndicate.monthly}, price_monthly = ${syndicate.monthly}, 
        price_quarterly = ${syndicate.quarterly}, price_annually = ${syndicate.annually} 
        WHERE tier = 'syndicate'`;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Failed to update prices' });
  }
});

// GET /api/admin/system/health - Get System/API Status
app.get('/api/admin/system/health', async (req, res) => {
  try {
    const isDbConnected = !!(await sql`SELECT 1`);
    const status = {
      database: isDbConnected ? 'Connected' : 'No Connection',
      monnifyGateway: process.env.MONNIFY_SECRET_KEY ? 'Connected' : 'No Connection',
      monnifyContractCode: process.env.MONNIFY_CONTRACT_CODE ? 'Connected' : 'No Connection',
      environment: process.env.NODE_ENV || 'development'
    };
    res.json(status);
  } catch (err) {
    res.status(500).json({ 
      database: 'No Connection', 
      monnifyGateway: 'Unknown', 
      error: (err as any).message 
    });
  }
});

// GET /api/admin/logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    const logs = await sql`SELECT * FROM logs ORDER BY created_at DESC LIMIT 50`;
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /api/leads/import - Bulk import leads
app.post('/api/leads/import', async (req, res) => {
  const { leads } = req.body;
  if (!Array.isArray(leads)) return res.status(400).json({ error: 'Invalid data format' });

  try {
    for (const lead of leads) {
      const id = `L${Date.now() + Math.random()}`;
      await sql`
        INSERT INTO leads (
          id, name, company, deal_size, stage, call_type, bleeding_neck, 
          emotional_anchor, coi, future_identity, budget_anchor, next_follow_up, notes, tasks
        ) VALUES (
          ${id}, ${lead.name || ''}, ${lead.company || ''}, ${lead.dealSize || 0}, 
          ${lead.stage || 'Discovery Scheduled'}, ${lead.callType || ''}, ${lead.bleedingNeck || ''}, 
          ${lead.emotionalAnchor || ''}, ${lead.coi || ''}, ${lead.futureIdentity || ''}, 
          ${lead.budgetAnchor || ''}, ${lead.nextFollowUp || ''}, ${lead.notes || ''}, 
          ${JSON.stringify(lead.tasks || [])}
        )
      `;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Bulk import failed:', err);
    res.status(500).json({ error: 'Failed to import' });
  }
});

// Update a lead (using PATCH to align with instructions)
app.patch('/api/leads/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const currentLeads = await sql`SELECT * FROM leads WHERE id = ${id}`;
    if (currentLeads && currentLeads.length > 0) {
      const current = currentLeads[0];
      const merged = {
        name: updates.name !== undefined ? updates.name : current.name,
        company: updates.company !== undefined ? updates.company : current.company,
        dealSize: updates.dealSize !== undefined ? updates.dealSize : current.deal_size,
        stage: updates.stage !== undefined ? updates.stage : current.stage,
        callType: updates.callType !== undefined ? updates.callType : current.call_type,
        bleedingNeck: updates.bleedingNeck !== undefined ? updates.bleedingNeck : current.bleeding_neck,
        emotionalAnchor: updates.emotionalAnchor !== undefined ? updates.emotionalAnchor : current.emotional_anchor,
        coi: updates.coi !== undefined ? updates.coi : current.coi,
        futureIdentity: updates.futureIdentity !== undefined ? updates.futureIdentity : current.future_identity,
        budgetAnchor: updates.budgetAnchor !== undefined ? updates.budgetAnchor : current.budget_anchor,
        nextFollowUp: updates.nextFollowUp !== undefined ? updates.nextFollowUp : current.next_follow_up,
        notes: updates.notes !== undefined ? updates.notes : current.notes,
        tasks: updates.tasks !== undefined ? JSON.stringify(updates.tasks) : current.tasks,
        closerId: updates.closerId !== undefined ? updates.closerId : current.closer_id,
        closerPercentage: updates.closerPercentage !== undefined ? updates.closerPercentage : current.closer_percentage,
        amountPaid: updates.amountPaid !== undefined ? updates.amountPaid : current.amount_paid,
        paymentConfirmed: updates.paymentConfirmed !== undefined ? updates.paymentConfirmed : current.payment_confirmed,
        talkToListenRatio: updates.talkToListenRatio !== undefined ? updates.talkToListenRatio : current.talk_to_listen_ratio,
        bookingDate: updates.bookingDate !== undefined ? updates.bookingDate : current.booking_date
      };

      await sql`
        UPDATE leads SET
          name = ${merged.name}, 
          company = ${merged.company}, 
          deal_size = ${merged.dealSize}, 
          stage = ${merged.stage}, 
          call_type = ${merged.callType},
          bleeding_neck = ${merged.bleedingNeck}, 
          emotional_anchor = ${merged.emotionalAnchor}, 
          coi = ${merged.coi}, 
          future_identity = ${merged.futureIdentity},
          budget_anchor = ${merged.budgetAnchor}, 
          next_follow_up = ${merged.nextFollowUp}, 
          notes = ${merged.notes}, 
          tasks = ${merged.tasks},
          closer_id = ${merged.closerId},
          closer_percentage = ${merged.closerPercentage},
          amount_paid = ${merged.amountPaid},
          payment_confirmed = ${merged.paymentConfirmed},
          talk_to_listen_ratio = ${merged.talkToListenRatio},
          booking_date = ${merged.bookingDate}
        WHERE id = ${id}
      `;
      console.log(`Lead ${id} updated in Neon Postgres.`);
      res.json({ success: true });
      io.emit('lead_updated', { ...updates, id });
    } else {
        res.status(404).json({ error: 'Lead not found' });
    }
  } catch (pgErr) {
    console.error('Failed to update lead in Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE /api/leads/:id
app.delete('/api/leads/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await sql`DELETE FROM leads WHERE id = ${id}`;
    console.log(`Lead ${id} deleted from Neon Postgres.`);
    res.json({ success: true });
    io.emit('lead_deleted', { id });
  } catch (pgErr) {
    console.error('Failed to delete lead from Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Influence Map Endpoints
app.get('/api/influence', async (req, res) => {
  const leadId = req.query.leadId as string;
  if (!leadId) return res.status(400).json({ error: 'leadId is required' });

  try {
    let dbStakeholders;
    if ((req as any).isAdmin) {
      dbStakeholders = await sql`SELECT * FROM stakeholders WHERE lead_id = ${leadId} ORDER BY id ASC`;
    } else {
      dbStakeholders = await sql`SELECT * FROM stakeholders WHERE lead_id = ${leadId} AND user_email = ${(req as any).userEmail} ORDER BY id ASC`;
    }
    const stakeholders = dbStakeholders ? dbStakeholders.map(mapPostgresStakeholder) : [];
    res.json({ stakeholders });
  } catch (dbErr) {
    console.error('Failed to fetch stakeholders from Neon Postgres:', dbErr);
    res.status(500).json({ error: 'Failed to fetch stakeholders' });
  }
});

app.post('/api/influence', async (req, res) => {
  const id = Date.now().toString();
  const userEmail = (req as any).userEmail;
  const { leadId, name, role, quadrant, status, primaryFear } = req.body;

  try {
    await sql`
      INSERT INTO stakeholders (id, user_email, lead_id, name, role, quadrant, status, primary_fear)
      VALUES (${id}, ${userEmail || ''}, ${leadId}, ${name || ''}, ${role || ''}, ${quadrant || 'Monitor'}, ${status || 'Neutral'}, ${primaryFear || ''})
    `;
    console.log(`Stakeholder ${id} created in Neon Postgres.`);
    res.json({ success: true, id });
  } catch (pgErr) {
    console.error('Failed to insert stakeholder into Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to create stakeholder' });
  }
});

app.patch('/api/influence/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const currentSHs = await sql`SELECT * FROM stakeholders WHERE id = ${id}`;
    if (currentSHs && currentSHs.length > 0) {
      const current = currentSHs[0];
      const merged = {
        name: updates.name !== undefined ? updates.name : current.name,
        role: updates.role !== undefined ? updates.role : current.role,
        quadrant: updates.quadrant !== undefined ? updates.quadrant : current.quadrant,
        status: updates.status !== undefined ? updates.status : current.status,
        primaryFear: updates.primaryFear !== undefined ? updates.primaryFear : current.primary_fear
      };

      await sql`
        UPDATE stakeholders SET
          name = ${merged.name}, 
          role = ${merged.role}, 
          quadrant = ${merged.quadrant}, 
          status = ${merged.status}, 
          primary_fear = ${merged.primaryFear}
        WHERE id = ${id}
      `;
      console.log(`Stakeholder ${id} updated in Neon Postgres.`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Stakeholder not found' });
    }
  } catch (pgErr) {
    console.error('Failed to update stakeholder in Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to update stakeholder' });
  }
});

app.delete('/api/influence', async (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'id is required' });

  try {
    await sql`DELETE FROM stakeholders WHERE id = ${id}`;
    console.log(`Stakeholder ${id} deleted from Neon Postgres.`);
    res.json({ success: true });
  } catch (pgErr) {
    console.error('Failed to delete stakeholder from Neon Postgres:', pgErr);
    res.status(500).json({ error: 'Failed to delete stakeholder' });
  }
});

import fs from 'fs';

// Persistent File DB for user 2FA state
interface User {
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
}

const USER_FILE = path.join(process.cwd(), 'user.json');

function getUser(): User {
  try {
    if (fs.existsSync(USER_FILE)) {
      return JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { twoFactorEnabled: false, twoFactorSecret: null };
}

function saveUser(user: User) {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('Failed to save user info', e);
  }
}

// POST /api/auth/2fa/disable
app.post('/api/auth/2fa/disable', async (req, res) => {
  const { token, email: reqEmail } = req.body;
  const email = (req as any).userEmail || req.headers['x-user-email'] || reqEmail;

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users || users.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(400).json({ success: false, error: '2FA is not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });
    
    if (verified) {
      await sql`UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = ${email}`;
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid verification code' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// POST /api/auth/2fa/verify-login
app.post('/api/auth/2fa/verify-login', async (req, res) => {
  const { token, email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users || users.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.json({ success: true }); // No 2FA enforced
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });
    
    if (verified) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid 2FA token' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Catch-all for undefined API routes to ensure they never return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

async function ensureSovereignAdmin() {
  try {
    const email = 'harristotle84@gmail.com';
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (!users || users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Colony082987@', salt);
      await sql`
        INSERT INTO users (id, name, email, phone, subscription, is_admin, password_hash)
        VALUES (${Date.now().toString()}, 'Admin', ${email}, '', 'pro', true, ${hash})
      `;
      console.log('Sovereign admin created.');
    } else if (!users[0].password_hash) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Colony082987@', salt);
      await sql`
        UPDATE users SET password_hash = ${hash}, is_admin = true WHERE email = ${email}
      `;
      console.log('Sovereign admin password and admin status updated.');
    }
  } catch (error) {
    console.error('Failed to ensure sovereign admin:', error);
  }
}

async function syncCalcomEvents() {
  if (!process.env.CALCOM_API_KEY) return;

  try {
    // Get bookings (events) from Cal.com, you can optionally filter by status
    const eventsRes = await fetch(`https://api.cal.com/v1/bookings?apiKey=${process.env.CALCOM_API_KEY}`);
    const eventsData = await eventsRes.json();
    if (!eventsRes.ok || !eventsData.bookings) return;
    
    for (const booking of eventsData.bookings) {
      if (booking.status === 'ACCEPTED' || booking.status === 'PENDING') {
        const attendees = booking.attendees || [];
        for (const attendee of attendees) {
           const name = attendee.name || '';
           // Match with leads in DB
           const dbLeads = await sql`SELECT * FROM leads WHERE name ILIKE ${'%' + name + '%'}`;
           for (const dbLead of dbLeads) {
               if (dbLead.stage === 'Nurture / Long-Term') {
                    const eventDate = booking.startTime ? booking.startTime.split('T')[0] : new Date().toISOString().split('T')[0];
                    await sql`UPDATE leads SET stage = 'Discovery Scheduled', next_follow_up = ${eventDate} WHERE id = ${dbLead.id}`;
                   console.log(`Auto-mapped Cal.com event for ${name} to lead ${dbLead.id}`);
               }
           }
        }
      }
    }
  } catch (error) {
    console.error('Error syncing Cal.com events:', error);
  }
}

async function startServer() {
  // Initialize Neon Postgres schemas safely before booting
  try {
    await initDb();
    await ensureSovereignAdmin();
    console.log('Neon Postgres schema initialization completed successfully.');
  } catch (err) {
    console.error('Failed to initialize Neon Postgres:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Start Cal.com background sync task (runs every 5 minutes)
    syncCalcomEvents();
    setInterval(syncCalcomEvents, 5 * 60 * 1000);
  });
}

export default app;

if (process.env.NODE_ENV !== 'production' || (!process.env.VERCEL && process.env.NODE_ENV === 'production')) {
  startServer();
}
