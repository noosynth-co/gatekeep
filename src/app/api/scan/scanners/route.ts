import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAxiom } from "@/lib/axiom/server";

export const GET = withAxiom(async function GET() {
  const { data, error } = await supabase
    .from("scanners")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
});
