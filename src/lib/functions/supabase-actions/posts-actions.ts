import { hygraphClient } from "@/lib/hygraph";
import { GET_POST_BY_SLUG, GET_POSTS } from "@/lib/hygraph-queries";
import { Noticias } from "@/lib/types/noticia";

/**
 * Busca posts com paginação (server-side, usa Hygraph client direto)
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
 * Busca um post específico pelo slug (server-side, usa Hygraph client direto)
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

/**
 * Busca posts via API route (client-side seguro)
 */
export async function fetchPostsClient(page: number = 0, limit: number = 6) {
  try {
    const skip = page * limit;
    const res = await fetch("/api/hygraph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_POSTS, variables: { first: limit, skip } }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Hygraph API error ${res.status}`);
    const data = await res.json();
    return data.noticias as Noticias[];
  } catch (error) {
    console.error("Erro detalhado fetchPosts (Hygraph client):", error);
    throw error;
  }
}
