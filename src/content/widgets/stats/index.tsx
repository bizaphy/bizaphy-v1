import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";

type StatItem = {
  label: string;
  value: string;
};

/**
 * Widget de estadísticas del sitio. Server component con datos reales
 * derivados de los registros de posts y proyectos.
 */
export default function StatsWidget() {
  const stats: StatItem[] = [
    { label: "Proyectos", value: String(projects.length) },
    { label: "Posts", value: String(posts.length) },
  ];

  return (
    <div className="flex flex-col gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">{stat.label}</span>
          <span className="text-sm font-bold text-fuchsia-400">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
