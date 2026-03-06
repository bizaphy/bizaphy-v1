import { NextResponse } from "next/server";

type SymbolConfig = {
  symbol: string;
  label: string;
};

type MarketQuote = {
  label: string;
  symbol: string;
  price: number;
  changePercent: number;
};

const SYMBOLS: SymbolConfig[] = [
  { symbol: "BTC-USD", label: "BTC" },
  { symbol: "%5EGSPC", label: "S&P 500" },
  { symbol: "%5EIXIC", label: "NASDAQ" },
];

/**
 * Obtiene el precio y cambio porcentual de un símbolo desde Yahoo Finance.
 *
 * @param cfg - Configuración del símbolo a consultar.
 * @returns Datos del mercado para el símbolo.
 */
async function fetchQuote(cfg: SymbolConfig): Promise<MarketQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cfg.symbol}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance error for ${cfg.label}`);

  const json = await res.json();
  const meta = json.chart.result[0].meta;

  const price: number = meta.regularMarketPrice;
  const previousClose: number = meta.chartPreviousClose;
  const changePercent = ((price - previousClose) / previousClose) * 100;

  return { label: cfg.label, symbol: cfg.symbol, price, changePercent };
}

/**
 * GET /api/market — Devuelve precios actuales de BTC, S&P 500 y NASDAQ
 * usando Yahoo Finance como fuente de datos server-side (evita CORS).
 */
export async function GET() {
  try {
    const data = await Promise.all(SYMBOLS.map(fetchQuote));
    return NextResponse.json({ data }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener datos del mercado" },
      { status: 500 }
    );
  }
}
