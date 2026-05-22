export type Provider = "latam_pass";
export type Cabin = "economica" | "premium_economy" | "executiva" | "primeira";
export type AlertType =
  | "rare_opportunity"
  | "price_drop"
  | "below_average"
  | "target_reached"
  | "lowest_ever";
export type AlertStatus = "new" | "saved" | "ignored" | "read";
export type Recommendation = "buy_now" | "good_deal" | "monitor" | "expensive";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  latam_points_balance: number;
  points_updated_at: string | null;
  created_at: string;
  updated_at?: string;
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
  notes: string | null;
  is_active: boolean;
  monitor_frequency: string;
  created_at: string;
  updated_at?: string;
  // campos derivados em runtime
  lowest_points?: number;
  current_points?: number;
  avg_points?: number;
  smart_score?: number;
}

export interface FlightSearchResult {
  id: string;
  route_id: string;
  user_id: string;
  provider: Provider;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  cabin: Cabin;
  passengers: number;
  points_price: number;
  cash_taxes: number;
  flight_number: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  airline: string | null;
  booking_url: string | null;
  notes: string | null;
  smart_score: number | null;
  recommendation: Recommendation | null;
  captured_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  route_id: string;
  result_id: string | null;
  type: AlertType;
  title: string;
  message: string;
  points_price: number;
  threshold_points: number | null;
  discount_percentage: number;
  smart_score: number | null;
  status: AlertStatus;
  created_at: string;
}

export interface PricePoint {
  date: string;
  points: number;
}
