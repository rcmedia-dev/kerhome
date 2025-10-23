import { hygraphClient } from "@/lib/hygraph";
import { GET_POST_BY_SLUG, GET_POSTS } from "@/lib/hygraph-queries";
import { Noticias } from "@/lib/types/noticia";


export async function fetchPosts(page: number = 0, limit: number = 6) {
  const skip = page * limit;
  const data = await hygraphClient.request<{ noticias: Noticias[] }>(GET_POSTS, { first: limit, skip });
  return data.noticias;
}

export async function fetchPostBySlug(slug: string) {
  const { noticia } = await hygraphClient.request<{ noticia: Noticias }>(GET_POST_BY_SLUG, { slug });
  return noticia;
}