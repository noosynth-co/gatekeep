import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/admin-auth";
import { withAxiom } from "@/lib/axiom/server";

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
