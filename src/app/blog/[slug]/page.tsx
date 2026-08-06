import { posts } from "@/data/posts";

// tipo de props que recibe la pagina desde el router
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params;

  // slug que viene desde la URL
  const urlSlug = params.slug;

  // busca el post cuyo slug coincide con el slug de la URL
  const post = posts.find((p) => p.slug === urlSlug);

  // condicion si no encuentra el post
  if (!post) {
    return (
      <div>
        <h1>Post no encontrado</h1>
        <p>No existe un post con el slug "{urlSlug}".</p>
      </div>
    );
  }

  // codigo principal
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
