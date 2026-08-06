import { widgets } from "@/data/widgets";
import { widgetsMap, type WidgetSlug } from "@/content/widgets";
import WidgetCard from "./WidgetCard";

/**
 * Container component que conecta la metadata de widgets con sus componentes.
 * Renderiza un grid responsivo de 2 columnas con cada widget registrado.
 */
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
