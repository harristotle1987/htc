import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getSheetsDoc } from './src/lib/googleSheets';
import { initDb, sql } from './src/lib/neon';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://ais-dev-rsuujetimibenrq4xxjyb2-69440511109.europe-west2.run.app/api/auth/callback/google';

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

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
    talkToListenRatio: row.talk_to_listen_ratio ? Number(row.talk_to_listen_ratio) : 0
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

// OAuth Callback Handler
app.get('/api/auth/callback/google', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/settings?auth_error=true');
  }

  if (!code) {
    return res.redirect('/settings?auth_error=missing_code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Save tokens and update sheet connection flag
    const document = await getSheetsDoc();
    let sheet = document?.sheetsByTitle['Configuration'];
    
    if (!sheet) {
        sheet = await document!.addSheet({ title: 'Configuration', headerValues: ['Key', 'Value'] });
    }
    
    const rows = await sheet.getRows();
    let configRow = rows.find(r => r.get('Key') === 'GoogleCalendarConnected');
    
    if (configRow) {
        configRow.set('Value', 'Connected');
        await configRow.save();
    } else {
        await sheet.addRow({ Key: 'GoogleCalendarConnected', Value: 'Connected' });
    }

    res.redirect('/settings?auth_success=true');
  } catch (err) {
    console.error('OAuth token exchange failed:', err);
    res.redirect('/settings?auth_error=token_exchange_failed');
  }
});

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
    // In a real app, update user in DB here
    // await sql`UPDATE users SET two_factor_secret = ${secret}, two_factor_enabled = true WHERE email = ${email}`;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    const dbLeads = await sql`SELECT * FROM leads ORDER BY id ASC`;
    const leads = dbLeads ? dbLeads.map(mapPostgresLead) : [];
    res.json({ leads });
  } catch (dbErr) {
    console.error('Failed to fetch leads from Postgres:', dbErr);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET /api/metrics - Fetch from 'Metrics_Dashboard'
app.get('/api/metrics', async (req, res) => {
  let metrics: any[] = [];
  try {
    const dbMetrics = await sql`SELECT * FROM metrics ORDER BY id ASC`;
    if (dbMetrics && dbMetrics.length > 0) {
      metrics = dbMetrics.map(mapPostgresMetric);
    }
  } catch (dbErr) {
    console.error('Failed to fetch metrics from Neon Postgres:', dbErr);
  }

  if (metrics.length === 0) {
    try {
      const document = await getSheetsDoc();
      const sheet = document?.sheetsByTitle['Metrics_Dashboard'];
      if (sheet) {
        const rows = await sheet.getRows();
        metrics = rows.map(row => ({
          id: row.get('ID'),
          totalCalls: row.get('Total_Calls') || '0',
          shows: row.get('Shows') || '0',
          closes: row.get('Closes') || '0',
          totalRevenue: row.get('Total_Revenue') || '$0',
          refunds: row.get('Refunds') || '$0',
          setToCloseRatio: row.get('Set_to_Close_Ratio') || '0%',
          pipelineVelocity: row.get('Pipeline_Velocity') || '0 Days',
          talkToListenRatio: row.get('Talk_to_Listen_Ratio') || '0%',
          showToCloseRate: row.get('Show_to_Close_Rate') || '0%',
          averageDealSize: row.get('Average_Deal_Size') || '$0',
          cashCollected: row.get('Cash_Collected') || '$0'
        }));

        if (metrics.length > 0) {
          console.log(`Syncing ${metrics.length} metrics to Neon Postgres...`);
          for (const metric of metrics) {
            try {
              await sql`
                INSERT INTO metrics (
                  id, total_calls, shows, closes, total_revenue, refunds,
                  set_to_close_ratio, pipeline_velocity, talk_to_listen_ratio,
                  show_to_close_rate, average_deal_size, cash_collected
                ) VALUES (${metric.id}, ${metric.totalCalls}, ${metric.shows}, ${metric.closes}, ${metric.totalRevenue}, ${metric.refunds}, ${metric.setToCloseRatio}, ${metric.pipelineVelocity}, ${metric.talkToListenRatio}, ${metric.showToCloseRate}, ${metric.averageDealSize}, ${metric.cashCollected})
                ON CONFLICT (id) DO UPDATE SET
                  total_calls = EXCLUDED.total_calls,
                  shows = EXCLUDED.shows,
                  closes = EXCLUDED.closes,
                  total_revenue = EXCLUDED.total_revenue,
                  refunds = EXCLUDED.refunds,
                  set_to_close_ratio = EXCLUDED.set_to_close_ratio,
                  pipeline_velocity = EXCLUDED.pipeline_velocity,
                  talk_to_listen_ratio = EXCLUDED.talk_to_listen_ratio,
                  show_to_close_rate = EXCLUDED.show_to_close_rate,
                  average_deal_size = EXCLUDED.average_deal_size,
                  cash_collected = EXCLUDED.cash_collected
              `;
            } catch (insErr) {
              console.error(`Failed to sync metric row ${metric.id} to Neon Postgres:`, insErr);
            }
          }
        }
      }
    } catch (sheetErr) {
      console.error('Failed to load metrics from Google Sheets:', sheetErr);
    }
  }

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
});

// POST /api/metrics - Create metric record
app.post('/api/metrics', async (req, res) => {
  const id = Date.now().toString();
  const { totalCalls, shows, closes, totalRevenue, refunds, setToCloseRatio, pipelineVelocity, talkToListenRatio, showToCloseRate, averageDealSize, cashCollected } = req.body;

  // 1. Save to Neon Postgres
  try {
    await sql`
      INSERT INTO metrics (
        id, total_calls, shows, closes, total_revenue, refunds,
        set_to_close_ratio, pipeline_velocity, talk_to_listen_ratio,
        show_to_close_rate, average_deal_size, cash_collected
      ) VALUES (
        ${id}, 
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
  } catch (pgErr) {
    console.error('Failed to insert metric in Neon Postgres:', pgErr);
  }

  // 2. Backup to Google Sheets
  runInBackground((async () => {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Metrics_Dashboard'];
    if (sheet) {
      await sheet.addRow({
        ID: id,
        Total_Calls: totalCalls || '0',
        Shows: shows || '0',
        Closes: closes || '0',
        Total_Revenue: totalRevenue || '$0',
        Refunds: refunds || '$0',
        Set_to_Close_Ratio: setToCloseRatio || '0%',
        Pipeline_Velocity: pipelineVelocity || '0 Days',
        Talk_to_Listen_Ratio: talkToListenRatio || '0%',
        Show_to_Close_Rate: showToCloseRate || '0%',
        Average_Deal_Size: averageDealSize || '$0',
        Cash_Collected: cashCollected || '$0'
      });
      console.log(`Metric ${id} backed up to Google Sheets.`);
    }
  })(), `Backup metric ${id} to Google Sheets`);

  res.json({ success: true, id });
});

// PATCH /api/metrics/:id - Update metric record
app.patch('/api/metrics/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  // 1. Update Neon Postgres
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
    }
  } catch (pgErr) {
    console.error('Failed to update metric in Neon Postgres:', pgErr);
  }

  // 2. Backup to Google Sheets
  runInBackground((async () => {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Metrics_Dashboard'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id);
      if (row) {
        if (updates.totalCalls !== undefined) row.set('Total_Calls', updates.totalCalls);
        if (updates.shows !== undefined) row.set('Shows', updates.shows);
        if (updates.closes !== undefined) row.set('Closes', updates.closes);
        if (updates.totalRevenue !== undefined) row.set('Total_Revenue', updates.totalRevenue);
        if (updates.refunds !== undefined) row.set('Refunds', updates.refunds);
        if (updates.setToCloseRatio !== undefined) row.set('Set_to_Close_Ratio', updates.setToCloseRatio);
        if (updates.pipelineVelocity !== undefined) row.set('Pipeline_Velocity', updates.pipelineVelocity);
        if (updates.talkToListenRatio !== undefined) row.set('Talk_to_Listen_Ratio', updates.talkToListenRatio);
        if (updates.showToCloseRate !== undefined) row.set('Show_to_Close_Rate', updates.showToCloseRate);
        if (updates.averageDealSize !== undefined) row.set('Average_Deal_Size', updates.averageDealSize);
        if (updates.cashCollected !== undefined) row.set('Cash_Collected', updates.cashCollected);
        await row.save();
        console.log(`Metric ${id} backup updated in Google Sheets.`);
      }
    }
  })(), `Update metric ${id} backup in Google Sheets`);

  res.json({ success: true });
});

// DELETE /api/metrics/:id - Delete metric record
app.delete('/api/metrics/:id', async (req, res) => {
  const id = req.params.id;

  // 1. Delete from Neon Postgres
  try {
    await sql`DELETE FROM metrics WHERE id = ${id}`;
    console.log(`Metric ${id} deleted from Neon Postgres.`);
  } catch (pgErr) {
    console.error('Failed to delete metric from Neon Postgres:', pgErr);
  }

  // 2. Delete from Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Metrics_Dashboard'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id);
      if (row) {
        await row.delete();
        console.log(`Metric ${id} backup deleted from Google Sheets.`);
      }
    }
  } catch (sheetErr) {
    console.error('Failed to delete metric backup from Google Sheets:', sheetErr);
  }

  res.json({ success: true });
});


// POST /api/leads - Create a new lead
app.post('/api/leads', async (req, res) => {
  const id = `L${Date.now()}`;
  const { name, company, dealSize, stage, callType, bleedingNeck, emotionalAnchor, coi, futureIdentity, budgetAnchor, nextFollowUp, notes, tasks, closerId, closerPercentage, amountPaid, paymentConfirmed, talkToListenRatio } = req.body;

  // 1. Write to Neon Postgres
  try {
    await sql`
      INSERT INTO leads (
        id, name, company, deal_size, stage, call_type, bleeding_neck, 
        emotional_anchor, coi, future_identity, budget_anchor, next_follow_up, notes, tasks,
        closer_id, closer_percentage, amount_paid, payment_confirmed, talk_to_listen_ratio
      ) VALUES (
        ${id}, 
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
        ${talkToListenRatio || 0}
      )
    `;
    console.log(`Lead ${id} saved to Neon Postgres.`);
  } catch (pgErr) {
    console.error('Failed to insert lead into Neon Postgres:', pgErr);
  }

  // 2. Write to Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Leads_Pipeline'];
    if (sheet) {
      await sheet.addRow({
        ID: id,
        Name: name || '',
        Company: company || '',
        Deal_Size: dealSize || '',
        Stage: stage || 'Discovery Scheduled',
        Call_Type: callType || '',
        Bleeding_Neck: bleedingNeck || '',
        Emotional_Anchor: emotionalAnchor || '',
        Cost_of_Inaction: coi || '',
        Future_Identity: futureIdentity || '',
        Budget_Anchor: budgetAnchor || '',
        Next_Follow_Up_Date: nextFollowUp || '',
        Notes: notes || '',
        Tasks: tasks ? JSON.stringify(tasks) : '[]'
      });
      console.log(`Lead ${id} backed up to Google Sheets.`);
    }
  } catch (sheetErr) {
    console.error('Failed to backup lead to Google Sheets:', sheetErr);
  }

  res.json({ success: true, id });
  io.emit('lead_created', { 
    id, 
    name: name || '',
    company: company || '',
    dealSize: dealSize || 0,
    stage: stage || 'Discovery Scheduled',
    callType: callType || '',
    bleedingNeck: bleedingNeck || '',
    emotionalAnchor: emotionalAnchor || '',
    coi: coi || '',
    futureIdentity: futureIdentity || '',
    budgetAnchor: budgetAnchor || '',
    nextFollowUp: nextFollowUp || '',
    notes: notes || ''
  });
});

// POST /api/signup - Store new user in Google Sheets
app.post('/api/signup', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Users'];
    if (sheet) {
      await sheet.addRow({
        Name: name,
        Email: email,
        Phone: phone,
        Timestamp: new Date().toISOString(),
        Subscription: 'free'
      });
      
      // Also write to Neon Postgres
      const userCount = await sql`SELECT count(*) FROM users`;
      const isAdmin = parseInt(userCount[0].count) === 0;
      await sql`
        INSERT INTO users (id, name, email, phone, subscription, is_admin)
        VALUES (${Date.now().toString()}, ${name}, ${email}, ${phone}, 'free', ${isAdmin})
      `;

      console.log(`User ${email} signed up and saved to Sheets and Postgres (isAdmin: ${isAdmin}).`);
      return res.json({ success: true });
    } else {
      return res.status(500).json({ error: 'Users sheet not found' });
    }
  } catch (error) {
    console.error('Error saving user to Sheets:', error);
    return res.status(500).json({ error: 'Failed to save signup' });
  }
});

// GET /api/subscription/:email - Check user subscription status from Google Sheets
app.get('/api/subscription/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Users'];
    if (sheet) {
      const rows = await sheet.getRows();
      const user = rows.find(r => r.get('Email') === email);
      if (user) {
        return res.json({ tier: user.get('Subscription') || 'free' });
      }
      return res.json({ tier: 'free' });
    }
    return res.status(500).json({ error: 'Users sheet not found' });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Users'];
    const sheetUsers = sheet ? (await sheet.getRows()).map(row => ({
      email: row.get('Email'),
      name: row.get('Name'),
      phone: row.get('Phone'),
      subscription: row.get('Subscription') || 'free',
      signupDate: row.get('Timestamp')
    })) : [];

    const dbUsers = await sql`SELECT * FROM users`;
    
    // Merge logic: For simplicity, just return sheet users
    res.json({ users: sheetUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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
          emotional_anchor, coi, future_identity, budget_anchor, next_follow_up, notes
        ) VALUES (
          ${id}, ${lead.name || ''}, ${lead.company || ''}, ${lead.dealSize || 0}, 
          ${lead.stage || 'Discovery Scheduled'}, ${lead.callType || ''}, ${lead.bleedingNeck || ''}, 
          ${lead.emotionalAnchor || ''}, ${lead.coi || ''}, ${lead.futureIdentity || ''}, 
          ${lead.budgetAnchor || ''}, ${lead.nextFollowUp || ''}, ${lead.notes || ''}
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

  // 1. Update Neon Postgres
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
        talkToListenRatio: updates.talkToListenRatio !== undefined ? updates.talkToListenRatio : current.talk_to_listen_ratio
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
          talk_to_listen_ratio = ${merged.talkToListenRatio}
        WHERE id = ${id}
      `;
      console.log(`Lead ${id} updated in Neon Postgres.`);
    }
  } catch (pgErr) {
    console.error('Failed to update lead in Neon Postgres:', pgErr);
  }

  // 2. Update Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Leads_Pipeline'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id);
      if (row) {
        if (updates.name !== undefined) row.set('Name', updates.name);
        if (updates.company !== undefined) row.set('Company', updates.company);
        if (updates.dealSize !== undefined) row.set('Deal_Size', updates.dealSize);
        if (updates.stage) row.set('Stage', updates.stage);
        if (updates.callType !== undefined) row.set('Call_Type', updates.callType);
        if (updates.bleedingNeck !== undefined) row.set('Bleeding_Neck', updates.bleedingNeck);
        if (updates.emotionalAnchor) row.set('Emotional_Anchor', updates.emotionalAnchor);
        if (updates.coi) row.set('Cost_of_Inaction', updates.coi);
        if (updates.futureIdentity !== undefined) row.set('Future_Identity', updates.futureIdentity);
        if (updates.budgetAnchor !== undefined) row.set('Budget_Anchor', updates.budgetAnchor);
        if (updates.nextFollowUp) row.set('Next_Follow_Up_Date', updates.nextFollowUp);
        if (updates.notes !== undefined) row.set('Notes', updates.notes);
        if (updates.tasks !== undefined) row.set('Tasks', JSON.stringify(updates.tasks));
        await row.save();
        console.log(`Lead ${id} backup updated in Google Sheets.`);
      }
    }
  } catch (sheetErr) {
    console.error('Failed to update lead backup in Google Sheets:', sheetErr);
  }

  res.json({ success: true });
  io.emit('lead_updated', { ...updates, id });
});

