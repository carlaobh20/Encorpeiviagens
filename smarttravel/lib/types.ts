export type Provider = "latam_pass";
export type Cabin = "economica" | "premium_economy" | "executiva" | "primeira";
export type AlertType = "rare_opportunity" | "price_drop" | "below_average" | "target_reached";
export type AlertStatus = "new" | "saved" | "ignored";
export type SessionStatus = "connected" | "disconnected" | "expired" | "not_connected";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface LoyaltyAccount {
  id: string;
  user_id: string;
  provider: Provider;
  account_email: string | null;
  points_balance: number;
  encrypted_session?: string | null;
  session_status: SessionStatus;
  last_sync_at: string | null;
  created_at: string;
}

export interface MonitoredRoute {
  id: string;
  user_id: string;
  provider: Provider;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  cabin: Cabin;
  passengers: number;
  max_points: number;
  is_active: boolean;
  monitor_frequency: string;
  created_at: string;
  // campos derivados (não persistidos) para a UI
  lowest_points?: number;
  current_points?: number;
  avg_points?: number;
}

export interface FlightSearchResult {
  id: string;
  route_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  cabin: Cabin;
  points_price: number;
  cash_taxes: number;
  flight_number: string;
  airline: string;
  booking_url: string;
  captured_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  route_id: string;
  type: AlertType;
  title: string;
  message: string;
  points_price: number;
  threshold_points: number | null;
  discount_percentage: number;
  status: AlertStatus;
  created_at: string;
}

export interface PricePoint {
  date: string;
  points: number;
}
