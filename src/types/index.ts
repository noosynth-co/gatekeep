export interface Ticket {
  id: string;
  ticket_code: string;
  ticket_type: string;
  buyer_email: string;
  buyer_name: string | null;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  amount_paid: number;
  currency: string;
  qr_payload: string;
  qr_hmac: string;
  status: "active" | "used" | "cancelled";
  used_at: string | null;
  used_by: string | null;
  email_sent_at: string | null;
  created_at: string;
}

export interface Scanner {
  id: string;
  name: string;
  pin_hash: string;
  is_active: boolean;
  created_at: string;
}

export interface ScanLog {
  id: string;
  ticket_id: string | null;
  scanner_id: string | null;
  result: "OK" | "ALREADY_USED" | "INVALID";
  scanned_at: string;
  raw_payload: string | null;
}

export type ScanResult = "OK" | "ALREADY_USED" | "INVALID";

export interface ScanResponse {
  result: ScanResult;
  ticket?: {
    buyer_name: string | null;
    ticket_type: string;
    used_at?: string | null;
  };
  message?: string;
}

export interface ScannerJWTPayload {
  scannerId: string;
  scannerName: string;
}
