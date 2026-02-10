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

  const bgColor = isOk
    ? "bg-green-500"
    : isAlreadyUsed
      ? "bg-orange-500"
      : "bg-red-600";

  const icon = isOk ? "✓" : isAlreadyUsed ? "⚠" : "✕";

  const label = isOk
    ? "OK"
    : isAlreadyUsed
      ? "ALREADY USED"
      : "INVALID";

  return (
    <div
      className={`fixed inset-0 ${bgColor} flex flex-col items-center justify-center z-50 cursor-pointer`}
      onClick={handleDismiss}
    >
      <div className="text-white text-center">
        <div className="text-[120px] leading-none font-bold mb-4">{icon}</div>
        <div className="text-4xl font-bold mb-6">{label}</div>

        {result.ticket && (
          <div className="space-y-2 text-xl">
            {result.ticket.buyer_name && (
              <div>{result.ticket.buyer_name}</div>
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

        <div className="mt-10 text-sm opacity-50">
          {isOk ? "Auto-dismissing in 3s..." : "Tap to dismiss"}
        </div>
      </div>
    </div>
  );
}
