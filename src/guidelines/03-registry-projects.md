# Fase 3 — El patrón Registry: sección Projects

En esta fase se introduce **el concepto arquitectónico más importante del proyecto**: el patrón Registry. Se construye la sección **Projects** de punta a punta —metadata, componentes, component map, layout, container/presentational, página lista y página dinámica— y se resuelve la ruta `/projects` que quedaba en 404 desde la [Fase 2](./02-transiciones-efectos.md). Además, como algunos proyectos consumen APIs externas, se introduce la máquina de estados `loading | error | data` y el **Route Handler** como proxy server-side para APIs con CORS restrictivo.

Este patrón se reutilizará en el dashboard de widgets (Fase 5), así que dedicar una fase entera a hacerlo bien vale el esfuerzo.

---

## Objetivo de la fase

Al terminar esta fase:

- Existe la ruta `/projects` con una lista de cards, una por cada proyecto definido en la metadata.
- Existe la ruta dinámica `/projects/[slug]` que renderiza el componente React correspondiente al slug.
- El layout usa `max-w-4xl` (896px) para proyectos con datos densos.
- Hay al menos 3 proyectos implementados: uno con datos estáticos (por ejemplo `tic-tac-toe`), uno que consume una API externa directa (`clima` contra Open-Meteo) y uno que usa un **Route Handler** (`mercados` contra Yahoo Finance a través de `/api/market`).
- El sistema es **mecánico**: añadir un proyecto nuevo es siempre los mismos 3 pasos (componente, metadata, entry en el map).
- La ruta `/projects/[slug]` aplica el template `page-glitch` en lugar de `page-scan` para distinguirse visualmente.
- El Route Handler `GET /api/market` cachea 60 segundos y devuelve BTC, S&P 500 y NASDAQ.

Lo que **no** vamos a tener todavía:

- No hay blog (`/blog` sigue en 404).
- No hay widgets en el home.
- Los proyectos con API no tienen retry con backoff — sólo estados `loading | error | data` mínimos con un botón de reintento.

---

## Estructura de carpetas al final de la fase

Aparecen `src/data/projects.ts`, la carpeta `src/content/projects/`, `src/app/projects/` y `src/app/api/market/`.

```
src/
├── app/
│   ├── api/
│   │   └── market/
│   │       └── route.ts          ← nuevo (Route Handler)
│   ├── projects/                 ← nuevo
│   │   ├── components/           ← componentes propios de la sección
│   │   │   ├── ProjectList.tsx   ← Container: obtiene datos
│   │   │   └── ProjectCard.tsx   ← Presentational: recibe props
│   │   ├── [slug]/
│   │   │   ├── page.tsx          ← página dinámica
│   │   │   └── template.tsx      ← aplica page-glitch
│   │   ├── layout.tsx            ← ancho max-w-4xl
│   │   └── page.tsx              ← página lista
│   ├── layout.tsx                ← sin cambios
│   ├── template.tsx              ← sin cambios (page-scan global)
│   ├── page.tsx                  ← sin cambios
│   └── globals.css               ← sin cambios
├── components/                   ← sin cambios (UI compartida fuera de app/)
│   ├── layout-components/        ← Nav.tsx, Footer.tsx
│   └── effects/                  ← TextScramble.tsx, DigitalRain.tsx, ...
├── data/                         ← datos puros (sin React)
│   └── projects.ts               ← nuevo (metadata: types + array)
└── content/                      ← implementaciones (con React)
    └── projects/                 ← nuevo
        ├── tic-tac-toe/
        │   ├── TicTacToe.tsx
        │   └── index.ts
        ├── clima/
        │   ├── WeatherDashboard.tsx
        │   └── index.ts
        ├── mercados/
        │   ├── MarketDashboard.tsx
        │   └── index.ts
        └── index.ts              ← component map (slug → componente)
```

**Dos ubicaciones distintas para componentes.** `src/components/` (fuera de `app/`) es para UI compartida entre secciones (Nav, Footer, efectos). `src/app/projects/components/` es para componentes que **sólo** usa la sección Projects (`ProjectCard`, `ProjectList`); vivir dentro de la ruta deja claro que no se reutilizan en otro lado.

**`data/` vs `content/`.** `src/data/` guarda metadata pura (arrays, tipos) sin imports de React. `src/content/` guarda las implementaciones React de cada proyecto. La separación permite que la fuente de datos pueda cambiar (array → API → CMS) sin tocar los componentes.

Las carpetas `blog/` y `content/widgets/` siguen sin contenido.

---

## El problema que resuelve el patrón Registry

Sin el patrón, la página lista y la página dinámica tendrían imports hardcodeados y cadenas de `if/else`:

```tsx
// MAL: no usa Registry
import TicTacToe from "@/content/projects/tic-tac-toe";
import WeatherDashboard from "@/content/projects/clima";
import MarketDashboard from "@/content/projects/mercados";

export default function ProjectsPage() {
  return (
    <div>
      <ProjectCard title="Tic Tac Toe" slug="tic-tac-toe" />
      <ProjectCard title="Clima" slug="clima" />
      <ProjectCard title="Mercados" slug="mercados" />
    </div>
  );
}

// Y en [slug]/page.tsx:
if (slug === "tic-tac-toe") return <TicTacToe />;
if (slug === "clima") return <WeatherDashboard />;
if (slug === "mercados") return <MarketDashboard />;
```

Cada proyecto nuevo obligaría a modificar **tres archivos** y añadir código en varios lugares. Es propenso a errores y no escala.

**La solución:** separar la información sobre qué proyectos existen (metadata) de los componentes que los implementan (map), y unirlos con una única página dinámica que funciona para cualquier slug.

---

