import { notFound } from "next/navigation";
import PostPage from "@/components/post-page";
import { fetchPostBySlug, fetchPosts } from "@/lib/functions/supabase-actions/posts-actions";
import { getLimitedProperties } from "@/lib/functions/get-properties";

// Interface atualizada para Next.js 15
interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Página como Server Component
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Fetch related posts (latest 3 excluding current)
    const allPosts = await fetchPosts(0, 4);
    const relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3);

    // Fetch properties for dynamic ads (pool of 20)
    const properties = await getLimitedProperties(20);

    return <PostPage post={post} relatedPosts={relatedPosts} properties={properties} />;
  } catch (error) {
    console.error("Error in BlogPostPage rendering slug:", (await params).slug, error);
    throw error;
  }
}

// Gerar metadados para SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return { title: "Post não encontrado | Kercasa Blog" };
  }

  const excerptText = post.excerpt?.html?.replace(/<[^>]*>/g, "") || "";

  return {
    title: `${post.title} | Kercasa Blog`,
    description: excerptText,
    openGraph: {
      title: post.title,
      description: excerptText,
      images: [post.coverImage?.url || '/house.jpg'],
      type: "article",
      publishedTime: post.createdAt,
      authors: ['Redator KerCasa'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerptText,
      images: [post.coverImage?.url || '/house.jpg'],
    },
  };
}