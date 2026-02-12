/** Widget dummy de clima. Servidor component con datos estáticos. */
export default function ClimaWidget() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[160px]">
      <span className="text-5xl">🌧</span>
      <p className="text-2xl font-bold text-white">18°C</p>
      <p className="text-sm">Ciudad de México</p>
    </div>
  );
}
