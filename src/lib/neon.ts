import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  try {
    console.log("Initializing Neon Postgres tables...");
    
    // 1. Leads Table (stores Leads_Pipeline row details)
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        company VARCHAR(255),
        deal_size NUMERIC,
        stage VARCHAR(100),
        call_type VARCHAR(100),
        bleeding_neck TEXT,
        emotional_anchor TEXT,
        coi TEXT,
        future_identity TEXT,
        budget_anchor VARCHAR(255),
        next_follow_up VARCHAR(100),
        notes TEXT,
        tasks TEXT
      )
    `;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS tasks TEXT`;

    // Seed mock data
    const existingLeads = await sql`SELECT count(*) FROM leads`;
    if (parseInt(existingLeads[0].count) === 0) {
      console.log("Seeding mock leads data...");
      const mockLeads = [
        { id: 'L1', name: 'Marcus', company: 'TechNova', deal_size: 15000, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'Fast process', emotional_anchor: 'Wants exit', coi: '$20M', future_identity: 'Leader', budget_anchor: '$15k', next_follow_up: '2026-05-20', notes: 'Very motivated', tasks: '[]' },
        { id: 'L2', name: 'John', company: 'Logistics Pro', deal_size: 10000, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'High turnover', emotional_anchor: 'Reclaim time', coi: '$10k', future_identity: 'Sales Engine', budget_anchor: '$10k', next_follow_up: '2026-05-19', notes: 'Pending', tasks: '[]' },
        { id: 'L3', name: 'Sarah', company: 'DataCorp', deal_size: 25000, stage: 'Post-Discovery', call_type: 'Inbound', bleeding_neck: 'Data leaks', emotional_anchor: 'Security', coi: 'Reputation', future_identity: 'Bulletproof CTO', budget_anchor: '$30k', next_follow_up: '2026-05-18', notes: 'Board approval', tasks: '[]' },
        { id: 'L4', name: 'Michael', company: 'BuildRite', deal_size: 12000, stage: 'Post-Discovery', call_type: 'Cold', bleeding_neck: 'Delays', emotional_anchor: 'Less stress', coi: '$50k', future_identity: 'Reliable', budget_anchor: '$12k', next_follow_up: '2026-05-21', notes: 'Fast move', tasks: '[]' },
        { id: 'L5', name: 'Jessica', company: 'CloudSync', deal_size: 32000, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Competition', emotional_anchor: 'Market share', coi: 'Risk', future_identity: 'Winner', budget_anchor: '$32k', next_follow_up: '2026-05-22', notes: 'Loves security', tasks: '[]' },
        { id: 'L6', name: 'David', company: 'MediHealth', deal_size: 18000, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Bottlenecks', emotional_anchor: 'Scalability', coi: 'Ops', future_identity: 'Efficient', budget_anchor: '$18k', next_follow_up: '2026-05-23', notes: 'Reviewing', tasks: '[]' },
        { id: 'L7', name: 'Amanda', company: 'EduTech Space', deal_size: 14500, stage: 'Active Negotiation', call_type: 'Inbound', bleeding_neck: 'Manual stuff', emotional_anchor: 'Productivity', coi: '20 hrs', future_identity: 'Modern', budget_anchor: '$14.5k', next_follow_up: '2026-05-20', notes: 'Price', tasks: '[]' },
        { id: 'L8', name: 'Robert', company: 'FinSecure', deal_size: 45000, stage: 'Active Negotiation', call_type: 'Inbound', bleeding_neck: 'Compliance', emotional_anchor: 'Audit Safety', coi: 'Risk', future_identity: 'Ironclad', budget_anchor: '$45k', next_follow_up: '2026-05-19', notes: 'Legal', tasks: '[]' },
        { id: 'L9', name: 'Emily', company: 'GreenEnergy', deal_size: 22000, stage: 'Pending Payment', call_type: 'Inbound', bleeding_neck: 'Funding', emotional_anchor: 'Sustainability', coi: '$100k', future_identity: 'Champion', budget_anchor: '$22k', next_follow_up: '2026-05-25', notes: 'Invoice', tasks: '[]' },
        { id: 'L10', name: 'James', company: 'RetailFlow', deal_size: 9500, stage: 'Pending Payment', call_type: 'Inbound', bleeding_neck: 'Legacy', emotional_anchor: 'Modernization', coi: 'Churn', future_identity: 'Agile', budget_anchor: '$9.5k', next_follow_up: '2026-05-18', notes: 'Card', tasks: '[]' },
        { id: 'L11', name: 'Olivia', company: 'StreamLine', deal_size: 28000, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'Lost deals', emotional_anchor: 'Growth', coi: 'Cost', future_identity: 'Pro', budget_anchor: '$28k', next_follow_up: '2026-05-21', notes: 'Referral', tasks: '[]' },
        { id: 'L12', name: 'William', company: 'CyberDefend', deal_size: 55000, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Breaches', emotional_anchor: 'Peace of mind', coi: 'Millions', future_identity: 'Secure', budget_anchor: '$55k', next_follow_up: '2026-05-24', notes: 'Docs', tasks: '[]' },
        { id: 'L13', name: 'Sophia', company: 'ApexGlobal', deal_size: 17500, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'Turnover', emotional_anchor: 'Retention', coi: 'Cost', future_identity: 'People Leader', budget_anchor: '$17.5k', next_follow_up: '2026-05-22', notes: 'Good', tasks: '[]' },
        { id: 'L14', name: 'Benjamin', company: 'NexusCore', deal_size: 31000, stage: 'Post-Discovery', call_type: 'Inbound', bleeding_neck: 'Infrastructure', emotional_anchor: 'Stability', coi: '$10k/hr', future_identity: 'Reliable', budget_anchor: '$31k', next_follow_up: '2026-05-19', notes: 'SLA', tasks: '[]' },
        { id: 'L15', name: 'Mia', company: 'DesignWorks', deal_size: 8500, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Onboarding', emotional_anchor: 'Efficiency', coi: '10 hrs', future_identity: 'Organized', budget_anchor: '$8.5k', next_follow_up: '2026-05-21', notes: 'Deck', tasks: '[]' },
        { id: 'L16', name: 'Alexander', company: 'PrimeLogix', deal_size: 24000, stage: 'Active Negotiation', call_type: 'Inbound', bleeding_neck: 'Errors', emotional_anchor: 'Quality', coi: '$5k', future_identity: 'Precise', budget_anchor: '$24k', next_follow_up: '2026-05-20', notes: 'Discount', tasks: '[]' },
        { id: 'L17', name: 'Charlotte', company: 'BioGen', deal_size: 65000, stage: 'Pending Payment', call_type: 'Inbound', bleeding_neck: 'Integration', emotional_anchor: 'Funding', coi: 'Series B', future_identity: 'Advanced', budget_anchor: '$65k', next_follow_up: '2026-05-19', notes: 'Contract', tasks: '[]' },
        { id: 'L18', name: 'Daniel', company: 'Structura', deal_size: 14000, stage: 'Discovery Scheduled', call_type: 'Cold', bleeding_neck: 'Micro-managing', emotional_anchor: 'Freedom', coi: 'Time', future_identity: 'Delegator', budget_anchor: '$14k', next_follow_up: '2026-05-23', notes: 'Cold result', tasks: '[]' },
        { id: 'L19', name: 'Amelia', company: 'OmniTrade', deal_size: 19000, stage: 'Post-Discovery', call_type: 'Inbound', bleeding_neck: 'Compliance', emotional_anchor: 'Safety', coi: '$50k', future_identity: 'Compliant', budget_anchor: '$19k', next_follow_up: '2026-05-22', notes: 'Needs', tasks: '[]' },
        { id: 'L20', name: 'Lucas', company: 'AgriTech Next', deal_size: 27500, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Operations', emotional_anchor: 'Growth', coi: 'Valuation', future_identity: 'Ready to sell', budget_anchor: '$27.5k', next_follow_up: '2026-05-25', notes: 'Presentation', tasks: '[]' },
        { id: 'L21', name: 'Harper', company: 'Vertex Solutions', deal_size: 11000, stage: 'Active Negotiation', call_type: 'Inbound', bleeding_neck: 'SaaS bloat', emotional_anchor: 'Focus', coi: '$2k', future_identity: 'Consolidated', budget_anchor: '$11k', next_follow_up: '2026-05-20', notes: 'Reviewing', tasks: '[]' },
        { id: 'L22', name: 'Elijah', company: 'NovaSphere', deal_size: 34000, stage: 'Pending Payment', call_type: 'Inbound', bleeding_neck: 'KPIs', emotional_anchor: 'Job security', coi: 'Promotion', future_identity: 'Performer', budget_anchor: '$34k', next_follow_up: '2026-05-21', notes: 'Processing', tasks: '[]' },
        { id: 'L23', name: 'Evelyn', company: 'SynthDynamics', deal_size: 42000, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'Revenue', emotional_anchor: 'Predictability', coi: 'Pipeline', future_identity: 'Solid', budget_anchor: '$42k', next_follow_up: '2026-05-24', notes: 'Referral', tasks: '[]' },
        { id: 'L24', name: 'Logan', company: 'QuantumLeap', deal_size: 21500, stage: 'Post-Discovery', call_type: 'Inbound', bleeding_neck: 'Innovation', emotional_anchor: 'Competitiveness', coi: 'Leadership', future_identity: 'Leader', budget_anchor: '$21.5k', next_follow_up: '2026-05-22', notes: 'Impressed', tasks: '[]' },
        { id: 'L25', name: 'Abigail', company: 'SilverLine', deal_size: 15500, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Churn', emotional_anchor: 'Clarity', coi: 'ARR', future_identity: 'Data-driven', budget_anchor: '$15.5k', next_follow_up: '2026-05-26', notes: 'Sent', tasks: '[]' },
        { id: 'L26', name: 'Henry', company: 'BuildMax', deal_size: 19500, stage: 'Discovery Scheduled', call_type: 'Inbound', bleeding_neck: 'Growth', emotional_anchor: 'Market size', coi: 'Opportunity', future_identity: 'Scaler', budget_anchor: '$19.5k', next_follow_up: '2026-05-27', notes: 'New lead', tasks: '[]' },
        { id: 'L27', name: 'Grace', company: 'HealthLink', deal_size: 12500, stage: 'Active Negotiation', call_type: 'Inbound', bleeding_neck: 'Legacy support', emotional_anchor: 'Patient care', coi: 'Quality', future_identity: 'Modernizer', budget_anchor: '$12.5k', next_follow_up: '2026-05-28', notes: 'Demo done', tasks: '[]' },
        { id: 'L28', name: 'Thomas', company: 'WebServe', deal_size: 38000, stage: 'Post-Discovery', call_type: 'Inbound', bleeding_neck: 'Downtime', emotional_anchor: 'Reliability', coi: '$200k', future_identity: 'Protector', budget_anchor: '$38k', next_follow_up: '2026-05-29', notes: 'SLA discussion', tasks: '[]' },
        { id: 'L29', name: 'Sophia J', company: 'LogiFlow', deal_size: 21000, stage: 'Pitch Complete', call_type: 'Inbound', bleeding_neck: 'Errors', emotional_anchor: 'Accuracy', coi: 'Waste', future_identity: 'Precisionist', budget_anchor: '$21k', next_follow_up: '2026-05-30', notes: 'Pricing', tasks: '[]' },
        { id: 'L30', name: 'George', company: 'DataViz', deal_size: 26000, stage: 'Pending Payment', call_type: 'Inbound', bleeding_neck: 'Silos', emotional_anchor: 'Visibility', coi: 'ROI', future_identity: 'Visionary', budget_anchor: '$26k', next_follow_up: '2026-05-31', notes: 'Closing', tasks: '[]' },
      ];
      for (const lead of mockLeads) {
        await sql`
          INSERT INTO leads (id, name, company, deal_size, stage, call_type, bleeding_neck, emotional_anchor, coi, future_identity, budget_anchor, next_follow_up, notes, tasks)
          VALUES (${lead.id}, ${lead.name}, ${lead.company}, ${lead.deal_size}, ${lead.stage}, ${lead.call_type}, ${lead.bleeding_neck}, ${lead.emotional_anchor}, ${lead.coi}, ${lead.future_identity}, ${lead.budget_anchor}, ${lead.next_follow_up}, ${lead.notes}, ${lead.tasks})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      console.log("Mock leads seeded.");
    }

    // 2. Metrics Table (stores Metrics_Dashboard key metrics)
    await sql`
      CREATE TABLE IF NOT EXISTS metrics (
        id VARCHAR(50) PRIMARY KEY,
        total_calls VARCHAR(100),
        shows VARCHAR(100),
        closes VARCHAR(100),
        total_revenue VARCHAR(100),
        refunds VARCHAR(100),
        set_to_close_ratio VARCHAR(100),
        pipeline_velocity VARCHAR(100),
        talk_to_listen_ratio VARCHAR(100),
        show_to_close_rate VARCHAR(100),
        average_deal_size VARCHAR(100),
        cash_collected VARCHAR(100)
      )
    `;

    // 3. Stakeholders Table (stores Influence_Map details)
    await sql`
      CREATE TABLE IF NOT EXISTS stakeholders (
        id VARCHAR(50) PRIMARY KEY,
        lead_id VARCHAR(50),
        name VARCHAR(255),
        role VARCHAR(255),
        quadrant VARCHAR(100),
        status VARCHAR(100),
        primary_fear TEXT
      )
    `;

    // 4. Users Table (stores auth/subscription details)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        subscription TEXT DEFAULT 'free',
        is_admin BOOLEAN DEFAULT FALSE,
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`;

    // 5. Logs Table (stores application activity logs)
    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        action TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Neon Postgres tables initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Neon Postgres table schemas:", err);
  }
}
