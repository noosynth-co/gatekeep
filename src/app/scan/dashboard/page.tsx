"use client";

import { useState, useCallback, useRef } from "react";
import { Scanner } from "@/components/Scanner";
import { ScanResult } from "@/components/ScanResult";
import type { ScanResponse } from "@/types";
import { APP_NAME } from "@/lib/constants";

export default function ScanDashboardPage() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleResult = useCallback((result: ScanResponse) => {
    setScanResult(result);
  }, []);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
  }, []);

  const handleManualSubmit = useCallback(async () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/scan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code }),
      });

      if (res.status === 401) {
        window.location.href = "/scan";
        return;
      }

      const data: ScanResponse = await res.json();
      setScanResult(data);
      setManualCode("");
    } catch {
      setScanResult({ result: "INVALID", message: "Connection error" });
    } finally {
      setSubmitting(false);
    }
  }, [manualCode]);

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

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setShowManual((v) => !v);
              if (!showManual) setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="text-accent text-sm hover:underline"
          >
            {showManual ? "Hide manual entry" : "Enter code manually"}
          </button>

          {showManual && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleManualSubmit();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="GK-XXXXXXXX"
                autoCapitalize="characters"
                className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent/50"
              />
              <button
                type="submit"
                disabled={submitting || !manualCode.trim()}
                className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "..." : "Check"}
              </button>
            </form>
          )}
        </div>
      </div>

      {scanResult && (
        <ScanResult result={scanResult} onDismiss={handleDismiss} />
      )}
    </div>
  );
}
