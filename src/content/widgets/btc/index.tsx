"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MarketQuote = {
  label: string;
  price: number;
  changePercent: number;
};

type WidgetState = {
  data: MarketQuote[];
  loading: boolean;
  error: boolean;
};

/**
 * Formatea un precio numérico a formato USD compacto.
 *
 * @param price - Precio a formatear.
 * @param decimals - Cantidad de decimales.
 * @returns Precio formateado con separador de miles.
 *
 * @example
 * ```ts
 * formatPrice(97432.1, 0); // "$97,432"
 * formatPrice(5234.56, 2); // "$5,234.56"
 * ```
 */
function formatPrice(price: number, decimals: number): string {
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Widget compacto de mercados para el home. Client component que consulta
 * /api/market para BTC, S&P 500 y NASDAQ. Clickeable hacia /projects/mercados.
 */
export default function BtcWidget() {
  const [state, setState] = useState<WidgetState>({
    data: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/market")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setState({ data: json.data, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: [], loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-zinc-800" />
            <div className="h-5 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error || state.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm text-zinc-500">Sin datos</p>
      </div>
    );
  }

  return (
    <Link
      href="/projects/mercados"
      className="flex flex-col gap-3 transition hover:scale-[1.02]"
    >
      {state.data.map((q) => (
        <div key={q.label} className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">{q.label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white">
              {formatPrice(q.price, q.label === "BTC" ? 0 : 2)}
            </span>
            <span
              className={`text-xs font-mono ${q.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {q.changePercent >= 0 ? "+" : ""}
              {q.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
      <span className="text-center text-[10px] uppercase tracking-widest text-fuchsia-500">
        Ver más →
      </span>
    </Link>
  );
}
