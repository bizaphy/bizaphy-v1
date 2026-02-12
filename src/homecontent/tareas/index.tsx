/** Widget dummy de tareas pendientes. Servidor component con lista estática. */
export default function TareasWidget() {
  return (
    <ul className="space-y-2 text-sm">
      <li className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
        <span className="text-zinc-300">Completar lab 04</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        <span className="text-zinc-500 line-through">Revisar PR #12</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
        <span className="text-zinc-300">Deploy v2.0</span>
      </li>
    </ul>
  );
}
