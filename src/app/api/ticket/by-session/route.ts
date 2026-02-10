import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("id, ticket_code, ticket_type, buyer_name")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Ticket not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
