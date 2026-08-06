//lib/projects.ts
//simulador de bdd/api para projects

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
