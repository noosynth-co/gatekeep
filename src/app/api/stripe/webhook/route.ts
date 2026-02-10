import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { generateQRPayload } from "@/lib/qr";
import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { TICKET_TYPE_MAP } from "@/lib/constants";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;

  // Get line items to determine ticket type
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id || "";
  const ticketType = TICKET_TYPE_MAP[priceId] || "Standard";

  // Generate ticket code and QR payload
  const ticketCode = `GK-${nanoid(8).toUpperCase()}`;
  const { payload: qrPayload, hmac: qrHmac } = generateQRPayload(ticketCode);

  const buyerEmail = session.customer_details?.email || session.customer_email;
  const buyerName = session.customer_details?.name || null;

  if (!buyerEmail) {
    console.error("No email found for session:", session.id);
    return NextResponse.json(
      { error: "No customer email" },
      { status: 400 },
    );
  }

  // Atomic insert — UNIQUE constraint on stripe_session_id prevents duplicates
  // This eliminates the TOCTOU race condition of a SELECT-then-INSERT pattern
  const { error: insertError } = await supabase.from("tickets").insert({
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
  });

  if (insertError) {
    // 23505 = unique_violation — another request already processed this session
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, message: "Already processed" });
    }
    console.error("Failed to insert ticket:", insertError);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 },
    );
  }

  // Generate PDF
  try {
    const pdfBuffer = await generateTicketPDF(
      ticketCode,
      ticketType,
      buyerName,
      qrPayload,
    );

    // Send email
    await sendTicketEmail(
      buyerEmail,
      buyerName,
      ticketCode,
      ticketType,
      pdfBuffer,
    );

    // Update email_sent_at
    await supabase
      .from("tickets")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("ticket_code", ticketCode);
  } catch (err) {
    console.error("PDF/Email error:", err);
    // Ticket is created, email can be retried — don't fail the webhook
  }

  return NextResponse.json({ received: true, ticketCode });
}