## Parte 1 — Metadata: `src/data/projects.ts`

### Código completo

```ts
// src/data/projects.ts
// simulador de bdd/api para projects

export type Project = {
  slug: string;
  title: string;
  description: string;
};

export const projects: Project[] = [
  {
    slug: "translation-checker",
    title: "Translation Checker",
    description:
      "Webapp para practicar traducción ES/EN → JP con validación exacta.",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Juego clásico de Tic Tac Toe con estilo Neon.",
  },
  {
    slug: "clima",
    title: "Clima",
    description:
      "Dashboard de clima en tiempo real para Sapporo, Reikiavik y Santiago.",
  },
  {
    slug: "hora-mundial",
    title: "Hora Mundial",
    description:
      "Reloj mundial en tiempo real con 10 ciudades del mundo.",
  },
  {
    slug: "mercados",
    title: "Mercados",
    description:
      "Dashboard de mercados financieros: BTC, S&P 500 y NASDAQ en tiempo real.",
  },
];
```

### Explicación línea por línea

- **`export type Project = { ... }`** — define el contrato de un proyecto. Cualquier objeto que se declare como `Project` debe tener exactamente esos 3 campos. Si mañana falta uno, TypeScript falla en tiempo de compilación (no en runtime).
- **`export const projects: Project[]`** — anotamos el array como `Project[]` para que TypeScript valide cada entrada. Sin la anotación, TS **infiere** el tipo del array y el error sólo aparecería en el lugar donde se consume; con la anotación, el error se marca **en el propio array**, junto a la entrada rota.
- **`slug`** — identificador único del proyecto. Es lo que aparecerá en la URL (`/projects/mercados`) y lo que conecta metadata con componente. Debe ser en `kebab-case` y coincidir exactamente con el nombre de la carpeta en `src/content/projects/`.
- **`title`** — el nombre visible en la card y en el header del proyecto.
- **`description`** — texto corto (1-2 líneas) para la card. Si quisiéramos separar el resumen de la card del texto largo del detalle, añadiríamos un campo `body` opcional.

**Regla fundamental:** este archivo **nunca** importa React ni componentes. Son datos que podrían venir de una API, una base de datos o un CMS. Al mantenerlos separados de React, cambiar la fuente de datos requiere tocar sólo este archivo. El nombre `data/` refleja esa neutralidad; una alternativa sería `db/` si en el futuro se conecta a una base real.

---

## Parte 2 — Component map: `src/content/projects/index.ts`

### Código completo

```ts
// src/content/projects/index.ts
// registry de proyectos

import TranslationChecker from "./translation-checker";
import TicTacToe from "./tic-tac-toe";
import WeatherDashboard from "./clima";
import WorldClock from "./hora-mundial";
import MarketDashboard from "./mercados";

export const projectsMap = {
  "translation-checker": TranslationChecker,
  "tic-tac-toe": TicTacToe,
  "clima": WeatherDashboard,
  "hora-mundial": WorldClock,
  "mercados": MarketDashboard,
};

export type ProjectSlug = keyof typeof projectsMap;
```

### Explicación

- **Cada `import` trae el `default export`** de la carpeta correspondiente (gracias al `index.ts` re-export que veremos más abajo). El nombre local del import es libre: `TicTacToe`, `WeatherDashboard`, `MarketDashboard` — se elige por claridad al leer el objeto.
- **`projectsMap`** es la traducción `slug → componente`. Es lo único que la página dinámica necesita para renderizar cualquier proyecto: dado un slug, devuelve el componente React.
- **Las claves del objeto coinciden exactamente con los `slug` de `projects.ts`**. Esta coincidencia es responsabilidad del programador (TypeScript no la valida automáticamente). Si divergen, la comprobación `if (!ProjectComponent)` de la página dinámica lo detectará en runtime.
- **`ProjectSlug = keyof typeof projectsMap`** — se explica en detalle abajo.

---

## Análisis: `keyof typeof projectsMap`

```ts
export type ProjectSlug = keyof typeof projectsMap;
```

Este tipo se calcula automáticamente:

- **`typeof projectsMap`** — TypeScript infiere el tipo del objeto: `{ "translation-checker": ..., "tic-tac-toe": ..., ... }`.
- **`keyof T`** — devuelve la unión de las claves de `T`.
- **Resultado**: `ProjectSlug` es `"translation-checker" | "tic-tac-toe" | "clima" | "hora-mundial" | "mercados"`.

Ventajas:

- Si mañana se añade `"nuevo-slug"` al objeto, `ProjectSlug` se actualiza sola.
- Si alguien intenta acceder a `projectsMap["no-existe"]`, TypeScript rechaza el código en tiempo de edición.
- No hay que mantener un tipo `ProjectSlug` a mano en paralelo al objeto.

**Regla:** cuando una unión de literales de string refleja las claves de un objeto, siempre se define con `keyof typeof`.

---

## Por qué el slug es un string (y no un ID numérico)

El slug se usa directamente en la URL (`/projects/tic-tac-toe`). Un slug legible mejora el SEO y la experiencia del usuario, que puede entender la URL antes incluso de hacer click. Los IDs numéricos (`/projects/42`) son opacos y obligan a hacer un lookup mental cada vez.

---

## Parte 3 — Estructura de cada proyecto: carpeta + `index.ts`

Cada proyecto vive en su propia carpeta con dos archivos:

```
content/projects/
├── tic-tac-toe/
│   ├── TicTacToe.tsx    ← el componente real
│   └── index.ts         ← re-export
```

**Por qué carpeta y no un archivo suelto.** Un proyecto puede crecer: puede necesitar subcomponentes, datos locales, hooks personalizados. Si empieza como un solo archivo y hay que dividirlo, todos los imports externos apuntando al archivo se rompen. Con una carpeta + `index.ts`, el import externo siempre es `from "./tic-tac-toe"` sin importar cuántos archivos internos tenga.

