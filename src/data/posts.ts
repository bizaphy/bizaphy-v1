//simulador de bdd/api
export type Post = {
  slug: string;
  title: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "hola-neonlab",
    title: "Hola NeonLab",
    content: "Este es el primer post de prueba.",
  },
  {
    slug: "react-basico",
    title: "React Básico",
    content: "Introducción a React paso a paso.",
  },
];
