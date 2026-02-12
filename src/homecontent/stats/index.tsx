/** Widget dummy de estadísticas. Servidor component con datos estáticos. */
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
