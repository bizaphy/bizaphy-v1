"use client";

import { useEffect, useState } from "react";

type MarketQuote = {
  label: string;
  symbol: string;
  price: number;
  changePercent: number;
};

type FetchState = {
  data: MarketQuote[];
  loading: boolean;
  error: string | null;
};

/**
 * Formatea un precio numérico a formato USD.
 *
 * @param price - Precio a formatear.
 * @param decimals - Cantidad de decimales.
 * @returns Precio formateado con separador de miles.
 */
function formatPrice(price: number, decimals: number): string {
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Obtiene los datos del mercado desde el Route Handler /api/market.
 *
 * @returns Array de cotizaciones del mercado.
 */
async function fetchMarket(): Promise<MarketQuote[]> {
  const res = await fetch("/api/market");
  if (!res.ok) throw new Error("Error al obtener datos del mercado");
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
}

/**
 * Dashboard de mercados financieros. Client component que muestra precios
 * en tiempo real de BTC, S&P 500 y NASDAQ via Yahoo Finance.
 */
export default function MarketDashboard() {
  const [state, setState] = useState<FetchState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchMarket()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({ data: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="mb-4 h-5 w-24 rounded bg-zinc-800" />
            <div className="mb-3 h-10 w-32 rounded bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-zinc-950 p-6 text-center">
        <p className="text-red-400">{state.error}</p>
        <button
          onClick={() => {
            setState({ data: [], loading: true, error: null });
            fetchMarket()
              .then((data) => setState({ data, loading: false, error: null }))
              .catch((err: Error) =>
                setState({ data: [], loading: false, error: err.message })
              );
          }}
          className="mt-4 rounded-lg border border-fuchsia-500 bg-black px-4 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {state.data.map((quote) => {
        const isPositive = quote.changePercent >= 0;
        const decimals = quote.label === "BTC" ? 0 : 2;

        return (
          <article
            key={quote.label}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
              {quote.label}
            </h3>

            <p className="mb-2 font-mono text-3xl font-bold text-white">
              {formatPrice(quote.price, decimals)}
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
                {quote.changePercent.toFixed(2)}%
              </span>
            </div>

            <p className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
              Fuente: Yahoo Finance
            </p>
          </article>
        );
      })}
    </div>
  );
}
