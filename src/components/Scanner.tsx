"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { ScanResponse } from "@/types";

interface ScannerProps {
  onResult: (result: ScanResponse) => void;
}

export function Scanner({ onResult }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const res = await fetch("/api/scan/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: decodedText }),
        });

        if (res.status === 401) {
          window.location.href = "/scan";
          return;
        }

        const data: ScanResponse = await res.json();
        onResult(data);
      } catch {
        onResult({ result: "INVALID", message: "Connection error" });
      } finally {
        setTimeout(() => {
          processingRef.current = false;
        }, 1000);
      }
    },
    [onResult],
  );

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScan,
        () => {},
      )
      .then(() => setScanning(true))
      .catch((err) => {
        console.error("Camera error:", err);
        setError(
          "Camera access denied. Please allow camera access and reload.",
        );
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [handleScan]);

  return (
    <div className="relative">
      <div
        id="qr-reader"
        className="w-full max-w-md mx-auto overflow-hidden"
      />
      {!scanning && !error && (
        <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm py-16">
          <svg className="w-4 h-4 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Starting camera...
        </div>
      )}
      {error && (
        <div className="m-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
