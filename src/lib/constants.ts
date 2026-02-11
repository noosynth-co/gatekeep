export const EVENT = {
  name: "World Freak Fight League 2",
  date: "February 28, 2026, 20:30",
  venue: "4HP, Pearson St, Wolverhampton, UK",
} as const;

export const TICKET_TYPE_MAP: Record<string, string> = {
  price_xxx: "Standard",
  price_yyy: "VIP",
  price_zzz: "Sector A",
};

export const APP_NAME = "GateKeep";
