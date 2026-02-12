import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { supabase } from "@/lib/supabase";
import { ensureTicketForSession } from "@/lib/create-ticket";
import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { logger, withAxiom } from "@/lib/axiom/server";

export const GET = withAxiom(async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 },
    );
  }

  // Fast path: check DB directly first
  const { data } = await supabase
    .from("tickets")
    .select("id, ticket_code, ticket_type, buyer_name")
    .eq("stripe_session_id", sessionId)
    .single();

  if (data) {
    return NextResponse.json(data);
  }

  // Fallback: try to create ticket from Stripe session data
  const result = await ensureTicketForSession(sessionId);

  if (!result) {
    return NextResponse.json(
      { error: "Ticket not found" },
      { status: 404 },
    );
  }

  // If we just created the ticket, trigger PDF generation + email in background
  if (result.isNew) {
    const { ticket } = result;
    after(async () => {
      try {
        const pdfBuffer = await generateTicketPDF(
          ticket.ticket_code,
          ticket.ticket_type,
          ticket.buyer_name,
          ticket.qr_payload,
        );

        await sendTicketEmail(
          ticket.buyer_email,
          ticket.buyer_name,
          ticket.ticket_code,
          ticket.ticket_type,
          pdfBuffer,
        );

        await supabase
          .from("tickets")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("ticket_code", ticket.ticket_code);
      } catch (err) {
        logger.error("PDF/Email error for ticket (fallback)", { ticketCode: ticket.ticket_code, error: err instanceof Error ? err.message : err });
        await logger.flush();
      }
    });
  }

  return NextResponse.json({
    id: result.ticket.id,
    ticket_code: result.ticket.ticket_code,
    ticket_type: result.ticket.ticket_type,
    buyer_name: result.ticket.buyer_name,
  });
});