### `index.ts` — código completo

```ts
// src/content/projects/tic-tac-toe/index.ts
export { default } from "./TicTacToe";
```

**Qué hace.** `export { default } from "./TicTacToe"` es la sintaxis corta de: "toma el `default export` de `./TicTacToe` y re-expórtalo como el `default` de este archivo". Es la razón por la que en el component map podemos escribir `import TicTacToe from "./tic-tac-toe"` sin especificar el archivo interno.

---

## Parte 4 — Proyecto Client Component: `TicTacToe.tsx`

### Código completo

```tsx
// src/content/projects/tic-tac-toe/TicTacToe.tsx
"use client";

import { useState, useCallback } from "react";

type CellValue = "X" | "O" | null;
type Board = CellValue[];

/** Todas las combinaciones de índices que forman una línea ganadora en un tablero 3x3. */
const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function evaluateBoard(board: Board): {
  winner: CellValue;
  line: number[] | null;
} {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const { winner, line: winningLine } = evaluateBoard(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  const handleClick = useCallback(
    (index: number) => {
      if (board[index] || winner) return;

      const newBoard = [...board];
      newBoard[index] = xIsNext ? "X" : "O";
      setBoard(newBoard);
      setXIsNext(!xIsNext);
    },
    [board, xIsNext, winner],
  );

  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }, []);

  const statusText = winner
    ? `Ganador: ${winner}`
    : isDraw
      ? "Empate"
      : `Turno: ${xIsNext ? "X" : "O"}`;

  return (
    <section className="flex flex-col items-center gap-6">
      <h2
        className={`text-2xl font-bold transition ${
          winner
            ? "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]"
            : isDraw
              ? "text-zinc-400"
              : "text-white"
        }`}
      >
        {statusText}
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWinCell = winningLine?.includes(i) ?? false;

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!winner}
              className={`flex h-24 w-24 items-center justify-center rounded-lg border text-3xl font-bold transition
                ${
                  isWinCell
                    ? "border-fuchsia-400 bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.6)]"
                    : cell
                      ? "border-zinc-700 bg-zinc-900 text-fuchsia-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-fuchsia-500 hover:bg-zinc-900 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleReset}
        className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
      >
        Reiniciar
      </button>
    </section>
  );
}
```

### Explicación

- **`"use client"`** — obligatorio: el componente usa `useState` y `onClick`. Sin la directiva, Next.js intentaría ejecutarlo como Server Component y fallaría en build.
- **`CellValue` y `Board`** — tipos que documentan el dominio: una celda es `"X"`, `"O"` o `null` (vacía). El tablero es un array de 9 celdas. Usar tipos con nombre en lugar de repetir `("X" | "O" | null)[]` en cada firma mejora la legibilidad.
- **`WINNING_LINES`** — todas las combinaciones ganadoras del tablero 3×3 (3 horizontales, 3 verticales, 2 diagonales). Se declara fuera del componente para que no se recree en cada render.
- **`evaluateBoard`** — recorre las líneas ganadoras y devuelve el ganador junto con los índices de la línea (para resaltarla visualmente). Devolver `{ winner, line }` como objeto es mejor que devolver sólo `winner`: permite pintar las celdas ganadoras sin recalcular la línea.
- **`useState` con anotación genérica**: `useState<Board>(...)` y `useState<boolean>(true)` — al declarar el tipo, evitamos que TS infiera un tipo demasiado ancho o demasiado estrecho.
- **`useCallback`** en `handleClick` y `handleReset` — estabiliza la referencia de la función entre renders. Aquí no es estrictamente necesario porque no se pasa a componentes memoizados, pero mantiene el hábito.
- **`const newBoard = [...board]`** — el spread crea una copia. Nunca se muta el array original (`board[i] = ...`) porque React compara por referencia y no detectaría el cambio.
- **`winningLine?.includes(i) ?? false`** — encadenamiento opcional (`?.`) por si `winningLine` es `null`, y `?? false` para asegurar un boolean.
- **`disabled={!!cell || !!winner}`** — el `!!` convierte a boolean explícito. Sin esto, `disabled={cell}` daría error de tipos (espera boolean, no `CellValue`).

**Regla:** el estado que se puede **derivar** de otro estado (como `winner`, `isDraw`, `statusText`) se calcula en el render, no se guarda en un `useState`. Menos `useState` = menos bugs de sincronización.

---

## Parte 5 — Proyecto con API real: `WeatherDashboard.tsx`

### Código completo

```tsx
// src/content/projects/clima/WeatherDashboard.tsx
"use client";

import { useEffect, useState } from "react";

type CityConfig = {
  name: string;
  latitude: number;
  longitude: number;
};

type WeatherData = {
  city: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
};

type FetchState = {
  data: WeatherData[];
  loading: boolean;
  error: string | null;
};

const CITIES: CityConfig[] = [
  { name: "Sapporo", latitude: 43.06, longitude: 141.35 },
  { name: "Reikiavik", latitude: 64.15, longitude: -21.94 },
  { name: "Santiago", latitude: -33.45, longitude: -70.67 },
  { name: "Tokio", latitude: 35.68, longitude: 139.69 },
  { name: "Londres", latitude: 51.51, longitude: -0.13 },
  { name: "Lima", latitude: -12.05, longitude: -77.04 },
  { name: "Moscú", latitude: 55.76, longitude: 37.62 },
  { name: "Pekín", latitude: 39.91, longitude: 116.39 },
];

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

