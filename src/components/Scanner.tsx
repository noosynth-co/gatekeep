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
        className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
      />
      {!scanning && !error && (
        <div className="text-center text-gray-400 mt-4">
          Starting camera...
        </div>
      )}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mt-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
