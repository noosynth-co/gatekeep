"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

interface ScannerOption {
  id: string;
  name: string;
}

export default function ScanLoginPage() {
  const router = useRouter();
  const [scanners, setScanners] = useState<ScannerOption[]>([]);
  const [selectedScanner, setSelectedScanner] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingScanners, setLoadingScanners] = useState(true);

  useEffect(() => {
    fetch("/api/scan/scanners")
      .then((res) => res.json())
      .then((data) => {
        setScanners(data);
        setLoadingScanners(false);
      })
      .catch(() => setLoadingScanners(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/scan/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scannerId: selectedScanner, pin }),
      });

      if (res.ok) {
        router.push("/scan/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-gray-400 mt-2">Scanner Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Gate</label>
            {loadingScanners ? (
              <div className="bg-gray-700 rounded-lg p-3 text-gray-400 text-center">
                Loading gates...
              </div>
            ) : (
              <select
                value={selectedScanner}
                onChange={(e) => setSelectedScanner(e.target.value)}
                required
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select gate...</option>
                {scanners.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit PIN"
              required
              className="w-full bg-gray-700 text-white text-center text-2xl tracking-[0.5em] rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedScanner || pin.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
