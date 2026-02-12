import { withAxiom } from "@/lib/axiom/server";

export const GET = withAxiom(async function GET() {
  throw new Error("Test error for Axiom");
});
