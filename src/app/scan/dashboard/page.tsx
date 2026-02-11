"use client";

import { useState, useCallback } from "react";
import { Scanner } from "@/components/Scanner";
import { ScanResult } from "@/components/ScanResult";
import type { ScanResponse } from "@/types";
import { APP_NAME } from "@/lib/constants";

export default function ScanDashboardPage() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  const handleResult = useCallback((result: ScanResponse) => {
    setScanResult(result);
  }, []);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
  }, []);

  return (
    <div className="flex-1 bg-[#0a0a0a] text-white">
      <header className="border-b border-border bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold">{APP_NAME} <span className="text-neutral-500 font-normal">/ Scanner</span></h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl overflow-hidden">
          <Scanner onResult={handleResult} />
        </div>
        <p className="text-center text-neutral-600 text-xs mt-4">
          Point the camera at a ticket QR code
        </p>
      </div>

      {scanResult && (
        <ScanResult result={scanResult} onDismiss={handleDismiss} />
      )}
    </div>
  );
}
