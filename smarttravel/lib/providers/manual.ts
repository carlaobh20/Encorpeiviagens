import type { FlightAwardProvider } from "./types";

/**
 * ManualProvider — fallback. Não busca nada; só serve de marcador
 * pra UI mostrar "Adicione preço encontrado" como caminho alternativo.
 */
export const manualProvider: FlightAwardProvider = {
  name: "manual",
  label: "Entrada manual",
  isProduction: true,

  async searchAwardFlights() {
    return { results: [] };
  },
};
