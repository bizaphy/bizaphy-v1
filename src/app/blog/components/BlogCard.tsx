// Presentation Component o Dumb Component

import Link from "next/link";
import TextScramble from "@/components/effects/TextScramble";

type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
};

export default function BlogCard({ slug, title, excerpt }: BlogCardProps) {
  return (
    <article className="neon-card">
      <h2 className="neon-card-title text-lg font-semibold">
        <TextScramble text={title} />
      </h2>
      <p className="neon-card-text mt-2 text-sm text-zinc-600">{excerpt}</p>

      {/* enlace a post individual */}
      <Link href={`/blog/${slug}`} className="neon-link">
        Leer mas
      </Link>
    </article>
  );
}
