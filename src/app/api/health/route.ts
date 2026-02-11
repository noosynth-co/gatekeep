export function GET() {
  const start = performance.now();

  return Response.json({
    status: "ok",
    latency_ms: Math.round((performance.now() - start) * 100) / 100,
    timestamp: new Date().toISOString(),
  });
}
