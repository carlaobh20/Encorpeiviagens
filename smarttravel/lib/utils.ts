import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Cabin } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Desconto % de um preço atual frente à média histórica */
export function discountPct(current: number, avg: number): number {
  if (!avg) return 0;
  return Math.round(((avg - current) / avg) * 100);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

const VALID_CABINS: Cabin[] = ["economica", "premium_economy", "executiva", "primeira"];

export interface RouteInput {
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string | null;
  cabin?: string;
  passengers?: number;
  max_points?: number | null;
}

export interface RouteValidation {
  ok: boolean;
  errors: string[];
}

/** Valida os campos de uma rota antes de salvar */
export function validateRoute(input: RouteInput): RouteValidation {
  const errors: string[] = [];
  const origin = (input.origin || "").trim().toUpperCase();
  const destination = (input.destination || "").trim().toUpperCase();
  if (origin.length !== 3) errors.push("Origem deve ter 3 letras (IATA).");
  if (destination.length !== 3) errors.push("Destino deve ter 3 letras (IATA).");
  if (origin === destination && origin.length === 3) errors.push("Origem e destino são iguais.");
  if (!input.departure_date) errors.push("Informe a data de ida.");
  if (input.return_date && input.departure_date && input.return_date < input.departure_date) {
    errors.push("Volta não pode ser antes da ida.");
  }
  if (!input.cabin || !VALID_CABINS.includes(input.cabin as Cabin)) errors.push("Cabine inválida.");
  if (input.passengers != null && (input.passengers < 1 || input.passengers > 9)) {
    errors.push("Passageiros entre 1 e 9.");
  }
  if (input.max_points != null && input.max_points < 0) errors.push("Meta de pontos não pode ser negativa.");
  return { ok: errors.length === 0, errors };
}
