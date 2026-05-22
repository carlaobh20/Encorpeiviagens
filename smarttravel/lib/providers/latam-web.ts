import type {
  AwardFlightResult,
  AwardSearchParams,
  FlightAwardProvider,
  ProviderRunDebug,
} from "./types";

/**
 * LatamWebProvider — busca pública no site da LATAM via Playwright.
 *
 * Requer Playwright instalado (já está em devDependencies) e Chromium
 * disponível no ambiente (`npx playwright install chromium`).
 *
 * Vercel não suporta headless browser — rode este provider em
 * Railway/Render/local/EC2.
 *
 * Configurável por env:
 *  - LATAM_HEADLESS=true|false  (default true)
 *  - LATAM_DEBUG=true|false     (default false; salva screenshot/html em ./debug/latam)
 *  - LATAM_TIMEOUT_MS=45000
 */
export const latamWebProvider: FlightAwardProvider = {
  name: "latam_web",
  label: "LATAM (busca pública)",
  isProduction: false, // ainda em iteração

  async searchAwardFlights(params: AwardSearchParams) {
    const debug: ProviderRunDebug = {};
    try {
      // Importa Playwright dinamicamente pra não quebrar build serverless
      const { chromium } = await import("playwright");
      const headless = (process.env.LATAM_HEADLESS ?? "true") !== "false";
      const debugMode = process.env.LATAM_DEBUG === "true";
      const timeout = Number(process.env.LATAM_TIMEOUT_MS ?? 45000);

      const browser = await chromium.launch({ headless });
      const context = await browser.newContext({
        locale: "pt-BR",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        viewport: { width: 1366, height: 900 },
      });
      const page = await context.newPage();

      const url = buildSearchUrl(params);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout });

      // Espera resultados ou erro
      await page
        .waitForSelector('[data-test="flight-list"], [class*="flight-card"], [class*="oferta"], text=/nenhum/i', {
          timeout,
        })
        .catch(() => null);

      // Tenta extrair preços em pontos. Os seletores REAIS variam — esta é uma
      // primeira tentativa, ajuste depois de inspecionar a página de busca atual.
      const flights: AwardFlightResult[] = await page.evaluate(() => {
        const out: AwardFlightResult[] = [];
        const cards = document.querySelectorAll<HTMLElement>(
          '[data-test="flight-card"], [class*="flight-card"], [class*="ofertasCard"]',
        );
        cards.forEach((card) => {
          const text = card.innerText || "";
          // Procura "12.345 pts" ou "12345 milhas"
          const ptsMatch = text.match(/([\d.,]+)\s*(?:pts|milhas|points)/i);
          if (!ptsMatch) return;
          const pts = Number(ptsMatch[1].replace(/[.,]/g, ""));
          if (!pts || pts < 1000) return;
          const taxMatch = text.match(/R\$\s?([\d.,]+)/);
          const cash = taxMatch ? Number(taxMatch[1].replace(/\./g, "").replace(",", ".")) : 0;
          const flightNoMatch = text.match(/(LA|JJ|LU)\s?\d{2,4}/i);
          const timeMatches = text.match(/\d{1,2}:\d{2}/g);
          out.push({
            pointsPrice: pts,
            cashTaxes: cash,
            airline: "LATAM",
            flightNumber: flightNoMatch?.[0] ?? null,
            departureTime: timeMatches?.[0] ?? null,
            arrivalTime: timeMatches?.[1] ?? null,
            bookingUrl: location.href,
            raw: { source: "dom_text", text: text.slice(0, 300) },
          });
        });
        return out;
      });

      if (debugMode) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const dir = path.resolve("./debug/latam");
        await fs.mkdir(dir, { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const shot = path.join(dir, `${stamp}-${params.origin}-${params.destination}.png`);
        const html = path.join(dir, `${stamp}-${params.origin}-${params.destination}.html`);
        await page.screenshot({ path: shot, fullPage: true });
        await fs.writeFile(html, await page.content());
        debug.screenshotPath = shot;
        debug.htmlPath = html;
      }

      await browser.close();
      return { results: flights, debug };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[latamWebProvider] erro:", msg);
      return { results: [], debug: { ...debug } };
    }
  },
};

function buildSearchUrl(p: AwardSearchParams): string {
  const u = new URL("https://www.latamairlines.com/br/pt/oferta-voos");
  u.searchParams.set("origin", p.origin);
  u.searchParams.set("destination", p.destination);
  u.searchParams.set("outbound", `${p.departureDate}T00:00:00.000Z`);
  if (p.returnDate) u.searchParams.set("inbound", `${p.returnDate}T00:00:00.000Z`);
  u.searchParams.set("trip", p.returnDate ? "RT" : "OW");
  u.searchParams.set("adt", String(p.passengers));
  u.searchParams.set("chd", "0");
  u.searchParams.set("inf", "0");
  u.searchParams.set("cabin", p.cabin);
  u.searchParams.set("redemption", "true");
  return u.toString();
}