// DELETE /api/leads/:id
app.delete('/api/leads/:id', async (req, res) => {
  const id = req.params.id;

  // 1. Delete from Neon Postgres
  try {
    await sql`DELETE FROM leads WHERE id = ${id}`;
    console.log(`Lead ${id} deleted from Neon Postgres.`);
  } catch (pgErr) {
    console.error('Failed to delete lead from Neon Postgres:', pgErr);
  }

  // 2. Delete from Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Leads_Pipeline'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id);
      if (row) {
        await row.delete();
        console.log(`Lead ${id} backup deleted from Google Sheets.`);
      }
    }
  } catch (sheetErr) {
    console.error('Failed to delete lead backup from Google Sheets:', sheetErr);
  }

  res.json({ success: true });
  io.emit('lead_deleted', { id });
});

// Influence Map Endpoints
app.get('/api/influence', async (req, res) => {
  const leadId = req.query.leadId as string;
  if (!leadId) return res.status(400).json({ error: 'leadId is required' });

  let stakeholders: any[] = [];
  try {
    const dbStakeholders = await sql`SELECT * FROM stakeholders WHERE lead_id = ${leadId} ORDER BY id ASC`;
    if (dbStakeholders && dbStakeholders.length > 0) {
      stakeholders = dbStakeholders.map(mapPostgresStakeholder);
    }
  } catch (dbErr) {
    console.error('Failed to fetch stakeholders from Neon Postgres:', dbErr);
  }

  if (stakeholders.length === 0) {
    try {
      const document = await getSheetsDoc();
      const sheet = document?.sheetsByTitle['Influence_Map'];
      if (sheet) {
        const rows = await sheet.getRows();
        stakeholders = rows
          .filter(row => row.get('Lead_ID') === leadId)
          .map(row => ({
            id: row.get('ID') || row.rowNumber.toString(),
            leadId: row.get('Lead_ID'),
            name: row.get('Stakeholder_Name') || '',
            role: row.get('Role') || '',
            quadrant: row.get('Quadrant') || 'Monitor',
            status: row.get('Status') || 'Neutral',
            primaryFear: row.get('Primary_Fear') || ''
          }));

        if (stakeholders.length > 0) {
          console.log(`Syncing ${stakeholders.length} stakeholders to Neon Postgres...`);
          for (const sh of stakeholders) {
            try {
              await sql`
                INSERT INTO stakeholders (id, lead_id, name, role, quadrant, status, primary_fear)
                VALUES (${sh.id}, ${sh.leadId}, ${sh.name}, ${sh.role}, ${sh.quadrant}, ${sh.status}, ${sh.primaryFear})
                ON CONFLICT (id) DO UPDATE SET
                  lead_id = EXCLUDED.lead_id,
                  name = EXCLUDED.name,
                  role = EXCLUDED.role,
                  quadrant = EXCLUDED.quadrant,
                  status = EXCLUDED.status,
                  primary_fear = EXCLUDED.primary_fear
              `;
            } catch (insErr) {
              console.error(`Failed to sync stakeholder ${sh.id} to Neon Postgres:`, insErr);
            }
          }
        }
      }
    } catch (sheetErr) {
      console.error('Failed to load stakeholders from Google Sheets:', sheetErr);
    }
  }

  res.json({ stakeholders });
});

