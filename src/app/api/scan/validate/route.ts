import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyQRPayload } from "@/lib/qr";
import { verifyScannerToken } from "@/lib/scanner-auth";
import type { ScanResponse } from "@/types";

export async function POST(req: NextRequest) {
  const scanner = await verifyScannerToken();
  if (!scanner) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { payload } = await req.json();

  if (!payload || typeof payload !== "string") {
    return NextResponse.json(
      { result: "INVALID", message: "No payload" } satisfies ScanResponse,
      { status: 200 },
    );
  }

  // Verify HMAC
  const { valid, ticketCode } = verifyQRPayload(payload);

  if (!valid || !ticketCode) {
    // Log invalid scan
    await supabase.from("scan_log").insert({
      scanner_id: scanner.scannerId,
      result: "INVALID",
      raw_payload: payload.substring(0, 500),
    });

    return NextResponse.json({
      result: "INVALID",
      message: "Invalid QR code",
    } satisfies ScanResponse);
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
        raw_payload: payload.substring(0, 500),
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
      raw_payload: payload.substring(0, 500),
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
    raw_payload: payload.substring(0, 500),
  });

  return NextResponse.json({
    result: "OK",
    ticket: {
      buyer_name: updated.buyer_name,
      ticket_type: updated.ticket_type,
    },
  } satisfies ScanResponse);
}
