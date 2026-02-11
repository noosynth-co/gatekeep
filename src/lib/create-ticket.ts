import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { generateQRPayload } from "@/lib/qr";
import { TICKET_TYPE_MAP } from "@/lib/constants";
import { nanoid } from "nanoid";

interface Ticket {
  id: string;
  ticket_code: string;
  ticket_type: string;
  buyer_name: string | null;
  buyer_email: string;
  qr_payload: string;
}

interface EnsureResult {
  ticket: Ticket;
  isNew: boolean;
}

/**
 * Ensures a ticket exists for a given Stripe checkout session.
 * If the ticket already exists in DB, returns it.
 * If not, creates it from the Stripe session data.
 * Returns null if the session is invalid, incomplete, or unpaid.
 */
export async function ensureTicketForSession(
  sessionId: string,
): Promise<EnsureResult | null> {
  // 1. Check if ticket already exists
  const { data: existing } = await supabase
    .from("tickets")
    .select("id, ticket_code, ticket_type, buyer_name, buyer_email, qr_payload")
    .eq("stripe_session_id", sessionId)
    .single();

  if (existing) {
    return { ticket: existing as Ticket, isNew: false };
  }

  // 2. Validate session ID format
  if (!sessionId.startsWith("cs_")) {
    return null;
  }

  // 3. Retrieve checkout session from Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }

  // 4. Verify payment is complete
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return null;
  }

  // 5. Determine ticket type from line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id || "";
  const ticketType = TICKET_TYPE_MAP[priceId] || "Standard";

  // 6. Generate ticket code and QR payload
  const ticketCode = `GK-${nanoid(8).toUpperCase()}`;
  const { payload: qrPayload, hmac: qrHmac } = generateQRPayload(ticketCode);

  // 7. Extract buyer info
  const buyerEmail = session.customer_details?.email || session.customer_email;
  const buyerName = session.customer_details?.name || null;

  if (!buyerEmail) {
    return null;
  }

  // 8. Insert ticket — UNIQUE constraint on stripe_session_id prevents duplicates
  const { data: inserted, error: insertError } = await supabase
    .from("tickets")
    .insert({
      ticket_code: ticketCode,
      ticket_type: ticketType,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      amount_paid: session.amount_total || 0,
      currency: session.currency || "pln",
      qr_payload: qrPayload,
      qr_hmac: qrHmac,
    })
    .select("id, ticket_code, ticket_type, buyer_name, buyer_email, qr_payload")
    .single();

  if (insertError) {
    // 23505 = unique_violation — another process created it first (webhook or race)
    if (insertError.code === "23505") {
      const { data: raced } = await supabase
        .from("tickets")
        .select("id, ticket_code, ticket_type, buyer_name, buyer_email, qr_payload")
        .eq("stripe_session_id", sessionId)
        .single();

      if (raced) {
        return { ticket: raced as Ticket, isNew: false };
      }
    }
    console.error("Failed to insert ticket (fallback):", insertError);
    return null;
  }

  return { ticket: inserted as Ticket, isNew: true };
}
