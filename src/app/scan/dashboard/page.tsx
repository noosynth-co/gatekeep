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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold">{APP_NAME} <span className="text-gray-500 font-normal">/ Scanner</span></h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <Scanner onResult={handleResult} />
        </div>
        <p className="text-center text-gray-600 text-xs mt-4">
          Point the camera at a ticket QR code
        </p>
      </div>

      {scanResult && (
        <ScanResult result={scanResult} onDismiss={handleDismiss} />
      )}
    </div>
  );
}
