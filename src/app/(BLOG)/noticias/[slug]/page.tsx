import { notFound } from "next/navigation";
import PostPage from "@/components/post-page";
import { fetchPostBySlug } from "@/lib/functions/supabase-actions/posts-actions";

// Interface atualizada para Next.js 15
interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Página como Server Component
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <PostPage post={post} />;
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