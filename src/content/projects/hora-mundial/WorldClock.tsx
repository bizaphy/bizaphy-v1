"use client";

import { useEffect, useState } from "react";

type CityZone = {
  name: string;
  timezone: string;
};

const CITIES: CityZone[] = [
  { name: "CDMX", timezone: "America/Mexico_City" },
  { name: "NYC", timezone: "America/New_York" },
  { name: "Londres", timezone: "Europe/London" },
  { name: "Tokio", timezone: "Asia/Tokyo" },
  { name: "Sapporo", timezone: "Asia/Tokyo" },
  { name: "Reikiavik", timezone: "Atlantic/Reykjavik" },
  { name: "Santiago", timezone: "America/Santiago" },
  { name: "Lima", timezone: "America/Lima" },
  { name: "Moscú", timezone: "Europe/Moscow" },
  { name: "Pekín", timezone: "Asia/Shanghai" },
];

/**
 * Formatea la hora actual para una zona horaria dada.
 *
 * @param timezone - Identificador IANA de zona horaria.
 * @returns Hora formateada en HH:MM:SS.
 *
 * @example
 * ```ts
 * formatTime("America/Santiago"); // "14:30:05"
 * ```
 */
function formatTime(timezone: string): string {
  return new Date().toLocaleTimeString("es-CL", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Obtiene la diferencia UTC para una zona horaria.
 *
 * @param timezone - Identificador IANA de zona horaria.
 * @returns String con el offset UTC (ej. "UTC-3").
 */
function getUtcOffset(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value ?? "";
}

/**
 * Dashboard de hora mundial. Client component que muestra la hora en tiempo
 * real de 10 ciudades del mundo, actualizándose cada segundo.
 */
export default function WorldClock() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    /** Actualiza todas las horas. */
    const tick = () => {
      const updated: Record<string, string> = {};
      for (const city of CITIES) {
        updated[city.name] = formatTime(city.timezone);
      }
      setTimes(updated);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CITIES.map((city) => (
        <article
          key={city.name}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
            {city.name}
          </h3>

          <p className="font-mono text-2xl font-bold text-white">
            {times[city.name] ?? "--:--:--"}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {getUtcOffset(city.timezone)}
          </p>
        </article>
      ))}
    </div>
  );
}
