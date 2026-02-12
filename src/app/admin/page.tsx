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
  const [addSuccess, setAddSuccess] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [resetPinId, setResetPinId] = useState<string | null>(null);
  const [resetPinValue, setResetPinValue] = useState("");
  const [resetPinLoading, setResetPinLoading] = useState(false);
  const [resetPinSuccess, setResetPinSuccess] = useState<string | null>(null);

  const fetchScanners = useCallback(async () => {
    setLoadingScanners(true);
    try {
      const res = await fetch("/api/admin/scanners");
      if (res.status === 401) {
        setLoggedIn(false);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setScanners(data);
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
    setAddSuccess("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/scanners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, pin: newPin }),
      });

      if (res.ok) {
        const created = await res.json();
        setAddSuccess(`"${created.name}" added`);
        setNewName("");
        setNewPin("");
        fetchScanners();
        setTimeout(() => setAddSuccess(""), 3000);
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"?`)) return;
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

  async function handleResetPin(id: string) {
    setResetPinLoading(true);
    try {
      const res = await fetch(`/api/admin/scanners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: resetPinValue }),
      });
      if (res.ok) {
        setResetPinId(null);
        setResetPinValue("");
        setResetPinSuccess(id);
        setTimeout(() => setResetPinSuccess(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setResetPinLoading(false);
    }
  }

  const activeCount = scanners.filter((s) => s.is_active).length;
  const inactiveCount = scanners.filter((s) => !s.is_active).length;

  if (!loggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-neutral-500 text-sm mt-1.5">Admin Panel</p>
          </div>

          <div className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl p-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full bg-surface-light text-white rounded-xl px-4 py-3 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all placeholder:text-neutral-600"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full bg-accent hover:bg-accent-dark disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-3 rounded-xl transition-all"
              >
                {loginLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] text-white">
      <header className="border-b border-border bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold">{APP_NAME} <span className="text-neutral-500 font-normal">/ Admin</span></h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>{activeCount} active</span>
            {inactiveCount > 0 && (
              <span className="text-neutral-600">{inactiveCount} inactive</span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold">New Scanner</h2>
          </div>

          <form onSubmit={handleAdd} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Main Entrance"
                  required
                  className="w-full bg-surface-light text-white rounded-xl px-4 py-2.5 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all placeholder:text-neutral-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">PIN</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="4-6 digits"
                  required
                  className="w-full bg-surface-light text-white rounded-xl px-4 py-2.5 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all placeholder:text-neutral-600 text-sm font-mono tracking-widest"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addLoading || !newName || newPin.length < 4}
                  className="w-full sm:w-auto bg-accent hover:bg-accent-dark disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  {addLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            {addError && (
              <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {addError}
              </div>
            )}

            {addSuccess && (
              <div className="mt-3 flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {addSuccess}
              </div>
            )}
          </form>
        </section>

        <section className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5Z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold">Scanners</h2>
            </div>
            {loadingScanners && (
              <svg className="w-4 h-4 text-neutral-500 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          {scanners.length === 0 && !loadingScanners ? (
            <div className="px-6 py-12 text-center">
              <p className="text-neutral-500 text-sm">No scanners yet</p>
              <p className="text-neutral-600 text-xs mt-1">Add one using the form above</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {scanners.map((s) => (
                <div
                  key={s.id}
                  className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                    s.is_active ? "hover:bg-surface-light/50" : "opacity-50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${s.is_active ? "bg-accent" : "bg-neutral-600"}`} />
                      <span className={`font-medium text-sm truncate ${s.is_active ? "text-white" : "text-neutral-500 line-through"}`}>
                        {s.name}
                      </span>
                      {!s.is_active && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 bg-neutral-800 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 ml-[18px] font-mono">
                      {s.id.slice(0, 8)} &middot; {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {s.is_active && (
                    <div className="flex items-center gap-1 shrink-0">
                      {resetPinSuccess === s.id && (
                        <span className="text-accent text-xs mr-1">PIN updated</span>
                      )}
                      {resetPinId === s.id ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleResetPin(s.id); }}
                          className="flex items-center gap-1.5"
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={resetPinValue}
                            onChange={(e) => setResetPinValue(e.target.value.replace(/\D/g, ""))}
                            placeholder="New PIN"
                            autoFocus
                            className="w-20 bg-surface-light text-white rounded-lg px-2.5 py-1.5 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none text-xs font-mono tracking-widest"
                          />
                          <button
                            type="submit"
                            disabled={resetPinLoading || resetPinValue.length < 4}
                            className="text-xs font-medium text-accent hover:text-accent-dark disabled:text-neutral-600 px-2 py-1.5 rounded-lg hover:bg-accent/10 transition-all"
                          >
                            {resetPinLoading ? "..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setResetPinId(null); setResetPinValue(""); }}
                            className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1.5 rounded-lg hover:bg-surface-light transition-all"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => { setResetPinId(s.id); setResetPinValue(""); setResetPinSuccess(null); }}
                          className="text-neutral-500 hover:text-accent p-2 rounded-lg hover:bg-accent/10 transition-all"
                          title="Reset PIN"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deletingId === s.id}
                        className="shrink-0 text-neutral-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                        title="Deactivate scanner"
                      >
                        {deletingId === s.id ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