function buildApiUrl(city: CityConfig): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m`;
}

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
      };
    })
  );
  return results;
}

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
        <article
          key={weather.city}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
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
        </article>
      ))}
    </div>
  );
}
```

### Explicación

- **Tipos separados por dominio.** `CityConfig` describe la entrada (lo que se pasa a la API), `WeatherData` describe la salida ya normalizada. La API devuelve `json.current.temperature_2m`; el componente trabaja con `weather.temperature`. La normalización aísla al render de la forma exacta del JSON externo — si la API cambia `temperature_2m` por `temp`, se toca `fetchCities` y nada más.
- **`CITIES` fuera del componente.** Es una constante que no depende de props ni estado; declararla fuera evita recrearla en cada render y deja claro que es configuración estática.
- **Funciones auxiliares como top-level.** `getWeatherIcon`, `getWeatherLabel`, `buildApiUrl`, `fetchCities` viven fuera del componente porque son puras (no dependen de hooks). Esto las hace testeables y evita que se rearmen en cada render.
- **`Promise.all(cities.map(...))`** — dispara las 8 peticiones en **paralelo**. Un `for` con `await` dentro las haría **secuenciales** y multiplicaría el tiempo total por 8.
- **Máquina de estados con flags** (`data`, `loading`, `error`). Se ve una **variante alternativa** al patrón de discriminated union: aquí se usa un objeto único con los tres campos. Es más fácil de leer para principiantes pero permite estados imposibles (por ejemplo `loading: true` con `error != null`). Con disciplina en las transiciones (`setState({ data, loading: false, error: null })`) no aparecen esos estados, pero es un contrato manual, no verificado por TypeScript.
  - Ver más abajo la discusión de discriminated union como refinamiento futuro.
- **`let cancelled = false` + cleanup**. Ver "Análisis: el flag `cancelled`" más abajo.
- **Skeleton en `loading`.** En lugar de un spinner, se pintan 8 rectángulos pulsando con `animate-pulse`. Ocupan el mismo espacio que las cards reales, evitando el "salto de layout" cuando llegan los datos.
- **Botón "Reintentar" en `error`.** Duplica la lógica del `useEffect` (misma cadena `fetchCities().then().catch()`). Extraerla a una función `refetch` reutilizable eliminaría la duplicación, pero para 2 usos se mantiene inline para que sea más obvio qué se ejecuta al click.

---

## Análisis: discriminated union como refinamiento del `FetchState`

El código actual usa un objeto plano:

```ts
type FetchState = {
  data: WeatherData[];
  loading: boolean;
  error: string | null;
};
```

Este tipo permite combinaciones inválidas como `{ loading: true, error: "algo", data: [...] }`. Un tipo más estricto sería:

```ts
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "data"; data: WeatherData[] };
```

Con esta unión:
- El campo `message` sólo existe cuando `status === "error"`.
- El campo `data` sólo existe cuando `status === "data"`.
- TypeScript exige manejar las tres ramas (`if state.status === "loading"`, etc.).
- Añadir una cuarta variante (por ejemplo `"stale"`) rompe todos los renders que aún no la manejan — el compilador guía el refactor.

**Regla:** cuando un componente tiene múltiples estados excluyentes, la discriminated union es más segura que los flags booleanos. La versión con flags funciona si se mantiene disciplina, pero delega en el programador lo que TypeScript podría verificar.

---

## Análisis: el flag `cancelled`

```tsx
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
```

**El problema.** Si el usuario navega a otra ruta antes de que las peticiones terminen, los `fetch` siguen en vuelo. Cuando terminan, intentan hacer `setState` sobre un componente que ya fue desmontado. React avisa con un warning y, más importante, se produce un memory leak.

**La solución.** Una variable `cancelled` capturada en el closure del efecto. La función de cleanup la pone a `true` cuando el componente se desmonta. Cuando el `fetch` termina, chequea antes de hacer `setState`.

**Alternativa con `AbortController`.** Más limpio en teoría (cancela el fetch real, no sólo el `setState`), pero requiere que la API `fetch` reciba el signal. Para múltiples fetches en paralelo, el `AbortController` se comparte y todos se abortan de una.

**Regla:** todo `useEffect` con una operación asíncrona que termina con `setState` necesita un flag `cancelled` o un `AbortController`.

---

## Parte 6 — Proyecto con Route Handler: `MarketDashboard.tsx`

### Código completo

```tsx
// src/content/projects/mercados/MarketDashboard.tsx
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

function formatPrice(price: number, decimals: number): string {
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

async function fetchMarket(): Promise<MarketQuote[]> {
  const res = await fetch("/api/market");
  if (!res.ok) throw new Error("Error al obtener datos del mercado");
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
}

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
```

### Explicación

- **`fetch("/api/market")`** — llama al Route Handler propio, **no** a Yahoo Finance directamente. La ruta empieza con `/`, así que se resuelve contra el mismo origen. Sin CORS.
- **`if (json.error) throw new Error(json.error)`** — el Route Handler devuelve `{ error: "..." }` con status 500 si algo falló en el servidor. El cliente detecta esa forma y la propaga como excepción para que el `.catch` la maneje. Sin este chequeo, `json.data` sería `undefined` y el render explotaría.
- **`formatPrice`** — `Number.toLocaleString("en-US")` inserta comas cada 3 dígitos y controla decimales. Se declara fuera del componente porque es pura.
- **`decimals = quote.label === "BTC" ? 0 : 2`** — BTC se muestra como entero (los centavos no aportan a un precio de 5 dígitos), los índices con 2 decimales.
- **`isPositive` + flechas ▲ ▼** — feedback visual redundante (color + símbolo) para no depender sólo del color, que puede ser inaccesible.
- **Mismo patrón de estado y `cancelled`** que `WeatherDashboard`. La consistencia entre proyectos con API es intencional: aprendes un patrón, lo aplicas en todos.

