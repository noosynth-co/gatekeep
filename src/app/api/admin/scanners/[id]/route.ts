import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/admin-auth";
import { withAxiom } from "@/lib/axiom/server";
import bcrypt from "bcryptjs";

export const DELETE = withAxiom(async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdminToken();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("scanners")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to deactivate scanner" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
});

export const PATCH = withAxiom(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdminToken();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { pin } = await req.json();

  if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 6) {
    return NextResponse.json(
      { error: "PIN must be 4-6 digits" },
      { status: 400 },
    );
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const { error } = await supabase
    .from("scanners")
    .update({ pin_hash: pinHash })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update PIN" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
});
