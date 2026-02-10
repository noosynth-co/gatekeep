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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 text-center border-b border-gray-700">
        <h1 className="text-xl font-bold">{APP_NAME} Scanner</h1>
      </div>

      <div className="p-4">
        <Scanner onResult={handleResult} />
        <p className="text-center text-gray-500 text-sm mt-4">
          Point the camera at a ticket QR code
        </p>
      </div>

      {scanResult && (
        <ScanResult result={scanResult} onDismiss={handleDismiss} />
      )}
    </div>
  );
}
