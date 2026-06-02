-- SQL Schema for Aegis Vault

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    company VARCHAR(255),
    deal_size NUMERIC,
    stage VARCHAR(255),
    call_type VARCHAR(255),
    bleeding_neck TEXT,
    emotional_anchor TEXT,
    coi TEXT,
    future_identity TEXT,
    budget_anchor TEXT,
    next_follow_up DATE,
    notes TEXT,
    tasks JSONB,
    closer_id VARCHAR(255),
    closer_percentage NUMERIC,
    amount_paid NUMERIC,
    payment_confirmed BOOLEAN,
    talk_to_listen_ratio NUMERIC
);

CREATE TABLE IF NOT EXISTS metrics (
    id VARCHAR(255) PRIMARY KEY,
    total_calls VARCHAR(50),
    shows VARCHAR(50),
    closes VARCHAR(50),
    total_revenue VARCHAR(50),
    refunds VARCHAR(50),
    set_to_close_ratio VARCHAR(50),
    pipeline_velocity VARCHAR(50),
    talk_to_listen_ratio VARCHAR(50),
    show_to_close_rate VARCHAR(50),
    average_deal_size VARCHAR(50),
    cash_collected VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS stakeholders (
    id VARCHAR(255) PRIMARY KEY,
    lead_id VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(255),
    quadrant VARCHAR(50),
    status VARCHAR(50),
    primary_fear TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    subscription VARCHAR(50),
    is_admin BOOLEAN
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
