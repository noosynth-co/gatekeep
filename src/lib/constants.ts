export const EVENT = {
  name: "Mecz Polska vs Niemcy",
  date: "15 marca 2026, 18:00",
  venue: "Stadion Narodowy, Warszawa",
} as const;

export const TICKET_TYPE_MAP: Record<string, string> = {
  price_xxx: "Standard",
  price_yyy: "VIP",
  price_zzz: "Sector A",
};

export const APP_NAME = "GateKeep";
