type WidgetCardProps = {
  title: string;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  children: React.ReactNode;
};

/**
 * Presentational widget card con tamaño dinámico en el grid.
 * Aplica sm:col-span y sm:row-span según las props recibidas.
 */
export default function WidgetCard({
  title,
  colSpan,
  rowSpan,
  children,
}: WidgetCardProps) {
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