---

## Parte 7 — Route Handler: `src/app/api/market/route.ts`

### Por qué existe

El widget y el proyecto de mercados consumen datos de Yahoo Finance. Pero Yahoo Finance **bloquea con CORS** las peticiones que salen desde el navegador. Un `fetch("https://query1.finance.yahoo.com/...")` directamente desde el cliente falla con "CORS policy: No 'Access-Control-Allow-Origin' header".

**La solución** es un **Route Handler** de Next.js: un endpoint del propio servidor que hace el fetch server-side (sin CORS) y devuelve los datos al cliente. El navegador llama a `/api/market` (mismo dominio, sin CORS) y el servidor llama a Yahoo Finance (sin restricciones).

```
Navegador  ──►  /api/market (Route Handler, mismo origen, sin CORS)
                       │
                       ▼
                Yahoo Finance (server-side, sin restricciones de origen)
```

### Código completo

```ts
// src/app/api/market/route.ts
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
```

### Explicación

- **Ubicación del archivo.** `src/app/api/market/route.ts`. Next.js convierte cualquier carpeta bajo `app/` con un `route.ts` en un endpoint HTTP. La URL sigue la estructura de carpetas: `app/api/market/route.ts` → `/api/market`.
- **`SYMBOLS`** — los símbolos vienen con `%5E` (encoded para `^`) porque `^GSPC` y `^IXIC` necesitan que el caret esté escapado en la URL de Yahoo.
- **`fetchQuote` — una función por símbolo.** Toma un `SymbolConfig`, arma la URL, hace el fetch, extrae precio y cierre anterior, calcula el cambio porcentual y devuelve un `MarketQuote`. La firma `(cfg) => Promise<MarketQuote>` es directamente compatible con `SYMBOLS.map(fetchQuote)`.
- **`headers: { "User-Agent": "Mozilla/5.0" }`** — ver "Análisis: por qué el `User-Agent`" abajo.
- **`next: { revalidate: 60 }`** — ver "Análisis: `next: { revalidate: 60 }`" abajo.
- **`Promise.all(SYMBOLS.map(fetchQuote))`** — 3 peticiones en paralelo. Si cualquiera falla, `Promise.all` rechaza y salta al `catch`.
- **`export async function GET()`** — el nombre del export (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) define el método HTTP que responde. Aquí sólo se maneja `GET`.
- **`NextResponse.json(data, { headers })`** — helper de Next para responder JSON con headers custom.
- **`Cache-Control: public, s-maxage=60, stale-while-revalidate=120`** — instrucciones para caches HTTP intermedios (CDN, proxy). `s-maxage=60`: cachear 60s. `stale-while-revalidate=120`: si el cache tiene una respuesta entre 60 y 180s, servirla igual mientras se revalida en background. En combinación con `next: { revalidate: 60 }`, protege doblemente: Next cachea en servidor **y** los CDN cachean por HTTP.
- **`catch { }` sin capturar `err`** — no lo usamos porque no queremos exponer el error interno al cliente. Se responde un mensaje genérico y se registra el error en logs del servidor (`console.error(err)` sería un buen añadido).

---

## Análisis: `next: { revalidate: 60 }`

```ts
fetch(url, { next: { revalidate: 60 } });
```

Es una extensión de Next.js sobre el `fetch` estándar. Le dice: "cachea la respuesta durante 60 segundos". La siguiente llamada dentro de esos 60 segundos devuelve la respuesta cacheada sin ir a Yahoo Finance de nuevo.

**Por qué importa.**

- **Rendimiento**: si 10 usuarios entran al home en 30 segundos, sólo hay 1 request a Yahoo Finance.
- **Cortesía**: Yahoo Finance no está diseñado para consumo público a alta frecuencia. El cache reduce la presión sobre el endpoint.
- **Precisión**: los precios de acciones cambian cada segundo, pero para un dashboard general 60s de latencia es aceptable.

**Regla:** todo `fetch` server-side a una API externa debería tener un `revalidate` que refleje la frecuencia mínima aceptable de refresco.

---

## Análisis: por qué el `User-Agent` en el header

```ts
headers: { "User-Agent": "Mozilla/5.0" }
```

Yahoo Finance devuelve `403 Forbidden` cuando la petición viene sin `User-Agent` (o con `User-Agent: node-fetch/x.y.z`, que es el default). Mandar un `User-Agent` que suene a navegador evita el bloqueo.

**Este es un workaround frágil.** Yahoo puede cambiar su detección en cualquier momento. En producción se debería usar una API con un SLA (por ejemplo, Alpha Vantage con API key).

---

## Parte 8 — `ProjectCard`: Presentational

### Código completo

```tsx
// src/app/projects/components/ProjectCard.tsx
import Link from "next/link";
import TextScramble from "@/components/effects/TextScramble";

type ProjectCardProps = {
  slug: string;
  title: string;
  description: string;
};

export default function ProjectCard({
  slug,
  title,
  description,
}: ProjectCardProps) {
  return (
    <article className="neon-card">
      <h2 className="text-lg font-semibold neon-card-title">
        <TextScramble text={title} />
      </h2>

      <p className="mt-2 text-sm text-zinc-600 neon-card-text">{description}</p>

      <Link href={`/projects/${slug}`} className="text-sm neon-link">
        Ir al proyecto
      </Link>
    </article>
  );
}
```

### Explicación

