# TUTORIAL: Cómo construir NeonLab desde cero

Guía paso a paso para recrear NeonLab — una plataforma educativa con estética cyberpunk construida con Next.js 16, React 19, TypeScript y Tailwind CSS 4.

**Filosofía de este tutorial:** vamos a construir la aplicación en el mismo orden en que se construiría un edificio. Primero los cimientos (configuración, carpetas), luego la estructura (layout, navegación), después las paredes (CSS, efectos), y al final los muebles (contenido, widgets). Cada paso depende del anterior, y en cada uno te explico *por qué* se hace así y no de otra forma.

---

## Índice

1. [Inicialización del proyecto](#1-inicialización-del-proyecto)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Configuración base](#3-configuración-base)
4. [CSS global y sistema neon](#4-css-global-y-sistema-neon)
5. [Layout raíz y navegación](#5-layout-raíz-y-navegación)
6. [Transiciones de página (template.tsx)](#6-transiciones-de-página-templatetsx)
7. [Efectos visuales (canvas)](#7-efectos-visuales-canvas)
8. [El patrón Registry: metadata + component map](#8-el-patrón-registry-metadata--component-map)
9. [Sección Labs](#9-sección-labs)
10. [Sección Projects](#10-sección-projects)
11. [Sección Blog](#11-sección-blog)
12. [Home Dashboard con Widgets](#12-home-dashboard-con-widgets)
13. [Agregar contenido nuevo](#13-agregar-contenido-nuevo)

---

## 1. Inicialización del proyecto

### Por qué empezamos aquí

Antes de escribir una sola línea de código propio, necesitamos que el entorno esté listo: que TypeScript compile, que Tailwind procese CSS, que Next.js sepa dónde buscar las páginas. Si esto no funciona, nada de lo que viene después va a funcionar. Es como encender el horno antes de cocinar.

### Qué hacer

```bash
npx create-next-app@latest neonlab
```

Durante la instalación, el CLI te pregunta varias cosas. Estas son las respuestas y **por qué**:

| Pregunta | Respuesta | Por qué |
|----------|-----------|---------|
| TypeScript | **Yes** | Todo el proyecto usa tipado estricto. Sin TypeScript, los types de los registries no funcionarían y perderíamos la seguridad que nos da el compilador para detectar errores antes de ejecutar. |
| ESLint | **Yes** | Nos avisa de errores comunes (imports sin usar, variables indefinidas). Es como un corrector ortográfico para código. |
| Tailwind CSS | **Yes** | Es nuestro sistema de estilos. En lugar de escribir CSS en archivos separados, escribimos clases directamente en el HTML. Tailwind 4 se configura automáticamente vía PostCSS. |
| `src/` directory | **Yes** | Separa el código fuente de los archivos de configuración (package.json, tsconfig, etc.). Sin esto, todo queda mezclado en la raíz y es más difícil de navegar. |
| App Router | **Yes** | Es el sistema de routing moderno de Next.js. Cada carpeta dentro de `app/` se convierte en una ruta. Es más intuitivo que el viejo Pages Router y soporta Server Components nativamente. |
| Import alias | `@/*` | Permite escribir `@/lib/labs` en lugar de `../../../lib/labs`. Evita la pesadilla de los paths relativos cuando tienes archivos anidados. |

### Dependencias finales

```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Dato importante:** no instalamos NINGUNA librería externa. Todo funciona con lo que Next.js trae. Esto no es accidental — la intención es demostrar qué tan lejos puedes llegar con las herramientas base antes de agregar dependencias. Cada dependencia que agregas es una responsabilidad más: actualizaciones, vulnerabilidades, conflictos. Si puedes lograr lo mismo sin ella, no la necesitas.

### El path alias en detalle

En `tsconfig.json`, `create-next-app` ya configura esto:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Lo que hace: cuando TypeScript ve `@/lib/labs`, lo reemplaza por `./src/lib/labs`. Esto funciona en cualquier archivo sin importar qué tan profundo esté. Sin este alias, un componente en `src/app/lab/[slug]/page.tsx` tendría que escribir `../../../../lib/labs` para llegar a los datos — propenso a errores y difícil de leer.

---

## 2. Estructura de carpetas

### Por qué este es el paso 2

Puede parecer prematuro crear carpetas vacías antes de tener código, pero hay una razón pedagógica y práctica: **la estructura de carpetas ES la arquitectura de tu aplicación**. Si entiendes la estructura, entiendes cómo funciona todo. Y si la defines primero, cada archivo que crees después tiene un lugar claro donde ir, en lugar de ir improvisando.

Pensalo así: un arquitecto no empieza a poner ladrillos al azar — primero dibuja el plano.

### La estructura completa

```
src/
├── app/                          ← Routing y UI (Next.js App Router)
│   ├── components/               ← Componentes compartidos entre páginas
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── home/                 ← Container/Presentational del home
│   │   │   ├── WidgetList.tsx
│   │   │   └── WidgetCard.tsx
│   │   └── effects/              ← Efectos visuales (canvas, animaciones)
│   │       ├── TextScramble.tsx
│   │       └── DigitalRain.tsx
│   ├── lab/                      ← Sección Labs
│   │   ├── components/
│   │   │   ├── LabList.tsx
│   │   │   └── LabCard.tsx
│   │   ├── [slug]/
│   │   │   ├── page.tsx
│   │   │   └── template.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── projects/                 ← Sección Projects (mismo patrón que lab/)
│   │   ├── components/
│   │   │   ├── ProjectList.tsx
│   │   │   └── ProjectCard.tsx
│   │   ├── [slug]/
│   │   │   ├── page.tsx
│   │   │   └── template.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── blog/                     ← Sección Blog (mismo patrón, sin component map)
│   │   ├── components/
│   │   │   ├── BlogList.tsx
│   │   │   └── BlogCard.tsx
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx                ← Layout raíz (Nav + Footer, envuelve todo)
│   ├── template.tsx              ← Transición global de página
│   ├── page.tsx                  ← Home (/)
│   └── globals.css               ← Estilos globales + sistema neon
│
├── lib/                          ← Datos puros (types + arrays, SIN React)
│   ├── labs.ts
│   ├── posts.ts
│   ├── widgets.ts
│   └── projects/
│       └── projects.ts
│
├── labcontent/                   ← Componentes React de cada lab
│   └── mini-labs/
│       ├── client-counter/
│       │   ├── ClientCounter.tsx
│       │   └── index.ts          ← Re-export
│       ├── ...más labs.../
│       └── index.ts              ← Component map (slug → componente)
│
├── projectscontent/              ← Componentes React de cada project
│   └── implementations/
│       ├── tic-tac-toe/
│       │   ├── TicTacToe.tsx
│       │   └── index.ts
│       ├── ...más projects.../
│       └── index.ts              ← Component map
│
└── homecontent/                  ← Componentes React de cada widget del home
    ├── clima/
    │   └── index.tsx
    ├── ...más widgets.../
    └── index.ts                  ← Component map
```

### La lógica detrás de la separación

La pregunta clave es: **¿por qué no poner todo dentro de `app/`?** Podríamos, pero mezclaríamos tres responsabilidades muy distintas:

| Carpeta | Responsabilidad | Qué contiene | Qué NO contiene |
|---------|----------------|--------------|-----------------|
| `src/app/` | **Routing y presentación**. Aquí vive todo lo que Next.js necesita para construir las rutas. | Pages, layouts, templates, componentes de UI compartidos | Lógica de negocio, datos |
| `src/lib/` | **Datos puros**. Types y arrays que describen el contenido del sitio. | Types TypeScript, arrays de metadata | Imports de React, componentes, JSX |
| `src/*content/` | **Implementaciones**. Los componentes React reales que renderizan cada lab/project/widget. | Componentes React, lógica de UI específica | Routing, metadata |

**¿Por qué esta separación importa?** Porque cada capa puede cambiar independientemente:
- Si cambias la fuente de datos (de un array hardcoded a una API), solo tocas `lib/`.
- Si cambias el diseño de las cards, solo tocas `app/`.
- Si cambias la lógica de un lab específico, solo tocas `labcontent/`.

Nadie tiene que entender todo el proyecto para hacer un cambio. Eso es lo que hace escalable una arquitectura.

### Los archivos especiales de Next.js

Dentro de `app/`, Next.js reconoce ciertos nombres de archivo y les da un comportamiento automático:

| Archivo | Qué hace | Cuándo se ejecuta |
|---------|----------|-------------------|
| `page.tsx` | Define la UI de una ruta | Cuando el usuario navega a esa URL |
| `layout.tsx` | Envuelve las páginas hijas. **Persiste** entre navegaciones (no se re-monta) | Una sola vez, al montar |
| `template.tsx` | Envuelve las páginas hijas. **Se re-monta** en cada navegación | Cada vez que la ruta cambia |
| `[slug]/` | Ruta dinámica. `slug` se extrae de la URL | Cuando la URL matchea el patrón |

La carpeta `[slug]/` es especial: los corchetes le dicen a Next.js que esa parte de la URL es variable. `/lab/client-counter` y `/lab/server-time` ambos matchean `/lab/[slug]`, y el valor de `slug` se pasa como parámetro a la página.

---

## 3. Configuración base

### Por qué este paso va aquí

Ya tenemos el proyecto inicializado y las carpetas creadas. Antes de escribir componentes, necesitamos configurar dos cosas que afectan a todo: la configuración de Next.js y la fuente tipográfica. Si las hacemos después, tendríamos que ir a retocar archivos que ya escribimos.

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**¿Por qué está vacío?** Porque Next.js 16 tiene defaults sensatos para todo lo que necesitamos. No necesitamos configurar redirects, rewrites, headers personalizados, ni nada especial. La filosofía es: no configures lo que no necesitas. Cada línea de configuración es una línea más que mantener y una decisión más que entender.

### Fuente tipográfica

NeonLab usa **Oxanium**, una fuente geométrica que encaja con la estética cyberpunk. La cargamos a través del sistema de fuentes de Next.js porque este sistema optimiza la carga automáticamente: descarga la fuente en build time, la sirve localmente (sin llamadas a Google Fonts en runtime), y elimina el "flash" de fuente sin cargar.

```tsx
// Esto va en src/app/layout.tsx (lo veremos completo en el paso 5)
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});
```

**¿Por qué tantos weights?** Porque diferentes partes de la UI necesitan diferentes grosores: los títulos usan `font-bold` (700), el texto normal usa `font-normal` (400), y los textos sutiles usan weights más ligeros. Si solo cargáramos un weight, todo el texto se vería igual y perderíamos jerarquía visual.

La fuente se aplica al `<body>` con `oxanium.className`, lo que la hace disponible en toda la aplicación sin tener que importarla en cada componente.

---

## 4. CSS global y sistema neon

### Por qué el CSS va antes que los componentes

Esto es fundamental: **el sistema visual se define ANTES de construir los componentes**. Si escribieras los componentes primero, cada uno inventaría sus propios colores, bordes y efectos, y terminarías con 15 tonos diferentes de rosa y ninguna consistencia visual.

Al definir clases reutilizables como `.neon-card` y `.neon-link` primero, cada componente que crees después simplemente aplica esas clases. Es como definir el manual de marca antes de diseñar los carteles.

El archivo `src/app/globals.css` se construye en capas, de lo más general a lo más específico:

### 4.1 Variables CSS y Tailwind (la base)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

**¿Qué está pasando aquí?**

1. `@import "tailwindcss"` — activa Tailwind CSS 4. Sin esta línea, ninguna clase de Tailwind funciona.
2. Las variables CSS (`:root`) definen colores que cambian según el tema del sistema operativo. En modo claro, fondo blanco y texto oscuro. En modo oscuro, fondo negro (`#000000`) y texto claro.
3. `@theme inline` registra estas variables dentro del sistema de Tailwind para que puedan usarse con clases como `bg-background`.

**¿Por qué variables CSS y no solo clases de Tailwind?** Porque las variables CSS cambian dinámicamente según el media query `prefers-color-scheme`. Tailwind no puede hacer eso con clases estáticas — necesita un punto de verdad que cambie en runtime.

### 4.2 Clases neon reutilizables (el sistema visual)

Estas son las clases que definen la identidad visual de NeonLab. Todo componente interactivo las usa:

```css
@layer components {
  .neon-card {
    @apply rounded-xl border border-fuchsia-500 bg-zinc-950/40 p-5 transition;
  }

  .neon-card:hover {
    @apply bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.6)];
  }

  .neon-card-title,
  .neon-card-text {
    @apply transition;
  }

  .neon-link {
    @apply text-zinc-300 transition;
  }

  .neon-link:hover {
    @apply text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)];
  }
}
```

**Desglose de `.neon-card`:**
- `rounded-xl` — bordes redondeados para suavizar la card.
- `border border-fuchsia-500` — borde rosa neon, el color principal de acento.
- `bg-zinc-950/40` — fondo gris casi negro al 40% de opacidad. Este valor es sutil: le da a la card una ligera presencia sin ser totalmente opaca, lo que permite que efectos de fondo (como DigitalRain) se intuyan por detrás.
- `p-5` — padding interno para que el contenido respire.
- `transition` — anima cualquier cambio de propiedad (necesario para el hover suave).

**Desglose del hover:**
- `bg-fuchsia-400` — el fondo se vuelve rosa brillante.
- `shadow-[0_0_20px_rgba(217,70,239,0.6)]` — un glow rosa difuminado alrededor de la card, como si emitiera luz neon. El `0_0` significa que no hay offset (la sombra es simétrica), `20px` es el blur, y el color es fuchsia al 60% de opacidad.

**¿Por qué `@layer components`?** Tailwind CSS tiene tres capas de prioridad: `base` < `components` < `utilities`. Al poner nuestras clases en `components`, las clases utility de Tailwind (como `p-8` o `bg-red-500`) pueden sobreescribirlas si es necesario. Es el nivel correcto para componentes reutilizables.

### 4.3 Animaciones (movimiento)

```css
@keyframes neon-border-pulse {
  0%, 100% { box-shadow: 0 1px 8px rgba(217, 70, 239, 0.15); }
  50% { box-shadow: 0 1px 20px rgba(217, 70, 239, 0.45); }
}

@keyframes led-blink {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 6px rgba(217, 70, 239, 0.8), 0 0 12px rgba(217, 70, 239, 0.4);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 2px rgba(217, 70, 239, 0.3);
  }
}

.neon-nav { animation: neon-border-pulse 3s ease-in-out infinite; }
.neon-led { animation: led-blink 2s ease-in-out infinite; }
```

**¿Por qué animaciones CSS y no JavaScript?** Rendimiento. Las animaciones CSS corren en el compositor del navegador (un hilo separado del JavaScript). Eso significa que pueden ser suaves a 60fps incluso si hay JavaScript pesado ejecutándose. Si usáramos `requestAnimationFrame` para esto, competirían con el resto del código JS.

- `neon-border-pulse` — un glow que crece y decrece suavemente. Se usa en el navbar y footer para que parezcan "vivos", como circuitos con corriente.
- `led-blink` — un punto que parpadea simulando un LED indicador. Se usa junto al logo "NEONLAB".

### 4.4 Transiciones de página

Estos son los efectos que se ejecutan cuando el usuario navega de una página a otra. Se activan desde `template.tsx` (que veremos en el paso 6):

```css
/* SCAN-LINE: una línea neon barre la pantalla de arriba a abajo revelando el contenido */
.page-scan {
  animation: scan-reveal 0.5s ease-out both;
}

.page-scan::before {
  content: "";
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d946ef, #e879f9, #d946ef, transparent);
  box-shadow: 0 0 15px rgba(217, 70, 239, 0.8), 0 0 30px rgba(217, 70, 239, 0.4);
  animation: scan-line-move 0.5s ease-out both;
  z-index: 50;
  pointer-events: none;
}

@keyframes scan-reveal {
  0% { clip-path: inset(0 0 100% 0); }  /* todo oculto */
  100% { clip-path: inset(0); }            /* todo visible */
}

@keyframes scan-line-move {
  0% { top: 0; opacity: 1; }
  85% { opacity: 1; }
  100% { top: 100%; opacity: 0; }          /* la línea desaparece al llegar abajo */
}
```

**¿Cómo funciona el scan?** Son dos animaciones sincronizadas:
1. `scan-reveal` usa `clip-path: inset()` para ir revelando el contenido de arriba a abajo, como si bajara una persiana.
2. `scan-line-move` mueve un pseudo-elemento de 2px (la "línea de escaneo") de arriba a abajo. Esta línea tiene un `linear-gradient` que la hace brillar en el centro y desvanecerse en los bordes, más un `box-shadow` que le da el glow neon.

```css
/* GLITCH: el contenido aparece con distorsión cromática */
.page-glitch {
  animation: glitch-in 0.4s ease-out both;
}

@keyframes glitch-in {
  0%  { opacity: 0; transform: translate(4px, -2px);  filter: hue-rotate(90deg); }
  25% { opacity: 0.7; transform: translate(-3px, 2px); filter: hue-rotate(-60deg); }
  50% { opacity: 0.5; transform: translate(2px, -1px); filter: hue-rotate(30deg); }
  75% { opacity: 0.9; transform: translate(-1px, 0);   filter: none; }
  100% { opacity: 1; transform: translate(0);           filter: none; }
}
```

**¿Qué hace el glitch?** Combina tres propiedades animadas simultáneamente:
- `opacity` — el contenido aparece progresivamente.
- `transform: translate()` — el contenido "tiembla" desplazándose unos pixeles en distintas direcciones.
- `filter: hue-rotate()` — los colores cambian erráticamente, simulando interferencia cromática.

El resultado se ve como una pantalla CRT perdiendo señal y recuperándola.

### 4.5 Efectos cyberpunk

```css
/* NOISE OVERLAY: ruido estático como el de una TV sin señal */
.noise-overlay { position: relative; }
.noise-overlay::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.04;
  background: url("data:image/svg+xml,..."); /* SVG inline con feTurbulence */
}
```

**¿Por qué un SVG inline?** El filtro `feTurbulence` genera ruido procedural infinito sin necesidad de una imagen. Es una textura que se genera en el navegador, pesa 0 bytes de descarga, y cubre cualquier tamaño de pantalla. La opacidad al 4% lo hace casi imperceptible conscientemente, pero contribuye a la sensación de "pantalla CRT" a nivel subconsciente.

### Paleta de colores

Toda la app usa solo estos colores. Esta restricción es intencional — una paleta limitada crea cohesión visual:

| Rol | Tailwind | Hex | Dónde se usa |
|-----|----------|-----|-------------|
| Fondo principal | `bg-black`, `bg-zinc-950` | `#000000` | Body, containers |
| Texto principal | `text-white` | `#ffffff` | Títulos, datos importantes |
| Texto secundario | `text-zinc-400` | — | Descripciones, labels |
| Bordes | `border-zinc-800` | — | Separadores sutiles |
| Acento neon | `fuchsia-400`, `fuchsia-500` | `#e879f9`, `#d946ef` | Bordes, hovers, glows, LED |

---

## 5. Layout raíz y navegación

### Por qué el layout va antes que las páginas

El layout raíz es lo primero que el usuario ve y lo último que desaparece. Contiene la navegación, el footer, y la estructura general (fuente, clases base del body). Si lo construimos después de las páginas, tendríamos que ir modificando cada página para ajustarse al layout.

Además, Next.js tiene una regla importante: **el layout raíz es el ÚNICO lugar donde puedes poner las tags `<html>` y `<body>`**. Ningún otro archivo puede hacerlo. Así que es literalmente el esqueleto de toda la aplicación.

### Layout raíz (`src/app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "neonlab",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${oxanium.className} antialiased min-h-screen flex flex-col`}>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Desglose línea por línea:**

- `import "./globals.css"` — carga los estilos globales. Solo se importa aquí, una vez. Todas las páginas los heredan automáticamente.
- `export const metadata` — Next.js usa este objeto para generar las tags `<title>` y `<meta>` del HTML. No necesitas escribir `<head>` manualmente.
- `Readonly<{ children: React.ReactNode }>` — `Readonly` previene que alguien modifique las props accidentalmente. Es una buena práctica en TypeScript.

**El truco del footer pegado al fondo:**
```
body:  flex flex-col  +  min-h-screen
       ┌──────────────────────┐
       │ Nav                   │  ← tamaño fijo
       │                      │
       │ main (flex-1)         │  ← CRECE para llenar todo el espacio
       │                      │
       │                      │
       │ Footer                │  ← tamaño fijo, siempre abajo
       └──────────────────────┘
```

`flex flex-col` en el body organiza los hijos verticalmente. `min-h-screen` asegura que el body ocupe al menos toda la pantalla. `flex-1` en el `<main>` le dice: "ocupa todo el espacio sobrante entre Nav y Footer". Así, aunque la página tenga poco contenido, el footer siempre queda abajo. Sin este truco, el footer subiría y quedaría flotando a mitad de pantalla.

### Nav (`src/app/components/Nav.tsx`)

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="neon-nav flex items-center border-b border-fuchsia-500 px-6 py-4">
      <Link href="/" className="neon-link flex items-center gap-2 font-bold tracking-widest">
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
        NEONLAB
      </Link>

      <div className="ml-auto flex gap-5">
        <Link href="/blog" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Blog
        </Link>
        <Link href="/lab" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Lab
        </Link>
        <Link href="/projects" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Projects
        </Link>
      </div>
    </nav>
  );
}
```

**¿Por qué `Link` y no `<a>`?** En Next.js, `Link` hace navegación del lado del cliente (SPA-style): en lugar de recargar toda la página, solo actualiza el contenido que cambió. Esto hace que la navegación sea instantánea y permite que las animaciones de transición funcionen. Si usáramos `<a>`, cada click sería una recarga completa del navegador.

**¿Por qué no tiene `"use client"`?** Porque el Nav no necesita estado ni efectos. Los `Link` de Next.js manejan la navegación internamente — el Nav en sí es un Server Component estático que se renderiza una vez y nunca cambia.

**Detalles de diseño:**
- `neon-nav` — la animación de pulso que le da vida al borde.
- `neon-led` — el punto fuchsia parpadeante junto al logo, simulando un LED de estado.
- `ml-auto` — empuja los links de navegación a la derecha.
- El `>` fuchsia antes de cada link simula un prompt de terminal (`> Blog`), reforzando la estética cyberpunk.

### Footer (`src/app/components/Footer.tsx`)

```tsx
export default function Footer() {
  return (
    <footer className="neon-nav flex items-center justify-between border-t border-fuchsia-500 px-6 py-4 text-sm text-zinc-500">
      <p>
        <span className="text-fuchsia-500">&gt;</span> {new Date().getFullYear()} NeonLab
      </p>
      <p className="flex items-center gap-2">
        Creado con Next.js
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
      </p>
    </footer>
  );
}
```

El footer replica la misma estética del Nav (borde fuchsia, pulso neon, LED) para dar simetría visual. `new Date().getFullYear()` muestra el año actual automáticamente, así nunca queda desactualizado.

---

## 6. Transiciones de página (template.tsx)

### Por qué dedicamos un paso a esto

Las transiciones son lo que hace que la app se sienta como una experiencia, no como una página web. Sin ellas, al hacer click en un link el contenido simplemente "aparece". Con ellas, el contenido se revela con una animación neon que refuerza la estética.

Pero lo importante aquí no es solo la animación — es entender la diferencia entre `layout.tsx` y `template.tsx`, que es uno de los conceptos más confusos de Next.js:

| Propiedad | `layout.tsx` | `template.tsx` |
|-----------|-------------|----------------|
| Se re-monta al navegar | **No** (persiste) | **Sí** (se destruye y recrea) |
| Mantiene estado | Sí | No |
| Ideal para | Nav, Footer, providers | Animaciones de entrada |

**¿Por qué `template.tsx` se re-monta?** Porque eso es exactamente lo que necesitamos para las animaciones. Cuando un componente se monta, sus animaciones CSS se ejecutan. Si el componente persiste (como un layout), la animación solo se ejecuta una vez y no vuelve a verse. Al usar template, cada navegación destruye el `div` viejo y crea uno nuevo, re-ejecutando la animación.

### Template raíz (`src/app/template.tsx`)

```tsx
"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-scan">{children}</div>;
}
```

**¿Por qué `"use client"`?** El re-mount del template requiere que React maneje el ciclo de vida del componente en el cliente. Sin esta directiva, Next.js podría renderizarlo como Server Component y las animaciones de re-mount no funcionarían consistentemente.

Este template aplica el efecto `page-scan` (la línea neon que barre la pantalla) a TODAS las páginas del sitio. Es el efecto de transición "por defecto".

### Template para rutas dinámicas (`src/app/lab/[slug]/template.tsx`)

```tsx
"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-glitch">{children}</div>;
}
```

Los labs individuales usan `page-glitch` en lugar de `page-scan`. Esto le da una identidad visual distinta a las páginas de detalle: cuando entras a un lab, el contenido aparece con un efecto de distorsión cromática en lugar de la línea de escaneo.

**¿Cómo funciona la prioridad?** Next.js aplica el template más cercano a la ruta. Para `/lab/client-counter`:
1. El template raíz (`src/app/template.tsx` — `page-scan`) se aplica al layout general.
2. El template de `[slug]` (`src/app/lab/[slug]/template.tsx` — `page-glitch`) se aplica al contenido de la página.

Ambos se aplican, pero el del `[slug]` envuelve directamente el contenido de la página, así que es el efecto más visible.

---

## 7. Efectos visuales (canvas)

### Por qué van antes del contenido

Los efectos visuales (TextScramble, DigitalRain) son componentes compartidos que se usan en múltiples páginas. Si los creamos después, tendríamos que volver a las páginas ya terminadas para agregarlos. Además, son Client Components con lógica compleja que vale la pena tener listos antes de componer las páginas.

### TextScramble (`src/app/components/effects/TextScramble.tsx`)

Este efecto toma un texto y lo "descifra" progresivamente — como si un hacker estuviera decodificando información en tiempo real:

```tsx
"use client";

import { useEffect, useState } from "react";

type TextScrambleProps = {
  text: string;
  className?: string;
};

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789";

export default function TextScramble({ text, className = "" }: TextScrambleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let frame = 0;
    const totalFrames = text.length * 3;
    let animationId: number;

    const animate = () => {
      frame++;
      const revealedCount = Math.floor((frame / totalFrames) * text.length);

      const result = text
        .split("")
        .map((char, i) => {
          if (i < revealedCount) return char;      // ya revelado
          if (char === " ") return " ";             // respetar espacios
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setDisplayed(result);

      if (frame < totalFrames) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [text]);

  return <span className={className} aria-label={text}>{displayed}</span>;
}
```

**¿Cómo funciona paso a paso?**

1. El componente recibe un `text` (por ejemplo `"Neon Lab"`).
2. Al montarse, inicia un loop con `requestAnimationFrame`.
3. En cada frame, calcula cuántos caracteres ya deberían estar revelados (`revealedCount`).
4. Para cada carácter del texto:
   - Si ya fue revelado (su índice < `revealedCount`), muestra el carácter real.
   - Si es un espacio, siempre muestra espacio (para que las palabras no se junten).
   - Si aún no fue revelado, muestra un carácter aleatorio del set `SCRAMBLE_CHARS`.
5. El resultado visual es: `"!@#$ %^&"` → `"N@#$ %^&"` → `"Ne#$ L^&"` → `"Neon Lab"`.

**`totalFrames = text.length * 3`** — cada carácter tiene 3 frames de "scramble" antes de revelarse. Un texto de 8 caracteres necesita 24 frames para revelarse completamente (~400ms a 60fps).

**`aria-label={text}`** — accesibilidad. Los lectores de pantalla ignoran el texto scrambleado y leen el texto real.

### DigitalRain (`src/app/components/effects/DigitalRain.tsx`)

Un canvas a pantalla completa que muestra líneas horizontales de datos hex desplazándose lentamente, con glitches esporádicos:

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function DigitalRain({ opacity = 0.10 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cada "línea" tiene: posición Y, velocidad, texto, offset horizontal,
    // tono de color, brillo, y un timer de glitch.
    // El loop de animación mueve el offset de cada línea, y cada ~2.5 segundos
    // selecciona líneas aleatorias para un "glitch": aumenta su brillo,
    // cambia su hue, y la desplaza verticalmente.

    // ...lógica completa en el archivo...

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
```

**¿Por qué un `<canvas>` y no divs animados?**

Rendimiento. Si tuvieras 30 líneas de texto, cada una con 100+ caracteres, animadas individualmente con CSS, el navegador tendría que:
- Mantener cientos de nodos DOM.
- Recalcular layouts en cada frame.
- Crear capas de composición para cada elemento animado.

Con un canvas, solo hay UN elemento DOM. Toda la renderización ocurre en un buffer de pixeles que el GPU dibuja directamente. Es órdenes de magnitud más eficiente para este tipo de animación.

**Las propiedades clave del canvas:**
- `fixed inset-0` — cubre toda la pantalla y no se mueve al hacer scroll.
- `z-0` — queda detrás de todo el contenido (que tiene `z-10`).
- `pointer-events-none` — los clicks pasan a través del canvas al contenido de abajo.
- `opacity: 0.10` — casi transparente. El efecto es sutil, como datos corriendo en un monitor de fondo.

---

## 8. El patrón Registry: metadata + component map

### Por qué lo explicamos antes de construir las secciones

Este es **el concepto más importante de toda la arquitectura**. Si no lo entiendes primero, las secciones de Labs, Projects y Widgets parecen código repetitivo sin sentido. Pero una vez que lo entiendes, todo encaja como un sistema.

Pensalo como una biblioteca: los libros (componentes) están en los estantes, y el catálogo (metadata) te dice qué libros hay y dónde están. No vas a buscar un libro abriendo estante por estante — consultas el catálogo primero.

### El problema que resuelve

Imaginate que tienes 6 labs. Sin el registry pattern, tu página lista tendría que hacer esto:

```tsx
// MAL: imports hardcodeados, sin sistema
import ClientCounter from "@/labcontent/mini-labs/client-counter";
import ClientClock from "@/labcontent/mini-labs/client-clock";
import ServerTime from "@/labcontent/mini-labs/server-time";
// ... y así para cada lab

export default function LabPage() {
  return (
    <div>
      <LabCard title="Client Counter" slug="client-counter" />
      <LabCard title="Client Clock" slug="client-clock" />
      {/* ... repetir para cada lab */}
    </div>
  );
}
```

Y tu página dinámica tendría un if/else enorme:

```tsx
// MAL: cadena de ifs
if (slug === "client-counter") return <ClientCounter />;
if (slug === "client-clock") return <ClientClock />;
// ... para cada lab
```

Cada vez que agregas un lab, tienes que modificar TRES archivos y agregar código en múltiples lugares. Es propenso a errores y no escala.

### La solución: dos archivos simples

**Parte 1 — Metadata (`src/lib/labs.ts`):**

```ts
export type Lab = {
  slug: string;
  title: string;
  description: string;
};

export const labs: Lab[] = [
  { slug: "client-counter", title: "Client Counter", description: "..." },
  // ...más labs
];
```

Un array de datos puros. Sin React, sin imports pesados. Solo información sobre qué labs existen.

**Regla fundamental:** este archivo NUNCA importa React ni componentes. Son datos puros que podrían venir de una API, una base de datos, o un CMS. Al mantenerlos separados de React, te aseguras de que el día que quieras cambiar la fuente de datos, solo tocas este archivo.

**Parte 2 — Component Map (`src/labcontent/mini-labs/index.ts`):**

```ts
import ClientCounter from "./client-counter";
import ClientClock from "./client-clock";

export const minilabs = {
  "client-counter": ClientCounter,
  "client-clock": ClientClock,
};

export type MiniLabSlug = keyof typeof minilabs;
```

Un objeto que conecta cada slug con su componente React. El type `MiniLabSlug` se infiere automáticamente del objeto — si el objeto tiene las keys `"client-counter"` y `"client-clock"`, entonces `MiniLabSlug` es `"client-counter" | "client-clock"`. TypeScript garantiza que no puedes pedir un slug que no existe.

### Cómo se conectan

En la página dinámica `[slug]/page.tsx`, las dos partes se unen:

```tsx
const params = await props.params;
const lab = labs.find(l => l.slug === params.slug);           // busca en metadata
const LabComponent = minilabs[params.slug as MiniLabSlug];    // busca en component map

if (!lab || !LabComponent) return <NotFound />;

return (
  <div>
    <h1>{lab.title}</h1>        {/* datos de la metadata */}
    <LabComponent />             {/* componente del map */}
  </div>
);
```

**¿Qué ganas?**
1. **Agregar contenido es mecánico** — siempre son los mismos 3 pasos: crear componente, agregar metadata, agregar al map. No hay que pensar dónde ni cómo.
2. **Type safety** — `MiniLabSlug` se infiere del map, así que TypeScript te avisa si escribes mal un slug.
3. **La lista se genera sola** — `labs.map()` renderiza todos los labs. No hay que agregar cards manualmente.
4. **La página dinámica funciona para cualquier slug** — un solo `[slug]/page.tsx` sirve para todos los labs, ahora y los que vengan.

---

## 9. Sección Labs

### Por qué Labs va primero

Labs es la sección más completa: tiene metadata, component map, Container/Presentational, página lista, página dinámica, layout propio y template propio. Si construyes Labs bien, Projects y Blog son variaciones del mismo patrón. Labs es el "molde" que copias para el resto.

### 9.1 Metadata (`src/lib/labs.ts`)

Empezamos por los datos porque son la base sobre la que todo se construye. Sin datos, no hay nada que renderizar:

```ts
export type Lab = {
  slug: string;
  title: string;
  description: string;
};

export const labs: Lab[] = [
  { slug: "client-counter", title: "Client Counter", description: "Client Component usando useState" },
  { slug: "client-clock", title: "Client Clock", description: "useEffect y efectos en cliente" },
  { slug: "server-time", title: "Server Time", description: "Renderizado en servidor sin hooks" },
  { slug: "client-form", title: "Client form", description: "Formularios en cliente" },
  { slug: "server-fetch", title: "Server fetch", description: "Fetch en Server componentes" },
  { slug: "client-fetch", title: "Client fetch", description: "Loading states, fetch en cliente y lifecycle." },
];
```

**¿Por qué el `slug` es un string y no un ID numérico?** Porque el slug se usa directamente en la URL (`/lab/client-counter`). Un slug legible mejora el SEO y la experiencia del usuario (pueden entender la URL antes de hacer click).

### 9.2 Implementaciones (`src/labcontent/mini-labs/`)

Después de definir qué labs existen, creamos los componentes reales. Cada uno vive en su propia carpeta:

```
mini-labs/
├── client-counter/
│   ├── ClientCounter.tsx    ← el componente real
│   └── index.ts             ← export { default } from "./ClientCounter"
├── server-time/
│   ├── ServerTime.tsx
│   └── index.ts
└── index.ts                 ← component map
```

**¿Por qué una carpeta por lab y no un archivo?** Porque un lab puede crecer: podría necesitar subcomponentes, datos locales, hooks personalizados, etc. Si empiezas con un solo archivo y luego necesitas dividirlo, tienes que cambiar los imports en todos los archivos que lo usan. Con una carpeta + `index.ts`, el import siempre es `from "./client-counter"` sin importar cuántos archivos internos tenga.

**Ejemplo de Client Component** (usa hooks, necesita `"use client"`):

```tsx
// client-counter/ClientCounter.tsx
"use client";

import { useState } from "react";

export default function ClientCounter() {
  const [count, setCount] = useState(0);
  return (
    <div className="border p-4 rounded">
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)} className="mt-2 px-3 py-1 border rounded">
        Increment
      </button>
    </div>
  );
}
```

**Ejemplo de Server Component** (sin `"use client"`, sin hooks):

```tsx
// server-time/ServerTime.tsx
export default function ServerTime() {
  const time = new Date().toLocaleTimeString();
  return (
    <div className="border p-4 rounded">
      <p>Server time (fixed per request):</p>
      <strong>{time}</strong>
    </div>
  );
}
```

**¿Cuál es la diferencia práctica?** El Client Component (`ClientCounter`) envía JavaScript al navegador para manejar el estado y los clicks. El Server Component (`ServerTime`) se renderiza completamente en el servidor — el navegador recibe HTML puro, sin JS. Esto es más rápido, pero no puede tener interactividad.

### 9.3 Component Map (`src/labcontent/mini-labs/index.ts`)

Con los componentes creados, necesitamos un lugar central que los registre todos:

```ts
import ClientCounter from "./client-counter";
import ClientClock from "./client-clock";
import ServerTime from "./server-time";
import ClientForm from "./client-form";
import ServerFetch from "./server-fetch";
import ClientFetch from "./client-fetch";

export const minilabs = {
  "client-counter": ClientCounter,
  "client-clock": ClientClock,
  "server-time": ServerTime,
  "client-form": ClientForm,
  "server-fetch": ServerFetch,
  "client-fetch": ClientFetch,
};

export type MiniLabSlug = keyof typeof minilabs;
```

**¿Por qué las keys del objeto coinciden con los slugs de la metadata?** Porque esa es la conexión entre ambos sistemas. La metadata dice "existe un lab con slug `client-counter`", y el map dice "el componente para `client-counter` es `ClientCounter`". Si las keys no coincidieran, la página dinámica no encontraría el componente correcto.

### 9.4 Layout (`src/app/lab/layout.tsx`)

Ahora que los datos y componentes están listos, creamos la UI. Empezamos por el layout porque envuelve tanto la página lista como las páginas dinámicas:

```tsx
import { ReactNode } from "react";

type MinilabLayoutProps = { children: ReactNode };

export default function MinilabLayout({ children }: MinilabLayoutProps) {
  return <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>;
}
```

**¿Por qué un layout propio para labs?** Porque las secciones tienen anchos distintos: labs usa `max-w-3xl` (768px), projects usa `max-w-4xl` (896px). Si solo tuviéramos el layout raíz, todas las páginas tendrían el mismo ancho. El layout de sección permite personalizar esto.

**¿Qué hace `mx-auto`?** Centra el contenedor horizontalmente. `max-w-3xl` le pone un ancho máximo para que el texto no se estire en pantallas grandes (las líneas de texto muy largas son difíciles de leer).

### 9.5 Container/Presentational

Este es un patrón de diseño de React que separa la lógica de obtener datos de la lógica de mostrarlos:

**LabCard (Presentational)** — no sabe de dónde vienen los datos. Solo recibe props y renderiza:

```tsx
// src/app/lab/components/LabCard.tsx
import Link from "next/link";
import TextScramble from "@/app/components/effects/TextScramble";

type LabCardProps = {
  slug: string;
  title: string;
  description: string;
};

export default function LabCard({ slug, title, description }: LabCardProps) {
  return (
    <article className="neon-card">
      <h2 className="neon-card-title text-lg font-semibold">
        <TextScramble text={title} />
      </h2>
      <p className="neon-card-text mt-2 text-sm text-zinc-600">{description}</p>
      <Link href={`/lab/${slug}`} className="neon-link">Ir al lab</Link>
    </article>
  );
}
```

**LabList (Container)** — sabe de dónde vienen los datos y los pasa a las cards:

```tsx
// src/app/lab/components/LabList.tsx
import { labs } from "@/lib/labs";
import LabCard from "./LabCard";

export default function LabList() {
  return (
    <div className="space-y-4">
      {labs.map((lab) => (
        <LabCard key={lab.slug} slug={lab.slug} title={lab.title} description={lab.description} />
      ))}
    </div>
  );
}
```

**¿Por qué separar en dos componentes?** Porque si mañana quieres:
- Cambiar el diseño de la card → solo tocas `LabCard.tsx`.
- Cambiar de dónde vienen los datos (de un array a una API) → solo tocas `LabList.tsx`.
- Reusar la card en otro contexto → puedes importar `LabCard` sola sin traer la lógica de datos.

Si todo estuviera en un solo componente, cualquier cambio requeriría entender y modificar todo junto.

### 9.6 Página lista (`src/app/lab/page.tsx`)

Con los datos, componentes, layout y cards listos, la página en sí es mínima — solo compone las piezas:

```tsx
import LabList from "./components/LabList";
import TextScramble from "@/app/components/effects/TextScramble";
import DigitalRain from "@/app/components/effects/DigitalRain";

export default function LabPage() {
  return (
    <section className="relative space-y-8">
      <DigitalRain />
      <div className="relative z-10 space-y-8">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Neon Lab" />
        </h1>
        <LabList />
      </div>
    </section>
  );
}
```

**¿Por qué `relative z-10` en el contenido?** El `DigitalRain` usa `fixed inset-0 z-0` para cubrir toda la pantalla como fondo. Sin `z-10` en el contenido, el canvas y el contenido estarían en el mismo plano y el texto podría quedar detrás del efecto. `relative` establece un contexto de stacking, y `z-10` lo eleva por encima del canvas.

### 9.7 Página dinámica (`src/app/lab/[slug]/page.tsx`)

Esta es la página que se renderiza cuando el usuario hace click en una card. Es el punto donde las dos partes del registry se encuentran:

```tsx
import { labs } from "@/lib/labs";
import { minilabs, MiniLabSlug } from "@/labcontent/mini-labs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LabSlugPage(props: PageProps) {
  const params = await props.params;
  const urlSlug = params.slug as MiniLabSlug;

  const lab = labs.find((l) => l.slug === urlSlug);
  const LabComponent = minilabs[urlSlug];

  if (!lab || !LabComponent) {
    return (
      <div>
        <h1>Lab no encontrado</h1>
        <p>No existe un lab con el slug &quot;{params.slug}&quot;.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{lab.title}</h1>
      <p>{lab.description}</p>
      <LabComponent />
    </div>
  );
}
```

**¿Por qué `params` es una Promise?** En Next.js 16, los parámetros de ruta dinámicos se volvieron asíncronos. Esto permite a Next.js optimizar la resolución de parámetros (por ejemplo, leyéndolos de un cache). En versiones anteriores era síncrono (`params.slug`), pero ahora necesitas `await props.params` primero.

**¿Qué pasa si el slug no existe?** El `if (!lab || !LabComponent)` cubre ese caso. Si alguien navega a `/lab/no-existe`, la metadata no tendrá un lab con ese slug Y el component map no tendrá un componente. Se muestra un fallback en lugar de un error.

**¿Por qué `as MiniLabSlug`?** El `params.slug` viene de la URL y TypeScript lo considera `string`. Pero el component map espera un `MiniLabSlug` (que es `"client-counter" | "client-clock" | ...`). El `as` le dice a TypeScript: "confío en que este string es uno de los slugs válidos". El check con `if (!LabComponent)` asegura que si no lo es, no intentamos renderizar algo indefinido.

---

## 10. Sección Projects

### Por qué Projects se construye después de Labs

Porque es el mismo patrón exacto. Una vez que entiendes Labs, Projects es copiar la estructura y cambiar los nombres. Esto es intencional — la consistencia arquitectónica hace que el codebase sea predecible. Cualquier persona que entienda cómo funciona Labs, automáticamente entiende Projects.

Las únicas diferencias son:

| Aspecto | Labs | Projects |
|---------|------|----------|
| Metadata | `src/lib/labs.ts` | `src/lib/projects/projects.ts` |
| Componentes | `src/labcontent/mini-labs/` | `src/projectscontent/implementations/` |
| Map export | `minilabs` | `projectsMap` |
| Layout max-width | `max-w-3xl` (768px) | `max-w-4xl` (896px, más ancho para projects más complejos) |

### Metadata

```ts
// src/lib/projects/projects.ts
export type Project = {
  slug: string;
  title: string;
  description: string;
};

export const projects: Project[] = [
  { slug: "tic-tac-toe", title: "Tic Tac Toe", description: "Juego clásico con estilo Neon." },
  { slug: "clima", title: "Clima", description: "Dashboard de clima en tiempo real para Sapporo, Reikiavik y Santiago." },
  { slug: "hora-mundial", title: "Hora Mundial", description: "Reloj mundial en tiempo real con 10 ciudades del mundo." },
  // ...
];
```

### Component Map

```ts
// src/projectscontent/implementations/index.ts
import TicTacToe from "./tic-tac-toe";
import WeatherDashboard from "./clima";
import WorldClock from "./hora-mundial";

export const projectsMap = {
  "tic-tac-toe": TicTacToe,
  "clima": WeatherDashboard,
  "hora-mundial": WorldClock,
};

export type ProjectSlug = keyof typeof projectsMap;
```

### Proyectos con API real

Algunos proyectos consumen APIs externas en tiempo real. El patrón que siguen es:

1. **Client Component** con `"use client"` — necesario porque usan `useEffect` y `useState` para el fetch.
2. **Array de configuración** — define las ciudades/entidades con sus parámetros (coordenadas, timezone, etc.).
3. **Fetch en `useEffect`** — con cleanup (`cancelled` flag) para evitar updates en componentes desmontados.
4. **Estados de loading/error** — skeleton con `animate-pulse` para loading, mensaje con botón de reintentar para error.

**Ejemplo: WeatherDashboard** (`src/projectscontent/implementations/clima/WeatherDashboard.tsx`):
- Consulta la API gratuita [Open-Meteo](https://open-meteo.com/) para 8 ciudades (Sapporo, Reikiavik, Santiago, Tokio, Londres, Lima, Moscú, Pekín).
- Muestra temperatura, condición climática (emoji según código WMO) y velocidad del viento.
- No requiere API key.

**Ejemplo: WorldClock** (`src/projectscontent/implementations/hora-mundial/WorldClock.tsx`):
- Usa `Intl.DateTimeFormat` con zonas horarias IANA para 10 ciudades.
- Se actualiza cada segundo con `setInterval`.
- Muestra hora en formato HH:MM:SS y offset UTC.

### ProjectCard

```tsx
// src/app/projects/components/ProjectCard.tsx
export default function ProjectCard({ slug, title, description }: ProjectCardProps) {
  return (
    <article className="neon-card">
      <h2 className="text-lg font-semibold neon-card-title">
        <TextScramble text={title} />
      </h2>
      <p className="mt-2 text-sm text-zinc-600 neon-card-text">{description}</p>
      <Link href={`/projects/${slug}`} className="text-sm neon-link">Ir al proyecto</Link>
    </article>
  );
}
```

Todo lo demás (ProjectList, page.tsx, [slug]/page.tsx, layout.tsx, template.tsx) sigue exactamente el mismo patrón que Labs, solo cambiando los nombres y las rutas.

---

## 11. Sección Blog

### Por qué Blog es la sección más simple

El blog sigue el mismo Container/Presentational pattern (BlogList + BlogCard), pero tiene una diferencia fundamental: **no necesita component map**. ¿Por qué? Porque el contenido del blog es texto plano, no componentes interactivos.

En Labs, cada lab es un componente React distinto (un counter, un clock, un form). El component map es necesario para saber cuál renderizar. En Blog, cada post es solo un `title` y un `content` — strings que se renderizan directamente con `<h1>` y `<p>`. No hay lógica personalizada por post.

### Metadata

```ts
// src/lib/posts.ts
export type Post = {
  slug: string;
  title: string;
  content: string;
};

export const posts: Post[] = [
  { slug: "hola-neonlab", title: "Hola NeonLab", content: "Este es el primer post." },
  { slug: "react-basico", title: "React Básico", content: "Introducción a React paso a paso." },
];
```

**Nota:** el `content` aquí es un string simple. En una app de producción, esto sería markdown o HTML parseado, posiblemente desde archivos `.mdx`. Pero para el propósito educativo del proyecto, un string es suficiente.

### Página dinámica (sin component map)

```tsx
// src/app/blog/[slug]/page.tsx
import { posts } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params;
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) return <div><h1>Post no encontrado</h1></div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

Comparalo con la página dinámica de Labs: aquí no hay `minilabs[slug]` ni `<LabComponent />`. Solo `post.title` y `post.content` renderizados directamente. La metadata ES el contenido.

---

## 12. Home Dashboard con Widgets

### Por qué el home va al final

Puede parecer raro que la página principal sea lo último que construimos. Pero hay una razón: el home **depende de todo lo demás**. Usa el patrón registry (que aprendimos en Labs), usa los efectos visuales (TextScramble, DigitalRain), y usa las clases neon del CSS. Si lo construyéramos primero, no tendríamos nada de eso disponible.

Además, el home introduce una variación del registry pattern: los widgets tienen `colSpan` y `rowSpan` para controlar su tamaño en un grid, algo que Labs y Projects no necesitan.

### 12.1 Metadata (`src/lib/widgets.ts`)

La diferencia clave con Labs/Projects: además de `slug` y `title`, los widgets tienen propiedades de tamaño:

```ts
export type Widget = {
  slug: string;
  title: string;
  colSpan?: 1 | 2;  // default 1 (1 columna)
  rowSpan?: 1 | 2;  // default 1 (1 fila)
};

export const widgets: Widget[] = [
  { slug: "clima", title: "Clima", rowSpan: 2 },              // alto: ocupa 2 filas
  { slug: "nota-del-dia", title: "Nota del día" },             // tamaño normal (1x1)
  { slug: "btc", title: "BTC/USD" },                           // tamaño normal (1x1)
  { slug: "hora-mundial", title: "Hora mundial", colSpan: 2 }, // ancho: ocupa 2 columnas
  { slug: "tareas", title: "Tareas" },                         // tamaño normal (1x1)
  { slug: "stats", title: "Stats" },                           // tamaño normal (1x1)
  { slug: "now-playing", title: "Now playing", colSpan: 2 },   // ancho: ocupa 2 columnas
];
```

**¿Por qué `colSpan` y `rowSpan` son opcionales?** Porque la mayoría de los widgets son 1x1. Hacer las propiedades opcionales evita repetir `colSpan: 1, rowSpan: 1` en cada widget. El default se aplica en el componente que consume los datos.

**El orden del array importa:** CSS Grid coloca los elementos en el orden en que aparecen. Así que el orden del array determina el layout visual. Cambiando el orden, cambia el layout sin tocar ningún componente.

### 12.2 Componentes widget (`src/homecontent/`)

Cada widget es un componente en su propia carpeta. Algunos son Server Components con datos estáticos (stats, tareas), y otros son **Client Components que consumen APIs reales** y funcionan como previews clickeables hacia su proyecto completo:

**Widget con datos estáticos** (Server Component):

```tsx
// src/homecontent/stats/index.tsx
export default function StatsWidget() {
  const stats = [
    { label: "Labs completados", value: "5/8" },
    { label: "Proyectos", value: "3" },
    { label: "Posts", value: "7" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">{stat.label}</span>
          <span className="text-sm font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
```

**Widget con API real + link a proyecto** (Client Component):

```tsx
// src/homecontent/clima/index.tsx (simplificado)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Fetch a Open-Meteo para 3 ciudades (Sapporo, Reikiavik, Santiago)
// Muestra emoji + nombre + temperatura en formato compacto
// Clickeable hacia /projects/clima con "Ver más ciudades →"

export default function ClimaWidget() {
  // ... useEffect con fetch a Open-Meteo para las 3 ciudades ...
  return (
    <Link href="/projects/clima" className="...">
      {state.data.map((w) => (
        <div key={w.city} className="flex items-center gap-3 px-3 py-2">
          <span className="text-2xl">{getWeatherIcon(w.weatherCode)}</span>
          <span className="text-sm text-zinc-300">{w.city}</span>
          <span className="ml-auto font-mono text-lg font-bold text-white">
            {Math.round(w.temperature)}°C
          </span>
        </div>
      ))}
      <span className="... text-fuchsia-500">Ver más ciudades →</span>
    </Link>
  );
}
```

```tsx
// src/homecontent/hora-mundial/index.tsx (simplificado)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Muestra hora real de 4 ciudades (CDMX, NYC, Londres, Tokio)
// Se actualiza cada segundo con setInterval
// Clickeable hacia /projects/hora-mundial con "Ver más ciudades →"

export default function HoraMundialWidget() {
  // ... useEffect con setInterval cada 1s ...
  return (
    <Link href="/projects/hora-mundial" className="grid grid-cols-2 sm:grid-cols-4 gap-4 ...">
      {CITIES.map((city) => (
        <div key={city.name}>
          <p className="font-mono text-lg font-bold text-white">{times[city.name]}</p>
          <p className="text-xs text-zinc-500">{city.name}</p>
        </div>
      ))}
      <span className="... text-fuchsia-500">Ver más ciudades →</span>
    </Link>
  );
}
```

**El patrón widget → proyecto:** los widgets de clima y hora-mundial funcionan como previews compactos (pocas ciudades, datos resumidos) envueltos en un `<Link>` que lleva al proyecto completo (más ciudades, más detalle). Esto crea una jerarquía de información: el home muestra un vistazo rápido, y el proyecto muestra todo.

**¿Por qué cada widget solo exporta su contenido interno y no la card completa?** Porque la card (borde, fondo, padding, título) es responsabilidad de `WidgetCard`. El widget solo define qué va DENTRO de la card. Esto permite que todos los widgets tengan un diseño de card consistente sin duplicar código, y que el tamaño en el grid se controle desde la metadata.

### 12.3 Component Map (`src/homecontent/index.ts`)

Mismo patrón que Labs:

```ts
import ClimaWidget from "./clima";
import NotaDelDiaWidget from "./nota-del-dia";
import BtcWidget from "./btc";
import HoraMundialWidget from "./hora-mundial";
import TareasWidget from "./tareas";
import StatsWidget from "./stats";
import NowPlayingWidget from "./now-playing";

export const widgetsMap = {
  "clima": ClimaWidget,
  "nota-del-dia": NotaDelDiaWidget,
  "btc": BtcWidget,
  "hora-mundial": HoraMundialWidget,
  "tareas": TareasWidget,
  "stats": StatsWidget,
  "now-playing": NowPlayingWidget,
};

export type WidgetSlug = keyof typeof widgetsMap;
```

### 12.4 WidgetCard (Presentational)

A diferencia de LabCard (que es un link a una página de detalle), WidgetCard es un contenedor que recibe `children` y controla su tamaño en el grid:

```tsx
// src/app/components/home/WidgetCard.tsx
type WidgetCardProps = {
  title: string;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  children: React.ReactNode;
};

export default function WidgetCard({ title, colSpan, rowSpan, children }: WidgetCardProps) {
  const spanClasses = [
    colSpan === 2 ? "sm:col-span-2" : "",
    rowSpan === 2 ? "sm:row-span-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={`neon-card flex flex-col gap-3 ${spanClasses}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
        {title}
      </h2>
      <div className="flex-1 text-zinc-400">{children}</div>
    </article>
  );
}
```

**¿Cómo funciona la lógica de spans?**

El grid del dashboard es de 2 columnas en pantallas `sm` (640px+). Cada widget ocupa por defecto 1 columna y 1 fila. Pero si un widget tiene `colSpan: 2`, necesitamos agregar la clase `sm:col-span-2` para que ocupe las 2 columnas.

El array con `.filter(Boolean)` es un patrón para construir strings de clases condicionalmente:
```ts
["sm:col-span-2", ""]              // colSpan=2, rowSpan=1
  .filter(Boolean)                  // ["sm:col-span-2"] (elimina strings vacíos)
  .join(" ")                        // "sm:col-span-2"
```

**¿Por qué `sm:` prefix?** En móvil (< 640px), el grid es de 1 columna, así que `col-span-2` no tiene sentido. El `sm:` hace que los spans solo apliquen en pantallas donde hay 2 columnas.

### 12.5 WidgetList (Container)

Aquí es donde las dos partes del registry se unen, igual que en la página dinámica de Labs pero sin routing:

```tsx
// src/app/components/home/WidgetList.tsx
import { widgets } from "@/lib/widgets";
import { widgetsMap, type WidgetSlug } from "@/homecontent/index";
import WidgetCard from "./WidgetCard";

export default function WidgetList() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {widgets.map((widget) => {
        const Component = widgetsMap[widget.slug as WidgetSlug];
        if (!Component) return null;

        return (
          <WidgetCard
            key={widget.slug}
            title={widget.title}
            colSpan={widget.colSpan ?? 1}
            rowSpan={widget.rowSpan ?? 1}
          >
            <Component />
          </WidgetCard>
        );
      })}
    </section>
  );
}
```

**El flujo de datos completo:**
```
widgets (metadata array)    widgetsMap (slug → Component)
         │                            │
         └──────────┬─────────────────┘
                    ▼
              WidgetList
              (mapea cada widget)
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
    WidgetCard  WidgetCard  WidgetCard
    ┌────────┐  ┌────────┐  ┌────────┐
    │ title  │  │ title  │  │ title  │
    │ ClimaW │  │ BtcW   │  │ StatsW │  ← children (componente del map)
    └────────┘  └────────┘  └────────┘
```

**`widget.colSpan ?? 1`** — el operador `??` (nullish coalescing) retorna el valor de la izquierda si no es `null` ni `undefined`. Si `colSpan` no está definido en la metadata, usa `1` como default.

### 12.6 Home Page (`src/app/page.tsx`)

Con todo armado, la página del home es mínima — solo compone el hero y el grid:

```tsx
import Image from "next/image";
import TextScramble from "@/app/components/effects/TextScramble";
import WidgetList from "@/app/components/home/WidgetList";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12">
      <main className="relative z-10 mx-auto w-full max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white">
            <TextScramble text="/neonlab" />
          </h1>
          <div className="relative w-full aspect-video max-w-xl rounded-lg">
            <Image src="/media/valhalla.gif" alt="NeonLab animation" fill className="object-contain" unoptimized />
          </div>
        </header>

        <WidgetList />
      </main>
    </div>
  );
}
```

**Nota importante:** el contenedor principal del home NO tiene fondo propio (`bg-white dark:bg-black`) ni `noise-overlay`. El fondo lo hereda del `body` (que usa `var(--background)` = `#000000` en dark mode), permitiendo que el efecto `DigitalRain` del layout raíz sea visible de forma idéntica en todas las páginas. Si el home tuviera su propio fondo opaco o efectos de overlay adicionales, se vería diferente al resto.

**Las capas del home (de atrás hacia adelante):**

```
Capa 0 (z-0):   DigitalRain canvas        ← animación de fondo (desde layout.tsx)
Capa 10 (z-10): main                       ← hero + WidgetList
```

**¿Por qué `Image` con `fill` y `unoptimized`?** `fill` hace que la imagen ocupe todo su contenedor padre (que tiene `aspect-video` para mantener proporción 16:9). `unoptimized` es necesario para GIFs — sin esta prop, Next.js intentaría optimizar la imagen y rompería la animación del GIF.

---

## 13. Agregar contenido nuevo

Esta es la prueba de fuego de una buena arquitectura: ¿qué tan fácil es agregar contenido nuevo? Si diseñaste bien, debería ser mecánico y predecible.

### Agregar un nuevo Lab

3 pasos, siempre los mismos:

**Paso 1 — Crear el componente:**
```
src/labcontent/mini-labs/mi-lab/
├── MiLab.tsx     ← el componente
└── index.ts      ← export { default } from "./MiLab"
```

**Paso 2 — Agregar metadata** en `src/lib/labs.ts`:
```ts
{ slug: "mi-lab", title: "Mi Lab", description: "Lo que hace este lab" }
```

**Paso 3 — Registrar en el map** en `src/labcontent/mini-labs/index.ts`:
```ts
import MiLab from "./mi-lab";
// agregar al objeto:
"mi-lab": MiLab,
```

Listo. La card aparece automáticamente en `/lab`, y `/lab/mi-lab` renderiza el componente. No hay que tocar ningún otro archivo.

### Agregar un nuevo Widget

Mismo patrón, 3 pasos:

**Paso 1 — Crear el componente** en `src/homecontent/mi-widget/index.tsx`

**Paso 2 — Agregar metadata** en `src/lib/widgets.ts`:
```ts
{ slug: "mi-widget", title: "Mi Widget", colSpan: 2 }  // colSpan/rowSpan opcionales
```

**Paso 3 — Registrar en el map** en `src/homecontent/index.ts`:
```ts
import MiWidget from "./mi-widget";
// agregar al objeto:
"mi-widget": MiWidget,
```

### Agregar un nuevo Project

Mismos 3 pasos, usando:
- Componente en `src/projectscontent/implementations/mi-project/`
- Metadata en `src/lib/projects/projects.ts`
- Map en `src/projectscontent/implementations/index.ts`

### Agregar un Widget que linkea a un Proyecto

Este patrón combina un widget del home (preview compacto) con un proyecto (versión completa). Se usa en clima y hora-mundial:

**Paso 1 — Crear el proyecto** (los 3 pasos de arriba):
- Componente completo en `src/projectscontent/implementations/mi-proyecto/`
- Metadata en `projects.ts`, registro en `projectsMap`

**Paso 2 — Crear el widget** que funciona como preview:
- Client component en `src/homecontent/mi-widget/index.tsx`
- Mostrar datos resumidos (menos ciudades, menos detalle)
- Envolver el contenido en `<Link href="/projects/mi-proyecto">`
- Agregar texto "Ver más →" al final

**Paso 3 — Registrar el widget** en `widgets.ts` e `index.ts` del homecontent.

El resultado: el widget en el home muestra un vistazo rápido y al hacer click navega a la versión completa del proyecto.

### ¿Por qué siempre 3 pasos?

Porque el sistema está diseñado para que el contenido y la infraestructura sean independientes. No necesitas crear páginas, rutas, cards, ni links. Todo eso ya existe y se genera automáticamente a partir de los datos del registry.

---

## Resumen de patrones clave

| Patrón | Dónde se usa | Propósito | Ejemplo |
|--------|-------------|-----------|---------|
| Registry (metadata + map) | Labs, Projects, Widgets | Separar datos de componentes para que agregar contenido sea mecánico | `labs.ts` + `minilabs` |
| Container/Presentational | *List + *Card en cada sección | Separar la lógica de obtener datos de la lógica de mostrarlos | `LabList` obtiene, `LabCard` muestra |
| Server Components (default) | Todo excepto lo interactivo | Renderizado en servidor, 0 JS al cliente, más rápido | `ServerTime`, `StatsWidget` |
| Client Components (`"use client"`) | Counters, forms, effects, widgets con API | Interactividad con hooks (`useState`, `useEffect`) | `ClientCounter`, `TextScramble`, `ClimaWidget` |
| Widget → Proyecto | Clima, Hora mundial | Preview compacto en home que linkea al proyecto completo | `ClimaWidget` → `/projects/clima` |
| API fetch con cleanup | WeatherDashboard, ClimaWidget | Fetch en `useEffect` con `cancelled` flag para evitar memory leaks | `fetchCities()` con Open-Meteo |
| Template re-mount | `template.tsx` en cada nivel | Animaciones de entrada que se re-ejecutan al navegar | `page-scan`, `page-glitch` |
| Canvas effects | DigitalRain | Fondos animados performantes con un solo nodo DOM | Canvas con `requestAnimationFrame` |
| CSS neon classes | `.neon-card`, `.neon-link`, `.neon-nav` | Sistema visual consistente definido UNA vez | `@layer components` en globals.css |
| Path alias `@/*` | Todo el proyecto | Imports limpios sin paths relativos frágiles | `@/lib/labs` en vez de `../../../lib/labs` |
