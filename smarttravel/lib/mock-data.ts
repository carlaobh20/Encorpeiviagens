import type {
  UserProfile, LoyaltyAccount, MonitoredRoute, Alert, PricePoint,
} from "./types";

export const MOCK_USER: UserProfile = {
  id: "u1",
  user_id: "u1",
  full_name: "Carlos Mendes",
  avatar_url: null,
  created_at: "2026-01-10T10:00:00Z",
};

export const MOCK_ACCOUNT: LoyaltyAccount = {
  id: "la1",
  user_id: "u1",
  provider: "latam_pass",
  account_email: "carlos@email.com",
  points_balance: 128430,
  session_status: "connected",
  last_sync_at: new Date(Date.now() - 12 * 60000).toISOString(),
  created_at: "2026-01-10T10:00:00Z",
};

export const MOCK_ROUTES: MonitoredRoute[] = [
  {
    id: "r1", user_id: "u1", provider: "latam_pass",
    origin: "GRU", destination: "MIA", departure_date: "2026-09-14", return_date: "2026-09-28",
    cabin: "executiva", passengers: 1, max_points: 60000, is_active: true,
    monitor_frequency: "5m", created_at: "2026-04-01T10:00:00Z",
    lowest_points: 35200, current_points: 38900, avg_points: 72000,
  },
  {
    id: "r2", user_id: "u1", provider: "latam_pass",
    origin: "GRU", destination: "MAD", departure_date: "2026-08-12", return_date: null,
    cabin: "executiva", passengers: 1, max_points: 90000, is_active: true,
    monitor_frequency: "5m", created_at: "2026-04-03T10:00:00Z",
    lowest_points: 68000, current_points: 74000, avg_points: 178000,
  },
  {
    id: "r3", user_id: "u1", provider: "latam_pass",
    origin: "GIG", destination: "LIS", departure_date: "2026-09-03", return_date: "2026-09-20",
    cabin: "economica", passengers: 2, max_points: 50000, is_active: true,
    monitor_frequency: "1h", created_at: "2026-04-05T10:00:00Z",
    lowest_points: 38000, current_points: 41200, avg_points: 51000,
  },
  {
    id: "r4", user_id: "u1", provider: "latam_pass",
    origin: "BSB", destination: "SCL", departure_date: "2026-07-22", return_date: null,
    cabin: "premium_economy", passengers: 1, max_points: 40000, is_active: false,
    monitor_frequency: "6h", created_at: "2026-04-08T10:00:00Z",
    lowest_points: 28000, current_points: 33500, avg_points: 31000,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a1", user_id: "u1", route_id: "r2", type: "rare_opportunity",
    title: "🔥 Oportunidade rara encontrada",
    message: "GRU → MAD em Executiva por 74.000 pts — 58% abaixo da média histórica.",
    points_price: 74000, threshold_points: 90000, discount_percentage: 58,
    status: "new", created_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "a2", user_id: "u1", route_id: "r1", type: "below_average",
    title: "💎 Encontramos ouro",
    message: "GRU → MIA em Executiva por 38.900 pts — 46% abaixo da média.",
    points_price: 38900, threshold_points: 60000, discount_percentage: 46,
    status: "new", created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "a3", user_id: "u1", route_id: "r3", type: "price_drop",
    title: "📉 Preço caiu",
    message: "GIG → LIS em Econômica caiu para 41.200 pts (queda de 19%).",
    points_price: 41200, threshold_points: 50000, discount_percentage: 19,
    status: "saved", created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
];

/** Série histórica de preço em pontos para a rota GRU→MIA (gráfico) */
export const MOCK_PRICE_HISTORY: PricePoint[] = [
  { date: "01/04", points: 71000 }, { date: "06/04", points: 69500 },
  { date: "11/04", points: 74000 }, { date: "16/04", points: 70000 },
  { date: "21/04", points: 66000 }, { date: "26/04", points: 62000 },
  { date: "01/05", points: 58000 }, { date: "06/05", points: 49000 },
  { date: "11/05", points: 45000 }, { date: "16/05", points: 41000 },
  { date: "21/05", points: 38900 },
];
