import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyQRPayload } from "@/lib/qr";
import { verifyScannerToken } from "@/lib/scanner-auth";
import type { ScanResponse } from "@/types";
import { withAxiom } from "@/lib/axiom/server";

export const POST = withAxiom(async function POST(req: NextRequest) {
  const scanner = await verifyScannerToken();
  if (!scanner) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { payload, ticketCode: manualCode } = await req.json();

  const TICKET_CODE_RE = /^GK-[A-Z0-9]{8}$/;

  let ticketCode: string | undefined;
  let rawPayload: string;

  if (manualCode && typeof manualCode === "string") {
    // Manual entry flow — validate format, skip HMAC
    const code = manualCode.toUpperCase().trim();
    if (!TICKET_CODE_RE.test(code)) {
      return NextResponse.json({
        result: "INVALID",
        message: "Invalid ticket code format",
      } satisfies ScanResponse);
    }
    ticketCode = code;
    rawPayload = `manual:${code}`;
  } else if (payload && typeof payload === "string") {
    // QR scan flow — verify HMAC
    const { valid, ticketCode: verified } = verifyQRPayload(payload);
    rawPayload = payload.substring(0, 500);

    if (!valid || !verified) {
      await supabase.from("scan_log").insert({
        scanner_id: scanner.scannerId,
        result: "INVALID",
        raw_payload: rawPayload,
      });

      return NextResponse.json({
        result: "INVALID",
        message: "Invalid QR code",
      } satisfies ScanResponse);
    }
    ticketCode = verified;
  } else {
    return NextResponse.json(
      { result: "INVALID", message: "No payload" } satisfies ScanResponse,
      { status: 200 },
    );
  }

  // Atomic update: only update if status is 'active'
  const { data: updated, error } = await supabase
    .from("tickets")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      used_by: scanner.scannerId,
    })
    .eq("ticket_code", ticketCode)
    .eq("status", "active")
    .select("id, buyer_name, ticket_type")
    .single();

  if (error || !updated) {
    // Check if ticket exists but is already used
    const { data: existing } = await supabase
      .from("tickets")
      .select("id, status, used_at, buyer_name, ticket_type")
      .eq("ticket_code", ticketCode)
      .single();

    if (!existing || existing.status === "cancelled") {
      await supabase.from("scan_log").insert({
        scanner_id: scanner.scannerId,
        result: "INVALID",
        raw_payload: rawPayload,
      });

      return NextResponse.json({
        result: "INVALID",
        message: "Ticket not found or cancelled",
      } satisfies ScanResponse);
    }

    // Already used
    await supabase.from("scan_log").insert({
      ticket_id: existing.id,
      scanner_id: scanner.scannerId,
      result: "ALREADY_USED",
      raw_payload: rawPayload,
    });

    return NextResponse.json({
      result: "ALREADY_USED",
      ticket: {
        buyer_name: existing.buyer_name,
        ticket_type: existing.ticket_type,
        used_at: existing.used_at,
      },
    } satisfies ScanResponse);
  }

  // Success — ticket validated
  await supabase.from("scan_log").insert({
    ticket_id: updated.id,
    scanner_id: scanner.scannerId,
    result: "OK",
    raw_payload: rawPayload,
  });

  return NextResponse.json({
    result: "OK",
    ticket: {
      buyer_name: updated.buyer_name,
      ticket_type: updated.ticket_type,
    },
  } satisfies ScanResponse);
});
