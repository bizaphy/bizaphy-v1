import Image from "next/image";
import TextScramble from "@/app/components/effects/TextScramble";

export default function Home() {
  return (
    <div className="noise-overlay flex min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <main className="relative z-10 flex flex-col items-center gap-2 sm:gap-4 text-center w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white">
          <TextScramble text="/neonlab" />
        </h1>
        <div className="relative w-full aspect-video max-w-md sm:max-w-lg md:max-w-2xl rounded-lg bg-white dark:bg-black">
          <Image
            src="/media/valhalla.gif"
            alt="NeonLab animation"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </main>
    </div>
  );
}
