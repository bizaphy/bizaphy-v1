"use client";

import { useEffect, useState } from "react";

type CityConfig = {
  name: string;
  latitude: number;
  longitude: number;
  wikipediaSlug: string;
};

type WeatherData = {
  city: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  wikipediaSlug: string;
};

type FetchState = {
  data: WeatherData[];
  loading: boolean;
  error: string | null;
};

const CITIES: CityConfig[] = [
  { name: "Sapporo", latitude: 43.06, longitude: 141.35, wikipediaSlug: "Sapporo" },
  { name: "Reikiavik", latitude: 64.15, longitude: -21.94, wikipediaSlug: "Reykjav%C3%ADk" },
  { name: "Santiago", latitude: -33.45, longitude: -70.67, wikipediaSlug: "Santiago" },
  { name: "Tokio", latitude: 35.68, longitude: 139.69, wikipediaSlug: "Tokyo" },
  { name: "Londres", latitude: 51.51, longitude: -0.13, wikipediaSlug: "London" },
  { name: "Lima", latitude: -12.05, longitude: -77.04, wikipediaSlug: "Lima" },
  { name: "Moscú", latitude: 55.76, longitude: 37.62, wikipediaSlug: "Moscow" },
  { name: "Pekín", latitude: 39.91, longitude: 116.39, wikipediaSlug: "Beijing" },
  { name: "Puerto Williams", latitude: -54.94, longitude: -67.61, wikipediaSlug: "Puerto_Williams" },
  { name: "Perth", latitude: -31.95, longitude: 115.86, wikipediaSlug: "Perth" },
  { name: "Johannesburgo", latitude: -26.20, longitude: 28.03, wikipediaSlug: "Johannesburg" },
  { name: "Sofía", latitude: 42.70, longitude: 23.32, wikipediaSlug: "Sofia" },
  { name: "Damasco", latitude: 33.51, longitude: 36.29, wikipediaSlug: "Damascus" },
  { name: "Hanga Roa", latitude: -27.15, longitude: -109.43, wikipediaSlug: "Hanga_Roa" },
  { name: "Jakarta", latitude: -6.21, longitude: 106.85, wikipediaSlug: "Jakarta" },
  { name: "Bilbao", latitude: 43.26, longitude: -2.93, wikipediaSlug: "Bilbao" },
];

/**
 * Devuelve un emoji representando la condición climática según el código WMO.
 *
 * @param code - Código WMO de condición climática (0-99).
 * @returns Emoji correspondiente al código.
 *
 * @example
 * ```ts
 * getWeatherIcon(0);  // "☀️"
 * getWeatherIcon(61); // "🌧️"
 * ```
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
 * Devuelve una descripción textual de la condición climática según el código WMO.
 *
 * @param code - Código WMO de condición climática (0-99).
 * @returns Descripción de la condición.
 */
function getWeatherLabel(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Niebla";
  if (code <= 57) return "Llovizna";
  if (code <= 65) return "Lluvia";
  if (code <= 67) return "Lluvia helada";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 86) return "Nieve intensa";
  if (code <= 99) return "Tormenta";
  return "Desconocido";
}

/**
 * Construye la URL de la API Open-Meteo para una ciudad.
 *
 * @param city - Configuración de la ciudad con coordenadas.
 * @returns URL completa para el fetch.
 */
function buildApiUrl(city: CityConfig): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m`;
}

/**
 * Obtiene datos climáticos de Open-Meteo para todas las ciudades configuradas.
 *
 * @param cities - Array de ciudades a consultar.
 * @returns Array de WeatherData con temperatura, código climático y viento de cada ciudad.
 */
async function fetchCities(cities: CityConfig[]): Promise<WeatherData[]> {
  const results = await Promise.all(
    cities.map(async (city) => {
      const res = await fetch(buildApiUrl(city));
      if (!res.ok) throw new Error(`Error al obtener clima de ${city.name}`);
      const json = await res.json();
      return {
        city: city.name,
        temperature: json.current.temperature_2m as number,
        weatherCode: json.current.weather_code as number,
        windSpeed: json.current.wind_speed_10m as number,
        wikipediaSlug: city.wikipediaSlug,
      };
    })
  );
  return results;
}

/**
 * Dashboard de clima en tiempo real. Client component que consulta la API
 * Open-Meteo y muestra datos de 8 ciudades del mundo.
 */
export default function WeatherDashboard() {
  const [state, setState] = useState<FetchState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchCities(CITIES)
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CITIES.map((c) => (
          <div
            key={c.name}
            className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="mb-4 h-5 w-24 rounded bg-zinc-800" />
            <div className="mb-3 h-10 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-800" />
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
            fetchCities(CITIES)
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {state.data.map((weather) => (
        <a
          key={weather.city}
          href={`https://en.wikipedia.org/wiki/${weather.wikipediaSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Ver ${weather.city} en Wikipedia (EN)`}
          className="block rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
            {weather.city}
          </h3>

          <div className="mb-3 flex items-center gap-3">
            <span className="text-4xl">{getWeatherIcon(weather.weatherCode)}</span>
            <span className="font-mono text-4xl font-bold text-white">
              {Math.round(weather.temperature)}°C
            </span>
          </div>

          <p className="text-sm text-zinc-400">
            {getWeatherLabel(weather.weatherCode)}
          </p>

          <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3">
            <span className="text-xs text-zinc-500">Viento</span>
            <span className="font-mono text-sm text-zinc-300">
              {weather.windSpeed} km/h
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
