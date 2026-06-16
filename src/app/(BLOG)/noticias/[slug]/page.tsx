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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';
  const postUrl = `${siteUrl}/noticias/${slug}`;

  return {
    title: `${post.title} | Kercasa Blog`,
    description: excerptText.substring(0, 200),
    alternates: { canonical: postUrl },
    openGraph: {
      title: post.title,
      description: excerptText.substring(0, 200),
      url: postUrl,
      images: [{ url: post.coverImage?.url || '/house.jpg', width: 1200, height: 630, alt: post.title }],
      type: "article",
      locale: "pt_AO",
      siteName: "Kercasa",
      publishedTime: post.createdAt,
      authors: ['Redator KerCasa'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerptText.substring(0, 200),
      images: [post.coverImage?.url || '/house.jpg'],
    },
    robots: { index: true, follow: true },
  };
}