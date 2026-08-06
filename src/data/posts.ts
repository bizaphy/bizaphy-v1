//simulador de bdd/api
export type Post = {
  slug: string;
  title: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "hola-bizaphy",
    title: "Hola bizaphy",
    content: "Este es el primer post de prueba.",
  },
  {
    slug: "parte-2",
    title: "Segundo blog. Se empieza implementacion de nuevos proyectos",
    content:
      "Prox. a incorporar un backend y base de datos SQL para proyecto de japo",
  },
];