app.post('/api/influence', async (req, res) => {
  const id = Date.now().toString();
  const { leadId, name, role, quadrant, status, primaryFear } = req.body;

  // 1. Save to Neon Postgres
  try {
    await sql`
      INSERT INTO stakeholders (id, lead_id, name, role, quadrant, status, primary_fear)
      VALUES (${id}, ${leadId}, ${name || ''}, ${role || ''}, ${quadrant || 'Monitor'}, ${status || 'Neutral'}, ${primaryFear || ''})
    `;
    console.log(`Stakeholder ${id} created in Neon Postgres.`);
  } catch (pgErr) {
    console.error('Failed to insert stakeholder into Neon Postgres:', pgErr);
  }

  // 2. Backup to Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Influence_Map'];
    if (sheet) {
      await sheet.addRow({
        ID: id,
        Lead_ID: leadId,
        Stakeholder_Name: name || '',
        Role: role || '',
        Quadrant: quadrant || 'Monitor',
        Status: status || 'Neutral',
        Primary_Fear: primaryFear || ''
      });
      console.log(`Stakeholder ${id} backed up to Google Sheets.`);
    }
  } catch (sheetErr) {
    console.error('Failed to backup stakeholder to Google Sheets:', sheetErr);
  }

  res.json({ success: true, id });
});

