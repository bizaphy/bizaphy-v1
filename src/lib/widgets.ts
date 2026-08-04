/**
 * Metadata de un widget del dashboard.
 *
 * - `slug` identifica el widget y lo vincula con su componente en `widgetsMap`.
 * - `colSpan` y `rowSpan` controlan el tamaño en el grid de 2 columnas.
 *   Si se omiten, el default es 1 (una celda).
 *
 * @example
 * ```ts
 * const widget: Widget = {
 *   slug: "clima",
 *   title: "Clima",
 *   colSpan: 1,
 *   rowSpan: 2, // ocupa 2 filas
 * };
 * ```
 */
export type Widget = {
  slug: string;
  title: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
};

/**
 * Array de widgets que se renderizan en el dashboard del home.
 * El orden del array determina el orden visual en el grid.
 * Cada slug debe tener un componente correspondiente en `src/content/widgets/index.ts`.
 */
export const widgets: Widget[] = [
  {
    slug: "clima",
    title: "Clima",
    rowSpan: 2,
  },
  {
    slug: "nota-del-dia",
    title: "Nota del día",
  },
  {
    slug: "btc",
    title: "Mercados",
  },
  {
    slug: "hora-mundial",
    title: "Hora mundial",
    colSpan: 2,
  },
  {
    slug: "tareas",
    title: "Tareas",
  },
  {
    slug: "stats",
    title: "Stats",
  },
  {
    slug: "now-playing",
    title: "Now playing",
    colSpan: 2,
  },
];
