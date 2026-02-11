//lib/projects/projects.ts
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
    slug: "use-mosis",
    title: "useMosis",
    description: "Proyecto para practica de hooks",
  },
  {
    slug: "mcp-project",
    title: "FUTURO MCP",
    description: "Proyecto de prueba para validar el sistema de projects.",
  },
  {
    slug: "excel-bakery",
    title: "Excel Bakery",
    description: "Proyecto de crear archivos tipo excel",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Juego clásico de Tic Tac Toe con estilo Neon.",
  },
];
