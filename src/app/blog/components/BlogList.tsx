// Container component liviano
// No es page, conoce estructura de datos y conecta datos con UI

import BlogCard from "./BlogCard";
import { posts } from "@/data/posts";

export default function BlogList() {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BlogCard
          key={post.slug}
          slug={post.slug}
          title={post.title}
          excerpt={post.content}
        />
      ))}
    </div>
  );
}
