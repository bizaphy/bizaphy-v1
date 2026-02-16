// app/projects/page.tsx
import ProjectList from "./components/ProjectList";

import TextScramble from "@/app/components/effects/TextScramble";

export default function ProjectsPage() {
  return (
    <main className="relative mx-auto max-w-3xl p-6">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Projects" />
        </h1>

        <p className="mt-2 text-sm opacity-80">
          Proyectos más grandes (a diferencia de /lab).
        </p>

        <section className="mt-6">
          <ProjectList />
        </section>
      </div>
    </main>
  );
}
