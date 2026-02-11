"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

interface TicketData {
  ticket_code: string;
  ticket_type: string;
  buyer_name: string | null;
  id: string;
}

export default function TicketSuccessPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let attempts = 0;

    async function fetchTicket() {
      try {
        const res = await fetch(
          `/api/ticket/by-session?sessionId=${encodeURIComponent(sessionId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
          setLoading(false);
          clearInterval(interval);
        } else if (res.status === 404) {
          attempts++;
          if (attempts > 30) {
            setError("Ticket generation is taking too long. Please check your email.");
            setLoading(false);
            clearInterval(interval);
          }
        } else {
          setError("Something went wrong.");
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        attempts++;
        if (attempts > 30) {
          setError("Connection error. Please check your email for the ticket.");
          setLoading(false);
          clearInterval(interval);
        }
      }
    }

    fetchTicket();
    interval = setInterval(fetchTicket, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center p-8 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Oops</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center p-8">
          <svg className="w-10 h-10 text-accent animate-spin mx-auto mb-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Generating your ticket...</h1>
          <p className="text-neutral-500">This usually takes a few seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-5">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Payment Successful!</h1>
          <p className="text-neutral-500 text-sm">Your ticket has been generated.</p>
        </div>

        <div className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">{APP_NAME}</span>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Ticket Code</span>
              <span className="font-mono font-bold text-white">{ticket!.ticket_code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</span>
              <span className="font-medium text-white">{ticket!.ticket_type}</span>
            </div>
            {ticket!.buyer_name && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</span>
                <span className="text-white">{ticket!.buyer_name}</span>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <a
              href={`/api/ticket/${ticket!.id}/pdf`}
              download
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF Ticket
            </a>
          </div>
        </div>

        <p className="text-xs text-neutral-600 text-center mt-6">
          A copy has also been sent to your email.
        </p>
      </div>
    </div>
  );
}
