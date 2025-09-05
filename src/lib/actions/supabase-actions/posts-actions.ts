import { hygraphClient } from "@/lib/hygraph";
import { GET_POST_BY_SLUG, GET_POSTS } from "@/lib/hygraph-queries";
import { Noticias } from "@/lib/types/noticia";


export async function fetchPosts(): Promise<Noticias[]> {
  const data = await hygraphClient.request<{ noticias: Noticias[] }>(GET_POSTS);
  return data.noticias; // aqui sim retorna um array de Noticias
}

export async function fetchPostBySlug(slug: string) {
  const { noticia } = await hygraphClient.request<{ noticia: Noticias }>(GET_POST_BY_SLUG, { slug });
  return noticia;
}