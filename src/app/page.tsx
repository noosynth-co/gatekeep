import Image from "next/image";
import { APP_NAME, EVENT } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center p-8 max-w-lg">
        <Image
          src="/wffl-logo.png"
          alt="World Freak Fight League"
          width={160}
          height={107}
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-4xl font-bold text-white mb-2">{APP_NAME}</h1>
        <p className="text-neutral-500 mb-10">Event Ticket System</p>

        <div className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl p-6 text-left">
          <h2 className="font-semibold text-lg text-white mb-3">{EVENT.name}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <svg className="w-4 h-4 text-accent/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {EVENT.date}
            </div>
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <svg className="w-4 h-4 text-accent/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {EVENT.venue}
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-600 mt-8">
          Already have a ticket? Check your email for the download link.
        </p>
      </div>
    </div>
  );
}
