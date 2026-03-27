import { hygraphClient } from "@/lib/hygraph";
import { GET_POST_BY_SLUG, GET_POSTS } from "@/lib/hygraph-queries";
import { Noticias } from "@/lib/types/noticia";

/**
 * Busca posts com paginação
 */
export async function fetchPosts(page: number = 0, limit: number = 6) {
  try {
    const skip = page * limit;
    const data = await hygraphClient.request<{ noticias: Noticias[] }>(GET_POSTS, { first: limit, skip });
    return data.noticias;
  } catch (error) {
    console.error("Erro detalhado fetchPosts (Hygraph):", error);
    throw error;
  }
}

/**
 * Busca um post específico pelo slug
 */
export async function fetchPostBySlug(slug: string) {
  try {
    const { noticia } = await hygraphClient.request<{ noticia: Noticias }>(GET_POST_BY_SLUG, { slug });
    return noticia;
  } catch (error) {
    console.error(`Erro detalhado fetchPostBySlug (Slug: ${slug}):`, error);
    throw error;
  }
}
