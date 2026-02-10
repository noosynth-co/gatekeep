# GateKeep

One-time event ticket scanning system. Receives Stripe webhook payments, generates PDF tickets with QR codes, emails them, and provides a mobile-friendly scanner interface for gate staff.

## How It Works

```
Stripe Checkout (external) → Webhook → Generate QR + PDF → Email to buyer
                                                              ↓
                           Gate scanner ← QR scan → Validate → OK / ALREADY USED / INVALID
```

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Supabase** (PostgreSQL) — database
- **Stripe** — payment webhooks
- **@react-pdf/renderer** — PDF ticket generation
- **qrcode** — QR code generation
- **html5-qrcode** — camera-based QR scanning
- **Resend** — transactional email
- **Tailwind CSS** — styling
- **nanoid** — ticket code generation
- **jose** — JWT for scanner auth

## Prerequisites

- Node.js 18+
- Stripe account (test mode for development)
- Supabase project (free tier works)
- Resend account (100 emails/day free)
- Vercel account (for deployment)

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Create webhook endpoint → `STRIPE_WEBHOOK_SECRET`

### Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Resend
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Copy API key → `RESEND_API_KEY`
4. Set sender address → `EMAIL_FROM`

### Secrets
```bash
# Generate signing secrets
openssl rand -hex 32  # → QR_SIGNING_SECRET
openssl rand -hex 32  # → SCANNER_JWT_SECRET
```

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your keys
npm run dev
```

For webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Database Setup

Run this SQL in Supabase SQL Editor (also available in `supabase/migration.sql`):

```sql
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

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_log ENABLE ROW LEVEL SECURITY;
```

## Stripe Configuration

Your external Stripe Checkout Session must set:
- `success_url`: `https://yourdomain.com/ticket/{CHECKOUT_SESSION_ID}`
- Webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- Event: `checkout.session.completed`

## Configuring Event & Ticket Types

Edit `src/lib/constants.ts`:

```typescript
export const EVENT = {
  name: "Your Event Name",
  date: "March 15, 2026, 18:00",
  venue: "Your Venue, City",
} as const;

export const TICKET_TYPE_MAP: Record<string, string> = {
  "price_xxx": "Standard",  // your Stripe price IDs
  "price_yyy": "VIP",
};
```

## Adding Gate Scanners

Add scanners directly in Supabase Dashboard:

1. Generate a bcrypt hash for the PIN:
```bash
npx bcryptjs hash 123456
```

2. Insert into `scanners` table:
```sql
INSERT INTO scanners (name, pin_hash)
VALUES ('Gate A', '$2a$10$...');  -- use the hash from step 1
```

## Deployment to Vercel

1. Push repo to GitHub
2. Connect to Vercel
3. Set all environment variables from `.env.example`
4. Deploy
5. Update Stripe webhook URL to production domain

## Production Checklist

- [ ] Switch Stripe keys from test to live
- [ ] Set webhook URL to production domain
- [ ] Test end-to-end payment → ticket → email flow
- [ ] Add all gate scanners to database
- [ ] Verify email delivery
- [ ] Test scanner on mobile devices

## Scanner Staff Guide

### Logging In
1. Open `/scan` on your phone
2. Select your gate from the dropdown
3. Enter your 6-digit PIN
4. Tap "Add to Home Screen" for quick access

### Scanning Tickets
1. Point camera at the QR code on the ticket
2. Wait for the result screen

### Result Colors
- **GREEN (OK)** — Valid ticket, let them in. Auto-dismisses in 3 seconds.
- **ORANGE (ALREADY USED)** — Ticket was already scanned. Shows when it was used. Tap to dismiss.
- **RED (INVALID)** — Fake or corrupted ticket. Do not allow entry. Tap to dismiss.

### Troubleshooting
- **Camera not working**: Check browser permissions, reload the page
- **"Unauthorized"**: Your session expired, log in again at `/scan`
- **No internet**: Scanner requires an active internet connection
