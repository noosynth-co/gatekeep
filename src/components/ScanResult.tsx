"use client";

import { useEffect, useCallback } from "react";
import type { ScanResponse } from "@/types";

interface ScanResultProps {
  result: ScanResponse;
  onDismiss: () => void;
}

export function ScanResult({ result, onDismiss }: ScanResultProps) {
  const isOk = result.result === "OK";
  const isAlreadyUsed = result.result === "ALREADY_USED";

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    // Vibrate
    if (navigator.vibrate) {
      if (isOk) {
        navigator.vibrate(200);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // Auto-dismiss OK after 3s
    if (isOk) {
      const timer = setTimeout(handleDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOk, handleDismiss]);

  // Play sound via Web Audio API
  useEffect(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.3;

      if (isOk) {
        osc.frequency.value = 800;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.value = 300;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not available
    }
  }, [isOk]);

  const bgClass = isOk
    ? "from-emerald-600 to-emerald-700"
    : isAlreadyUsed
      ? "from-amber-500 to-amber-600"
      : "from-red-600 to-red-700";

  const label = isOk
    ? "OK"
    : isAlreadyUsed
      ? "ALREADY USED"
      : "INVALID";

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b ${bgClass} flex flex-col items-center justify-center z-50 cursor-pointer`}
      onClick={handleDismiss}
    >
      <div className="text-white text-center px-6">
        {/* Icon */}
        <div className="mb-6">
          {isOk ? (
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/15 backdrop-blur-sm">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          ) : isAlreadyUsed ? (
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/15 backdrop-blur-sm">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/15 backdrop-blur-sm">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        <div className="text-4xl font-bold mb-6 tracking-wide">{label}</div>

        {result.ticket && (
          <div className="space-y-2 text-xl">
            {result.ticket.buyer_name && (
              <div className="font-medium">{result.ticket.buyer_name}</div>
            )}
            <div className="opacity-80">{result.ticket.ticket_type}</div>
            {result.ticket.used_at && (
              <div className="text-sm opacity-60 mt-4">
                Used at: {new Date(result.ticket.used_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {result.message && !result.ticket && (
          <div className="text-lg opacity-80">{result.message}</div>
        )}

        <div className="mt-12 text-sm opacity-40">
          {isOk ? "Auto-dismissing in 3s..." : "Tap anywhere to dismiss"}
        </div>
      </div>
    </div>
  );
}