- **No importa `projects`.** Recibe los datos por props (`slug`, `title`, `description`) y los renderiza. Nada más. Es la pieza reutilizable del sistema.
- **`Link` en lugar de `<a>`** — el componente de Next hace navegación client-side (sin recarga de página) y prefetch automático de la ruta.
- **`href={`/projects/${slug}`}`** — el slug se interpola en la URL. Si el slug es `"clima"`, el href es `/projects/clima`.
- **`TextScramble` en el título** — cada card decodifica su título con el efecto, aportando ritmo visual al listado.
- **Clases `neon-card`, `neon-card-title`, `neon-card-text`, `neon-link`** — definidas en `@layer components` de `globals.css` (Fase 1). Aquí se aplican; su implementación vive en un solo lugar.

**Regla:** un Presentational component no tiene imports de datos ni hooks; sólo recibe props y devuelve JSX.

---

## Parte 9 — `ProjectList`: Container

### Código completo

```tsx
// src/app/projects/components/ProjectList.tsx
// Container component
// Conecta datos de projects (data/projects) con la UI

import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <ProjectCard
          key={p.slug}
          slug={p.slug}
          title={p.title}
          description={p.description}
        />
      ))}
    </div>
  );
}
```

### Explicación

- **Sabe de dónde vienen los datos** (importa `projects` desde `@/data/projects`) y los pasa a `ProjectCard`. Si mañana cambiamos a fetchear desde una API, sólo se toca este archivo — `ProjectCard` no se entera.
- **`key={p.slug}`** — React necesita una clave estable por elemento en listas. `slug` es único por proyecto y no cambia, así que es perfecto. Nunca usar el índice del array (`map((p, i) => ..., key={i})`) porque si el orden cambia, React se confunde y hace re-mounts innecesarios.
- **Se pasan las tres props explícitas** en lugar de spread (`{...p}`). Es más verboso pero deja claro qué recibe cada componente y evita filtrar campos extra si mañana `Project` gana un `hidden` o similar.
- **`space-y-4`** — utility de Tailwind: aplica `margin-top: 1rem` a todos los hijos excepto el primero. Es equivalente a un `gap: 1rem` en un flex column, pero funciona también en un `div` sin flex.

---

## Análisis: por qué separar Container y Presentational

Si un mismo componente hiciera las dos cosas:

- Cambiar el diseño de la card obligaría a entender también la lógica de datos.
- Cambiar de dónde vienen los datos (array → API) obligaría a modificar el componente que también sabe de estilos.
- Reutilizar la card en otro contexto (por ejemplo, en un buscador que trae los datos de otro lado) sería imposible sin desmontarlo todo.

Al separar:

- `ProjectCard` se puede reutilizar en cualquier contexto que le pase las mismas 3 props.
- `ProjectList` se puede cambiar internamente (por ejemplo, para filtrar, ordenar, o fetchear de una API) sin tocar el diseño de la card.
- Los tests son más simples: `ProjectCard` se testea con props fijas, sin mocks.

**Regla:** cualquier lista de datos = Container que trae + Presentational que muestra.

---

## Parte 10 — Layout de la sección: `src/app/projects/layout.tsx`

### Código completo

```tsx
// src/app/projects/layout.tsx
import { ReactNode } from "react";

type ProjectsLayoutProps = {
  children: ReactNode;
};

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return <div className="mx-auto max-w-4xl px-6 pt-12 pb-20">{children}</div>;
}
```

### Explicación

- **Por qué un layout propio para Projects.** Cada sección puede tener su propio ancho: Projects usa `max-w-4xl` (896px) porque los dashboards con tablas/grids necesitan espacio; Blog podría usar `max-w-3xl` para lectura. Sin este layout, todas las rutas heredarían el ancho del layout raíz.
- **`mx-auto`** — centra el contenedor horizontalmente.
- **`max-w-4xl`** — pone un tope de 896px al ancho.
- **`px-6 pt-12 pb-20`** — padding horizontal 24px, arriba 48px, abajo 80px (más espacio abajo por decisión estética: aleja el contenido del footer).
- **`children: ReactNode`** — el layout envuelve cualquier contenido de rutas hijas (`/projects` y `/projects/[slug]`). El tipo `ReactNode` acepta cualquier cosa renderizable: JSX, strings, arrays, `null`.

**Diferencia con `template.tsx`.** El layout **persiste** entre navegaciones dentro de `/projects/*`; el template se **re-monta**. Si tuviéramos un estado en el layout (por ejemplo, un filtro seleccionado), se mantendría al pasar de `/projects` a `/projects/clima` y de vuelta. Ver más en Fase 2.

---

## Parte 11 — Página lista: `src/app/projects/page.tsx`

### Código completo

```tsx
// src/app/projects/page.tsx
import ProjectList from "./components/ProjectList";

import TextScramble from "@/components/effects/TextScramble";

export default function ProjectsPage() {
  return (
    <main className="relative mx-auto max-w-3xl p-6">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Projects" />
        </h1>

        <p className="mt-2 text-sm opacity-80">
          Proyectos más grandes (a diferencia de /lab).
        </p>

        <section className="mt-6">
          <ProjectList />
        </section>
      </div>
    </main>
  );
}
```

### Explicación

- **Composición mínima.** El trabajo real de datos está en `ProjectList`; esta página sólo compone el hero (título + subtítulo) con la lista.
- **`TextScramble` en el `<h1>`** — el efecto de decodificación se ejecuta al montar la página, dando la sensación de que el título "arranca" cuando llegas.
- **`relative z-10`** — asegura que el contenido queda **sobre** el canvas de `DigitalRain` del layout raíz (que tiene `z-0`). Sin `z-10`, el fondo animado podría cubrir el texto.
- **`max-w-3xl` en `<main>`** — más estrecho que el `max-w-4xl` del layout. Esto es un vestigio: el `main` interno anula el ancho del layout. En un refactor limpio, se dejaría sólo el ancho del layout y el `main` se convertiría en `<section>`.