app.patch('/api/influence/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  // 1. Update Neon Postgres
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
    }
  } catch (pgErr) {
    console.error('Failed to update stakeholder in Neon Postgres:', pgErr);
  }

  // 2. Update Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Influence_Map'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id || r.rowNumber.toString() === id);
      if (row) {
        if (updates.name !== undefined) row.set('Stakeholder_Name', updates.name);
        if (updates.role !== undefined) row.set('Role', updates.role);
        if (updates.quadrant !== undefined) row.set('Quadrant', updates.quadrant);
        if (updates.status !== undefined) row.set('Status', updates.status);
        if (updates.primaryFear !== undefined) row.set('Primary_Fear', updates.primaryFear);
        await row.save();
        console.log(`Stakeholder ${id} backup updated in Google Sheets.`);
      }
    }
  } catch (sheetErr) {
    console.error('Failed to update stakeholder backup in Google Sheets:', sheetErr);
  }

  res.json({ success: true });
});

app.delete('/api/influence', async (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'id is required' });

  // 1. Delete from Neon Postgres
  try {
    await sql`DELETE FROM stakeholders WHERE id = ${id}`;
    console.log(`Stakeholder ${id} deleted from Neon Postgres.`);
  } catch (pgErr) {
    console.error('Failed to delete stakeholder from Neon Postgres:', pgErr);
  }

  // 2. Delete from Google Sheets
  try {
    const document = await getSheetsDoc();
    const sheet = document?.sheetsByTitle['Influence_Map'];
    if (sheet) {
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === id || r.rowNumber.toString() === id);
      if (row) {
        await row.delete();
        console.log(`Stakeholder ${id} backup deleted from Google Sheets.`);
      }
    }
  } catch (sheetErr) {
    console.error('Failed to delete stakeholder backup from Google Sheets:', sheetErr);
  }

  res.json({ success: true });
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

