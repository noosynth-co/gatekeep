import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("scanners")
      .select("id, name, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase scanners fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch scanners" },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Admin scanners GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminToken();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, pin } = await req.json();

  if (!name || !pin) {
    return NextResponse.json(
      { error: "Name and PIN required" },
      { status: 400 },
    );
  }

  if (typeof pin !== "string" || pin.length < 4 || pin.length > 6) {
    return NextResponse.json(
      { error: "PIN must be 4-6 digits" },
      { status: 400 },
    );
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const { data, error } = await supabase
    .from("scanners")
    .insert({ name, pin_hash: pinHash })
    .select("id, name, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create scanner" },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
