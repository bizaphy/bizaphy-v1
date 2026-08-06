import Image from "next/image";
import TextScramble from "@/components/effects/TextScramble";

import WidgetList from "@/components/widgets/WidgetList";

/** Página principal del dashboard con hero y grid de widgets. */
export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12">
      <main className="relative z-10 mx-auto w-full max-w-3xl flex flex-col gap-8">
        {/* Hero: título + gif */}
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
            <TextScramble text="/bizaphy" />
          </h1>
          <div className="relative w-full aspect-video max-w-xl rounded-lg">
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
