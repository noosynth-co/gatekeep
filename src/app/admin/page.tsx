"use client";

import { useState, useEffect, useCallback } from "react";
import { APP_NAME } from "@/lib/constants";

interface ScannerItem {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [scanners, setScanners] = useState<ScannerItem[]>([]);
  const [loadingScanners, setLoadingScanners] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchScanners = useCallback(async () => {
    setLoadingScanners(true);
    try {
      const res = await fetch("/api/admin/scanners");
      if (res.status === 401) {
        setLoggedIn(false);
        return;
      }
      const data = await res.json();
      setScanners(data);
    } catch {
      // ignore
    } finally {
      setLoadingScanners(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) fetchScanners();
  }, [loggedIn, fetchScanners]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setLoggedIn(true);
        setPassword("");
      } else {
        const data = await res.json();
        setLoginError(data.error || "Login failed");
      }
    } catch {
      setLoginError("Connection error");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/scanners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, pin: newPin }),
      });

      if (res.ok) {
        setNewName("");
        setNewPin("");
        fetchScanners();
      } else {
        const data = await res.json();
        setAddError(data.error || "Failed to add scanner");
      }
    } catch {
      setAddError("Connection error");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this scanner?")) return;
    setDeletingId(id);

    try {
      await fetch(`/api/admin/scanners/${id}`, { method: "DELETE" });
      fetchScanners();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-gray-400 mt-2">Admin Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 text-center border-b border-gray-700">
        <h1 className="text-xl font-bold">{APP_NAME} Admin</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Add scanner form */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add Scanner</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Main Entrance"
                required
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">PIN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4-6 digit PIN"
                required
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {addError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm text-center">
                {addError}
              </div>
            )}

            <button
              type="submit"
              disabled={addLoading || !newName || newPin.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {addLoading ? "Adding..." : "Add Scanner"}
            </button>
          </form>
        </div>

        {/* Scanner list */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scanners</h2>
            {loadingScanners && (
              <span className="text-sm text-gray-400">Loading...</span>
            )}
          </div>

          {scanners.length === 0 && !loadingScanners ? (
            <p className="text-gray-500 text-center py-4">No scanners yet</p>
          ) : (
            <div className="space-y-3">
              {scanners.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    s.is_active ? "bg-gray-700" : "bg-gray-700/50"
                  }`}
                >
                  <div>
                    <span
                      className={`font-medium ${
                        s.is_active ? "text-white" : "text-gray-500 line-through"
                      }`}
                    >
                      {s.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(s.created_at).toLocaleDateString()}
                      {!s.is_active && " — inactive"}
                    </p>
                  </div>
                  {s.is_active && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-400/30 hover:border-red-400/60 transition-colors disabled:opacity-50"
                    >
                      {deletingId === s.id ? "..." : "Delete"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
