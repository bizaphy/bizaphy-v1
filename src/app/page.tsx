import Image from "next/image";
import TextScramble from "@/app/components/effects/TextScramble";
import DigitalRain from "@/app/components/effects/DigitalRain";
import WidgetList from "@/app/components/home/WidgetList";

/** Página principal del dashboard con hero y grid de widgets. */
export default function Home() {
  return (
    <div className="noise-overlay min-h-screen bg-white dark:bg-black px-4 py-12">
      <DigitalRain />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex flex-col gap-8">
        {/* Hero: título + gif */}
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white">
            <TextScramble text="/neonlab" />
          </h1>
          <div className="relative w-full aspect-video max-w-xl rounded-lg bg-white dark:bg-black">
            <Image
              src="/media/valhalla.gif"
              alt="NeonLab animation"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </header>

        {/* Dashboard grid */}
        <WidgetList />
      </main>
    </div>
  );
}
