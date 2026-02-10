-- GateKeep: Database migration
-- Run this in Supabase SQL Editor

CREATE TABLE tickets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code           TEXT UNIQUE NOT NULL,
  ticket_type           TEXT NOT NULL,
  buyer_email           TEXT NOT NULL,
  buyer_name            TEXT,
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  amount_paid           INTEGER NOT NULL,
  currency              TEXT DEFAULT 'pln',
  qr_payload            TEXT NOT NULL,
  qr_hmac               TEXT NOT NULL,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','used','cancelled')),
  used_at               TIMESTAMPTZ,
  used_by               TEXT,
  email_sent_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_session ON tickets(stripe_session_id);

CREATE TABLE scanners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  pin_hash   TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scan_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id),
  scanner_id  UUID REFERENCES scanners(id),
  result      TEXT NOT NULL CHECK (result IN ('OK','ALREADY_USED','INVALID')),
  scanned_at  TIMESTAMPTZ DEFAULT NOW(),
  raw_payload TEXT
);

-- Enable RLS (access only through service role key via API routes)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_log ENABLE ROW LEVEL SECURITY;
