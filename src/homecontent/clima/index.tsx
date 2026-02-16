"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CityConfig = {
  name: string;
  latitude: number;
  longitude: number;
};

type CityWeather = {
  city: string;
  temperature: number;
  weatherCode: number;
};

type WidgetState = {
  data: CityWeather[];
  loading: boolean;
  error: boolean;
};

const CITIES: CityConfig[] = [
  { name: "Sapporo", latitude: 43.06, longitude: 141.35 },
  { name: "Reikiavik", latitude: 64.15, longitude: -21.94 },
  { name: "Santiago", latitude: -33.45, longitude: -70.67 },
];

/**
 * Devuelve un emoji según el código WMO de condición climática.
 *
 * @param code - Código WMO (0-99).
 * @returns Emoji correspondiente.
 */
function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 67) return "🌨️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "❄️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

/**
 * Construye la URL de la API Open-Meteo para una ciudad.
 *
 * @param city - Configuración de la ciudad con coordenadas.
 * @returns URL completa para el fetch.
 */
function buildApiUrl(city: CityConfig): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code`;
}

/**
 * Widget compacto de clima para el home. Client component que consulta
 * Open-Meteo para Sapporo, Reikiavik y Santiago. Clickeable hacia /projects/clima.
 */
export default function ClimaWidget() {
  const [state, setState] = useState<WidgetState>({
    data: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      CITIES.map(async (city) => {
        const res = await fetch(buildApiUrl(city));
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        return {
          city: city.name,
          temperature: json.current.temperature_2m as number,
          weatherCode: json.current.weather_code as number,
        };
      })
    )
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: false });
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
      <div className="flex flex-col gap-3 h-full min-h-[160px] animate-pulse justify-center">
        {CITIES.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-800" />
            <div className="ml-auto h-5 w-12 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error || state.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[160px]">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm text-zinc-500">Sin datos</p>
      </div>
    );
  }

  return (
    <Link
      href="/projects/clima"
      className="flex flex-col gap-3 h-full min-h-[160px] justify-center transition hover:scale-[1.02]"
    >
      {state.data.map((w) => (
        <div
          key={w.city}
          className="flex items-center gap-3 px-3 py-2"
        >
          <span className="text-2xl">{getWeatherIcon(w.weatherCode)}</span>
          <span className="text-sm text-zinc-300">{w.city}</span>
          <span className="ml-auto font-mono text-lg font-bold text-white">
            {Math.round(w.temperature)}°C
          </span>
        </div>
      ))}
      <span className="text-center text-[10px] uppercase tracking-widest text-fuchsia-500">
        Ver más ciudades →
      </span>
    </Link>
  );
}
