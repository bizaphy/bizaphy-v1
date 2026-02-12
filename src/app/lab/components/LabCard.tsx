//Componente de presentacion
//SOLO RENDERIZA UI

import Link from "next/link";
import TextScramble from "@/app/components/effects/TextScramble";

//def de tipados/props para la card

type LabCardProps = {
  slug: string;
  title: string;
  description: string;
};

export default function LabCard({ slug, title, description }: LabCardProps) {
  return (
    <article className="neon-card">
      <h2 className="neon-card-title text-lg font-semibold">
        <TextScramble text={title} />
      </h2>

      <p className="neon-card-text mt-2 text-sm text-zinc-600">{description}</p>

      <Link href={`/lab/${slug}`} className="neon-link">
        Ir al lab
      </Link>
    </article>
  );
}
