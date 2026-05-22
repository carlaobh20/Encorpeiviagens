import type { Cabin } from "../types";

export interface AwardSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  cabin: Cabin;
  passengers: number;
  /** Sessão criptografada do usuário (opcional, fase 2) */
  encryptedSession?: string | null;
}

export interface AwardFlightResult {
  pointsPrice: number;
  cashTaxes: number;
  airline: string;
  flightNumber: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  bookingUrl: string | null;
  /** Payload bruto do provider (debug) */
  raw?: unknown;
}

export interface ProviderRunDebug {
  /** Caminho local do screenshot, se houver */
  screenshotPath?: string | null;
  /** HTML capturado, se houver */
  htmlPath?: string | null;
}

export interface FlightAwardProvider {
  /** Identificador curto: "mock" | "latam_web" | "manual" */
  name: string;
  /** Nome amigável pra UI */
  label: string;
  /** Se o provider está pronto pra produção */
  isProduction: boolean;
  /**
   * Busca voos em pontos.
   * NUNCA deve lançar erro fora de controle — sempre retornar lista (vazia se falhou)
   * e detalhes de debug.
   */
  searchAwardFlights(
    params: AwardSearchParams,
  ): Promise<{ results: AwardFlightResult[]; debug?: ProviderRunDebug }>;
  /** Saldo da conta do usuário (opcional, fase 2). */
  getAccountBalance?(encryptedSession: string): Promise<number | null>;
}