---

## Parte 12 — Página dinámica: `src/app/projects/[slug]/page.tsx`

### Código completo

```tsx
// src/app/projects/[slug]/page.tsx
import { projects } from "@/data/projects";
import { projectsMap, ProjectSlug } from "@/content/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  // 1) Resolver params
  const params = await props.params;

  // 2) Tipar el slug
  const urlSlug = params.slug as ProjectSlug;

  // 3) Buscar metadata del proyecto
  const project = projects.find((p) => p.slug === urlSlug);

  // 4) Buscar implementación del proyecto
  const ProjectComponent = projectsMap[urlSlug];

  // 5) Validación (metadata + implementación)
  if (!project || !ProjectComponent) {
    return (
      <div>
        <h1>Proyecto no encontrado</h1>
        <p>No existe un proyecto con el slug "{params.slug}".</p>
      </div>
    );
  }

  // 6) Render final
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header del proyecto */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {project.title}
        </h1>
        <p className="text-zinc-600">
          {project.description}
        </p>
      </div>
      {/* Contenido del proyecto */}
      <ProjectComponent />
    </div>
  );
}
```

### Explicación paso a paso

Este archivo es **el punto donde metadata y component map se encuentran**. Es el único archivo que necesitas modificar cuando cambia el patrón de detalle de proyecto (por ejemplo, si añades tabs, breadcrumbs, o botón "volver").

1. **`await props.params`** — en Next.js 16 los params son asíncronos. Ver "Análisis: params asíncronos" abajo.
2. **`params.slug as ProjectSlug`** — casting explícito. Ver "Análisis: el `as ProjectSlug`" abajo.
3. **`projects.find((p) => p.slug === urlSlug)`** — busca el objeto de metadata. Devuelve `Project | undefined`.
4. **`projectsMap[urlSlug]`** — busca el componente en el map. Devuelve un componente React o `undefined` si no existe la clave.
5. **`if (!project || !ProjectComponent)`** — doble comprobación. Ver "Análisis: doble check" abajo.
6. **`<ProjectComponent />`** — renderiza el componente resuelto dinámicamente. React acepta cualquier componente como valor de una variable, mientras empiece con mayúscula (por eso `const ProjectComponent = ...`, no `const projectComponent = ...`).

---

## Análisis: `params: Promise<{ slug: string }>`

En Next.js 16 los parámetros de ruta dinámica son **asíncronos**. Hay que hacer `await` sobre `props.params` antes de leer `slug`:

```tsx
const params = await props.params;
const urlSlug = params.slug as ProjectSlug;
```

Esto permite a Next.js optimizar la resolución de parámetros (por ejemplo, leyéndolos de un cache). En versiones anteriores era síncrono (`params.slug`); ahora ya no.

**Regla:** en Next.js 16 App Router, siempre `await props.params` antes de usar los parámetros.

---

## Análisis: doble check `if (!project || !ProjectComponent)`

```tsx
if (!project || !ProjectComponent) {
  return <NotFound />;
}
```

Podría bastar con **una** de las dos comprobaciones, pero se hacen las dos por seguridad:

- **`!project`** cubre el caso "existe en el component map pero no en la metadata" (típicamente por olvidar añadir la entrada en `projects.ts`).
- **`!ProjectComponent`** cubre el caso opuesto: "existe en metadata pero no hay componente registrado" (olvido en el map).

Y por supuesto cubre también "no existe en ninguno de los dos" (URL inventada).

Después del `if`, TypeScript **estrecha** los tipos: `project` es `Project` (no `Project | undefined`), `ProjectComponent` es un componente válido.

---

## Análisis: el `as ProjectSlug`

```tsx
const urlSlug = params.slug as ProjectSlug;
```

`params.slug` viene de la URL y TypeScript lo considera `string`. Pero `projectsMap[key]` espera un `ProjectSlug`. El `as` le dice a TypeScript: "confío en que este string es uno de los slugs válidos".

**Es una promesa que TypeScript no puede verificar.** Si el slug no está entre las claves de `projectsMap`, `projectsMap[urlSlug]` devuelve `undefined` en runtime, y el `if (!ProjectComponent)` lo detecta.

**Regla:** un `as` sin una verificación de runtime aguas abajo es un bug. Aquí el `if (!ProjectComponent)` es la verificación que respalda el `as`.

---

## Parte 13 — `template.tsx` para la ruta dinámica

### Código completo

```tsx
// src/app/projects/[slug]/template.tsx
"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-glitch">{children}</div>;
}
```

### Explicación

Los proyectos individuales usan `page-glitch` (definido en la Fase 2) en lugar de `page-scan`. Esto le da una identidad visual distinta a las páginas de detalle: cuando se entra a un proyecto, el contenido aparece con distorsión cromática en lugar de la línea de escaneo.

**Cómo funciona la prioridad de templates.** Next.js aplica el template más cercano a la ruta:

- Para `/projects/clima`:
  1. El template raíz (`src/app/template.tsx` — `page-scan`) se aplica al layout general.
  2. El template de `[slug]` (`src/app/projects/[slug]/template.tsx` — `page-glitch`) se aplica al contenido de la página.

Ambos se ejecutan; el del `[slug]` envuelve directamente el contenido, así que es el efecto más visible.

**Por qué `"use client"`.** El template no usa hooks aquí, pero llevar la directiva es habitual porque los templates suelen envolver contenido animado o interactivo. Si sólo aplicara clases estáticas, podría ser Server Component. Aquí es Client por consistencia con el template raíz.

---

## Flujo completo cuando el usuario entra a `/projects/clima`

