/** Widget dummy de Now Playing. Servidor component con canción estática. */
export default function NowPlayingWidget() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-zinc-800" />
      <div>
        <p className="text-sm font-semibold text-white">Blinding Lights</p>
        <p className="text-xs text-zinc-500">The Weeknd</p>
      </div>
      <div className="ml-auto flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-fuchsia-500"
            style={{ height: `${8 + Math.random() * 16}px` }}
          />
        ))}
      </div>
    </div>
  );
}
