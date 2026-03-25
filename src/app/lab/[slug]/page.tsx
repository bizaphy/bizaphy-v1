import { labs } from "@/lib/labs";
import { labExplanations } from "@/lib/lab-explanations";
import { minilabs, MiniLabSlug } from "@/labcontent/mini-labs";
import LabExplanation from "@/app/lab/components/LabExplanation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LabSlugPage(props: PageProps) {
  const params = await props.params;
  const urlSlug = params.slug as MiniLabSlug;

  const lab = labs.find((l) => l.slug === urlSlug);
  const LabComponent = minilabs[urlSlug];

  if (!lab || !LabComponent) {
    return (
      <div>
        <h1>Lab no encontrado</h1>
        <p>No existe un lab con el slug &quot;{params.slug}&quot;.</p>
      </div>
    );
  }

  const explanation = labExplanations.find((e) => e.slug === urlSlug);

  return (
    <div>
      <h1>{lab.title}</h1>
      <p>{lab.description}</p>

      <LabComponent />

      {explanation && <LabExplanation explanation={explanation} />}
    </div>
  );
}