1. **Router** — Next.js identifica la ruta como `/projects/[slug]` con `slug = "clima"`.
2. **Layout raíz** (`src/app/layout.tsx`) — renderiza `<html>`, `<body>`, `Nav`, `DigitalRain` y `Footer`. Persiste.
3. **Template raíz** (`src/app/template.tsx`) — aplica `page-scan`. Se re-monta.
4. **Layout de la sección** (`src/app/projects/layout.tsx`) — aplica `max-w-4xl`. Persiste dentro de `/projects/*`.
5. **Template de `[slug]`** (`src/app/projects/[slug]/template.tsx`) — aplica `page-glitch`. Se re-monta.
6. **Page dinámica** (`src/app/projects/[slug]/page.tsx`) — resuelve `slug`, busca en `projects` y `projectsMap`, renderiza título + `<WeatherDashboard />`.
7. **`WeatherDashboard`** — se monta con `state.loading = true`. Dispara los 8 fetches en paralelo. Muestra skeletons.
8. Cuando los fetches terminan (~200-500ms), llama a `setState({ data, loading: false, error: null })`. Re-render con las 8 cards de clima.

Si en cualquier momento el usuario navega a `/projects/mercados`:
- Los layouts persisten (no se re-montan).
- El template de `[slug]` se re-monta → animación `page-glitch` otra vez.
- El cleanup de `WeatherDashboard` corre (`cancelled = true`), evitando `setState` sobre el componente desmontado.
- La nueva página monta `MarketDashboard`, que hace `fetch("/api/market")`.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones:

1. Ir a `http://localhost:3000/projects`. Aparece el título "Projects" (con scramble) y una lista de cards, una por cada proyecto de la metadata.
2. Cada card muestra el título (con scramble), la descripción y un link "Ir al proyecto".
3. Al pasar el cursor sobre una card, se pinta rosa con un glow (efecto `.neon-card:hover`).
4. Click en la card de "Tic Tac Toe". La URL pasa a `/projects/tic-tac-toe`. El contenido entra con **efecto glitch** (colores distorsionados, temblor). Aparece el tablero funcional.
5. Volver a `/projects` y hacer click en "Clima". Aparecen 8 skeletons pulsando por un instante y luego se muestran las temperaturas de las ciudades configuradas.
6. Click en "Mercados". Aparecen 3 skeletons y luego se ve el precio de BTC, S&P 500 y NASDAQ con el cambio porcentual (verde ▲ o rojo ▼).
7. Abrir las DevTools en la pestaña Network mientras se carga `/projects/mercados`. Ver que se dispara una petición a `/api/market` (mismo origen).
8. Recargar `/projects/mercados` dos veces rápidamente. La segunda vez debería ser instantánea porque el Route Handler responde desde el cache de 60s.
9. Ir a `/projects/no-existe`. Se muestra el mensaje "Proyecto no encontrado".
10. Con las DevTools offline, cargar `/projects/mercados`. Se ve el mensaje de error con botón "Reintentar". Al volver online y clickear, la data se recupera.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] `src/data/projects.ts` declara y exporta el tipo `Project` y el array `projects`. No importa React ni JSX.
- [ ] `src/content/projects/` contiene una carpeta por proyecto con `Componente.tsx` + `index.ts` (re-export del default).
- [ ] Al menos un proyecto Client Component (`"use client"` + `useState`) y uno Server Component (sin `"use client"`).
- [ ] `src/content/projects/index.ts` exporta el objeto `projectsMap` y el tipo `ProjectSlug = keyof typeof projectsMap`.
- [ ] Las claves de `projectsMap` coinciden **exactamente** con los `slug` de la metadata.
- [ ] `src/app/projects/layout.tsx` aplica `max-w-4xl` al contenedor.
- [ ] `src/app/projects/components/ProjectCard.tsx` es Presentational: sólo recibe props.
- [ ] `src/app/projects/components/ProjectList.tsx` es Container: importa `projects` y renderiza `ProjectCard`.
- [ ] `src/app/projects/page.tsx` compone `ProjectList` con el hero.
- [ ] `src/app/projects/[slug]/page.tsx` es `async`, hace `await props.params`, usa `find` para la metadata y `projectsMap[slug]` para el componente, y muestra fallback si no existe.
- [ ] `src/app/projects/[slug]/template.tsx` aplica `page-glitch`.
- [ ] Proyectos con API usan una máquina de estados (`{ data, loading, error }` o discriminated union) — nunca flags booleanos sueltos sin agrupar.
- [ ] Todos los `useEffect` con fetch tienen un flag `cancelled` en el cleanup.
- [ ] `src/app/api/market/route.ts` existe, exporta `GET`, usa `next: { revalidate: 60 }` y un `User-Agent`.
- [ ] El consumidor `MarketDashboard` llama a `/api/market`, no directamente a Yahoo Finance.
- [ ] Añadir un proyecto nuevo son exactamente 3 pasos: crear carpeta con componente, añadir entrada a `projects`, añadir entrada a `projectsMap`.

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| `/blog` | La sección sigue vacía. Se construye en Fase 4. |
| Widgets del home | El grid del home todavía no existe. Se construye en Fase 5. |
| Retry automático con backoff | Los proyectos con API tienen botón "Reintentar" manual. Un retry con backoff exponencial queda para una mejora posterior. |
| Discriminated union en el estado | Los proyectos usan flags (`data, loading, error`). Migrar a discriminated union es un refactor menor que endurecería el tipo. |

- **[Fase 4 — Sección Blog: Registry sin component map](./04-blog.md)** — se muestra la variante del Registry cuando el contenido es homogéneo.
- **[Fase 5 — Home Dashboard con Widgets](./05-home-dashboard.md)** — se reutiliza `MarketDashboard` (versión reducida) como widget en el home, y se enlaza al proyecto completo.
