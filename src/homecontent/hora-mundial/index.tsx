/** Widget dummy de hora mundial. Servidor component con zonas horarias estáticas. */
export default function HoraMundialWidget() {
  const zonas = [
    { city: "CDMX", time: "14:30" },
    { city: "NYC", time: "15:30" },
    { city: "London", time: "20:30" },
    { city: "Tokyo", time: "05:30" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      {zonas.map((tz) => (
        <div key={tz.city}>
          <p className="text-lg font-bold text-white">{tz.time}</p>
          <p className="text-xs text-zinc-500">{tz.city}</p>
        </div>
      ))}
    </div>
  );
}
