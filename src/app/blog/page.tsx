//page.tsx es la pagina renderizable, dentro de la carpeta, que en next corresponde al segmento URL
import BlogList from "./components/BlogList";
import TextScramble from "@/components/effects/TextScramble";


export default function BlogPage() {
  return (
    <section className="relative space-y-8">
      <div className="relative z-10 space-y-8">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Neon Blog" />
        </h1>
        <BlogList />
      </div>
    </section>
  );
}
