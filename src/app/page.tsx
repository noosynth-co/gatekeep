import { APP_NAME, EVENT } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-4xl font-bold mb-2">{APP_NAME}</h1>
        <p className="text-gray-500 mb-8">Event Ticket System</p>

        <div className="bg-white rounded-lg shadow p-6 mb-6 text-left space-y-2">
          <h2 className="font-semibold text-lg">{EVENT.name}</h2>
          <p className="text-gray-600">{EVENT.date}</p>
          <p className="text-gray-600">{EVENT.venue}</p>
        </div>

        <div className="space-y-3">
          <a
            href="/scan"
            className="block bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Scanner Login
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Ticket purchase is handled externally via Stripe.
        </p>
      </div>
    </div>
  );
}