// GET /api/2fa/status
app.get('/api/2fa/status', (req, res) => {
  const user = getUser();
  res.json({ enabled: user.twoFactorEnabled });
});

// POST /api/2fa/generate
app.post('/api/2fa/generate', async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: 'Aegis Vault'
  });
  
  if (!secret.otpauth_url) {
     return res.status(500).json({ error: 'Failed to generate secret' });
  }

  try {
    const dataUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({
      secret: secret.base32,
      qrCode: dataUrl,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /api/2fa/verify-setup
app.post('/api/2fa/verify-setup', (req, res) => {
  const { token, secret } = req.body;
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token
  });
  
  if (verified) {
    const user = getUser();
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    saveUser(user);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid verification code' });
  }
});

// POST /api/2fa/disable
app.post('/api/2fa/disable', (req, res) => {
  const { token } = req.body;
  const user = getUser();
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return res.status(400).json({ success: false, error: '2FA is not enabled' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });
  
  if (verified) {
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    saveUser(user);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid verification code' });
  }
});

// POST /api/2fa/verify-login
app.post('/api/2fa/verify-login', (req, res) => {
  const { token } = req.body;
  const user = getUser();
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return res.json({ success: true }); // No 2FA enforced
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });
  
  if (verified) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid 2FA token' });
  }
});

// Catch-all for undefined API routes to ensure they never return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

async function startServer() {
  // Initialize Neon Postgres schemas safely before booting
  try {
    await initDb();
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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
