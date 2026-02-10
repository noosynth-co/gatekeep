"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Oops</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Generating your ticket...</h1>
          <p className="text-gray-600">This usually takes a few seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your ticket has been generated.</p>
        </div>

        <div className="border-t border-b py-4 my-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Ticket Code</span>
            <span className="font-mono font-bold">{ticket!.ticket_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="font-semibold">{ticket!.ticket_type}</span>
          </div>
          {ticket!.buyer_name && (
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span>{ticket!.buyer_name}</span>
            </div>
          )}
        </div>

        <a
          href={`/api/ticket/${ticket!.id}/pdf`}
          download
          className="block w-full bg-black text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Download PDF Ticket
        </a>

        <p className="text-sm text-gray-500 text-center mt-4">
          A copy has also been sent to your email.
        </p>
      </div>
    </div>
  );
}
