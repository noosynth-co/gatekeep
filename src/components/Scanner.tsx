"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { ScanResponse } from "@/types";
import { useLogger } from "@/lib/axiom/client";

interface ScannerProps {
  onResult: (result: ScanResponse) => void;
}

export function Scanner({ onResult }: ScannerProps) {
  const logger = useLogger();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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
      .then(() => {
        setScanning(true);
        try {
          const caps = scanner.getRunningTrackCameraCapabilities();
          if (caps.torchFeature().isSupported()) {
            setTorchSupported(true);
          }
        } catch {
          // torch detection not available
        }
      })
      .catch((err) => {
        logger.error("Camera error", { error: err instanceof Error ? err.message : String(err) });
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

  const toggleTorch = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const torch = scannerRef.current.getRunningTrackCameraCapabilities().torchFeature();
      const next = !torchOn;
      await torch.apply(next);
      setTorchOn(next);
    } catch {
      // torch toggle failed
    }
  }, [torchOn]);

  return (
    <div className="relative">
      <div
        id="qr-reader"
        className="w-full max-w-md mx-auto overflow-hidden"
      />
      {scanning && torchSupported && (
        <button
          type="button"
          onClick={toggleTorch}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            torchOn
              ? "bg-accent text-white"
              : "bg-black/50 text-neutral-400 hover:text-white"
          }`}
          aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
          </svg>
        </button>
      )}
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
