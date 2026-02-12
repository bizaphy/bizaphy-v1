export type Widget = {
  slug: string;
  title: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
};

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
    title: "BTC/USD",
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
