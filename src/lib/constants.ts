export const EVENT = {
  name: "MMA Test Fight #12",
  date: "28 February 2026, 20:00",
  venue: "The O2 Arena, London",
} as const;

export const TICKET_TYPE_MAP: Record<string, string> = {
  price_xxx: "Standard",
  price_yyy: "VIP",
  price_zzz: "Sector A",
};

export const APP_NAME = "GateKeep";
