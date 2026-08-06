// app/projects/[slug]/page.tsx
import { projects } from "@/data/projects";
import { projectsMap, ProjectSlug } from "@/content/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  // 1) Resolver params (igual que labs)
  const params = await props.params;

  // 2) Tipar el slug
  const urlSlug = params.slug as ProjectSlug;

  // 3) Buscar metadata del proyecto
  const project = projects.find((p) => p.slug === urlSlug);

  // 4) Buscar implementación del proyecto
  const ProjectComponent = projectsMap[urlSlug];

  // 5) Validación (metadata + implementación)
  if (!project || !ProjectComponent) {
    return (
      <div>
        <h1>Proyecto no encontrado</h1>
        <p>No existe un proyecto con el slug "{params.slug}".</p>
      </div>
    );
  }

  // 6) Render final
return (
  <div className="container mx-auto px-4 py-8 space-y-6">
    {/* Header del proyecto */}
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">
        {project.title}
      </h1>
      <p className="text-zinc-600">
        {project.description}
      </p>
    </div>
    {/* Contenido del proyecto */}
    <ProjectComponent />
  </div>
);
}
