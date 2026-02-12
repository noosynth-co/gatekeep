import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTicketPDF } from "@/lib/pdf";
import { withAxiom } from "@/lib/axiom/server";

export const GET = withAxiom(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("ticket_code, ticket_type, buyer_name, qr_payload")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: "Ticket not found" },
      { status: 404 },
    );
  }

  const pdfBuffer = await generateTicketPDF(
    ticket.ticket_code,
    ticket.ticket_type,
    ticket.buyer_name,
    ticket.qr_payload,
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${ticket.ticket_code}.pdf"`,
    },
  });
});
