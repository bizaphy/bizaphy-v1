"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CityZone = {
  name: string;
  timezone: string;
};

const CITIES: CityZone[] = [
  { name: "CDMX", timezone: "America/Mexico_City" },
  { name: "NYC", timezone: "America/New_York" },
  { name: "Londres", timezone: "Europe/London" },
  { name: "Tokio", timezone: "Asia/Tokyo" },
];

/**
 * Formatea la hora actual para una zona horaria dada.
 *
 * @param timezone - Identificador IANA de zona horaria.
 * @returns Hora formateada en HH:MM.
 */
function formatTime(timezone: string): string {
  return new Date().toLocaleTimeString("es-CL", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Widget compacto de hora mundial para el home. Client component que muestra
 * la hora en tiempo real de 4 ciudades, actualizándose cada segundo.
 * Clickeable hacia /projects/hora-mundial.
 */
export default function HoraMundialWidget() {
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
    <Link
      href="/projects/hora-mundial"
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center transition hover:scale-[1.02]"
    >
      {CITIES.map((city) => (
        <div key={city.name}>
          <p className="font-mono text-lg font-bold text-white">
            {times[city.name] ?? "--:--"}
          </p>
          <p className="text-xs text-zinc-500">{city.name}</p>
        </div>
      ))}
      <span className="col-span-2 sm:col-span-4 text-center text-[10px] uppercase tracking-widest text-fuchsia-500">
        Ver más ciudades →
      </span>
    </Link>
  );
}
