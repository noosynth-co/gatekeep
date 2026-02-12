import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  createScannerToken,
  getScannerCookieOptions,
} from "@/lib/scanner-auth";
import bcrypt from "bcryptjs";
import { withAxiom } from "@/lib/axiom/server";

export const POST = withAxiom(async function POST(req: NextRequest) {
  const { scannerId, pin } = await req.json();

  if (!scannerId || !pin) {
    return NextResponse.json(
      { error: "Scanner ID and PIN required" },
      { status: 400 },
    );
  }

  const { data: scanner, error } = await supabase
    .from("scanners")
    .select("id, name, pin_hash, is_active")
    .eq("id", scannerId)
    .single();

  if (error || !scanner || !scanner.is_active) {
    return NextResponse.json(
      { error: "Invalid scanner" },
      { status: 401 },
    );
  }

  const pinValid = await bcrypt.compare(pin, scanner.pin_hash);
  if (!pinValid) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  const token = await createScannerToken(scanner.id, scanner.name);
  const cookieOpts = getScannerCookieOptions();

  const response = NextResponse.json({
    success: true,
    scannerName: scanner.name,
  });

  response.cookies.set(cookieOpts.name, token, cookieOpts);

  return response;
});
