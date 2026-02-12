import { supabase } from "@/lib/supabase";
import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { logger } from "@/lib/axiom/server";

const DEFAULT_BATCH_SIZE = 10;

export async function retryUnsentEmails(batchSize = DEFAULT_BATCH_SIZE) {
  const limit = Math.min(batchSize, 50);

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("ticket_code, ticket_type, buyer_email, buyer_name, qr_payload")
    .is("email_sent_at", null)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    logger.error("Failed to fetch unsent tickets", { error });
    throw new Error("Database error");
  }

  if (!tickets || tickets.length === 0) {
    return { sent: 0, failed: 0, remaining: 0, details: { sent: [], failed: [] } };
  }

  const results: { sent: string[]; failed: string[] } = {
    sent: [],
    failed: [],
  };

  for (const ticket of tickets) {
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

      results.sent.push(ticket.ticket_code);
    } catch (err) {
      logger.error("Retry failed for ticket", {
        ticketCode: ticket.ticket_code,
        error: err instanceof Error ? err.message : err,
      });
      results.failed.push(ticket.ticket_code);
    }
  }

  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .is("email_sent_at", null)
    .neq("status", "cancelled");

  return {
    sent: results.sent.length,
    failed: results.failed.length,
    remaining: count ?? 0,
    details: results,
  };
}
