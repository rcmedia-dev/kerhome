'use client'

import React, { useState } from 'react'; // HMR Refresh
import { Calendar, User, ArrowRight, Search, BookOpen, TrendingUp, Lightbulb } from 'lucide-react';
import { Noticias } from '@/lib/types/noticia';
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPostsClient } from '@/lib/functions/supabase-actions/posts-actions';
import Link from 'next/link';
import readingTime from 'reading-time';




interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultsCount: number;
}

interface PostInfoProps {
  createdAt: string;
  readTime: string;
}

interface PostCardProps {
  post: Noticias;
}

interface FeaturedPostProps {
  post: Noticias;
}

interface FeaturedSectionProps {
  posts: Noticias[];
}

interface PostsGridProps {
  posts: Noticias[];
}



// Componente para o cabeçalho — padrão hero imobiliárias (Aurora & Glassmorphism)
const Header: React.FC = () => (
  <section className="relative bg-[#05020B] overflow-hidden pt-12 pb-40 lg:pt-16 lg:pb-40">
    {/* Ambient Backgrounds / Aurora Effect */}
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#820AD1]/30 blur-[120px] pointer-events-none mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#F97316]/20 blur-[120px] pointer-events-none mix-blend-screen" />

    {/* Subtle Dot Grid Pattern */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

    {/* Content */}
    <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-purple-900/20">
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-sm font-medium tracking-wide text-gray-300">Insights do Mercado</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
        Notícias &amp; <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-[#820AD1]">
          Tendências do Mercado
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light leading-relaxed mb-10">
        Seu guia definitivo para investimentos inteligentes, decoração e tendências do mercado imobiliário em Angola.
      </p>

      {/* Trust Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <BookOpen size={16} className="text-purple-400" />
          <span>Artigos Exclusivos</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <TrendingUp size={16} className="text-purple-400" />
          <span>Análises de Mercado</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <Lightbulb size={16} className="text-orange-400" />
          <span>Dicas de Investimento</span>
        </div>
      </div>
    </div>
  </section>
);

// Componente para a barra de pesquisa
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, resultsCount }) => (
  <div className="container mx-auto px-4 -mt-24 relative z-20">
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Explore nosso acervo
      </h2>
      <div className="relative group">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\" fill=\"%236366f1\" fill-opacity=\"0.1\"/%3E%3C/svg%3E')" }}
        ></div>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="O que você quer descobrir hoje?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-lg"
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center font-medium">
        {resultsCount} artigos encontrados para sua busca
      </p>
    </div>
  </div>
);

// Componente para o badge do redator
const AuthorBadge: React.FC = () => (
  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-100">
    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
    Redação KerCasa
  </span>
);

// Componente para informações do post
const PostInfo: React.FC<PostInfoProps> = ({ createdAt, readTime }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        {formatDate(createdAt)}
      </div>
      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
      <div className="flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" />
        {readTime}m de leitura
      </div>
    </div>
  );
};

type ActionButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  href,
  variant = "primary",
  className = "",
}) => {
  const baseClasses =
    "px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 group text-sm";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl",
    secondary: "text-purple-700 bg-purple-50 hover:bg-purple-100",
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
};

// Componente para o card de post individual
const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const stripHtml = (html?: string): string => {
    return html ? html.replace(/<[^>]*>/g, '') : '';
  };

  // Sanitize title: replace non-breaking spaces (U+00A0 / &nbsp;) with regular spaces
  // Some CMS editors insert &nbsp; instead of spaces â€” these cannot be broken by CSS word-break rules
  const sanitizeTitle = (text: string): string =>
    text.replace(/\u00A0/g, ' ').trim();

  const cleanTitle = sanitizeTitle(post.title);
  const estimatedTime = readingTime(post.content?.html || '')

  return (
    <Link href={`/noticias/${post.slug}`} className="block h-full">
      <article className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full hover:-translate-y-1">
        <div className="h-56 overflow-hidden relative shrink-0">
          <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10"></div>
          <img
            src={post.coverImage?.url || '/house.jpg'}
            alt={cleanTitle}
            loading="eager"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-md shadow-sm uppercase tracking-wide">
              Artigo
            </span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          {/* Meta + Title block: fixed height so all cards align */}
          <div className="flex flex-col gap-2 mb-auto">
            <div className="shrink-0">
              <PostInfo createdAt={post.createdAt} readTime={estimatedTime.minutes.toString()} />
            </div>

            {/* Title: sanitized to remove &nbsp; so CSS word-break works correctly */}
            <div className="min-h-13 h-13 overflow-hidden w-full">
              <h3
                className="text-base font-bold text-gray-900 leading-tight group-hover:text-purple-700 transition-colors"
                style={{
                  hyphens: 'none',
                  WebkitHyphens: 'none',
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {cleanTitle}
              </h3>
            </div>
          </div>


          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <AuthorBadge />
            <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Componente para o post em destaque
const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  const stripHtml = (html?: string): string => {
    return html ? html.replace(/<[^>]*>/g, '') : '';
  };

  // Same &nbsp; sanitization as PostCard to prevent mid-word line breaks
  const sanitizeTitle = (text: string): string =>
    text.replace(/\u00A0/g, ' ').trim();

  const cleanTitle = sanitizeTitle(post.title);
  const estimatedTime = readingTime(post.content?.html || '')

  return (
    <Link href={`/noticias/${post.slug}`} className="block relative bg-black rounded-3xl shadow-2xl overflow-hidden mb-16 text-white group cursor-pointer">
      <div className="absolute inset-0">
        <img
          src={post.coverImage?.url || '/house.jpg'}
          alt={cleanTitle}
          loading="eager"
          className="w-full h-full object-cover object-center opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <div className="relative p-6 sm:p-8 md:p-16 flex flex-col justify-end h-full min-h-80 sm:min-h md:min-h">
        <div className="max-w-3xl">
          <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md mb-6 uppercase tracking-wider">
            Destaque da Semana
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg"
            style={{
              whiteSpace: 'normal',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              hyphens: 'none',
              WebkitHyphens: 'none',
            }}
          >
            {cleanTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(post.createdAt).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {estimatedTime.minutes.toString()} min de leitura
            </div>
          </div>
          <div className="inline-block">
            <button className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 group-hover:gap-4 pointer-events-none">
              Ler Matéria Completa
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Componente para a seção de posts em destaque
const FeaturedSection: React.FC<FeaturedSectionProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  return (
    <div className="mb-20">
      <FeaturedPost post={posts[0]} />
    </div>
  );
};

// Componente para a grid de posts
const PostsGrid: React.FC<PostsGridProps & { isLoading?: boolean }> = ({ posts, isLoading }) => {
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-24">
        <div className="bg-gray-50 rounded-3xl p-12 max-w-lg mx-auto border-2 border-dashed border-gray-200">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Nenhum artigo encontrado
          </h3>
          <p className="text-gray-500 text-lg">
            Parece que não temos nada sobre esse assunto ainda. Tente buscar por outros termos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// Componente para a seção de newsletter
const NewsletterSection: React.FC = () => (
  <div className="relative bg-purple-900 rounded-3xl p-10 md:p-20 overflow-hidden mb-20 text-center">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

    <div className="relative z-10 max-w-2xl mx-auto">
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
        Fique à frente no mercado
      </h3>
      <p className="text-purple-100 mb-10 text-lg leading-relaxed">
        Junte-se a mais de 5.000 assinantes e receba curadoria exclusiva de imóveis, tendências e análises de mercado diretamente no seu e-mail.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10 transition-all focus-within:bg-white/20 focus-within:border-white/30">
        <input
          type="email"
          placeholder="Digite seu melhor e-mail"
          className="flex-1 px-6 py-4 bg-transparent text-white placeholder-purple-200 outline-none text-lg"
        />
        <button className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg">
          Inscrever-se
        </button>
      </div>
      <p className="text-purple-300 text-xs mt-4">
        Prometemos não enviar spam. Cancele a qualquer momento.
      </p>
    </div>
  </div>
);


// Skeleton shimmer para o post em destaque
const FeaturedPostSkeleton = () => (
  <div className="relative bg-gray-200 rounded-3xl overflow-hidden mb-16 min-h-80 sm:min-h-[28rem]">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    <div className="relative p-6 sm:p-8 md:p-16 flex flex-col justify-end h-full">
      <div className="max-w-3xl space-y-4">
        <div className="h-6 w-36 bg-white/20 rounded-md animate-pulse" />
        <div className="h-8 w-3/4 bg-white/20 rounded-lg animate-pulse" />
        <div className="h-8 w-1/2 bg-white/20 rounded-lg animate-pulse" />
        <div className="flex gap-6 mt-4">
          <div className="h-5 w-32 bg-white/20 rounded-md animate-pulse" />
          <div className="h-5 w-28 bg-white/20 rounded-md animate-pulse" />
        </div>
        <div className="h-12 w-48 bg-white/20 rounded-xl mt-4 animate-pulse" />
      </div>
    </div>
  </div>
);

// Skeleton shimmer para um card de post
const PostCardSkeleton = () => (
  <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full relative">
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer z-10" />
    <div className="h-56 bg-gray-200 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      <div className="absolute top-4 left-4 h-6 w-16 bg-gray-300/60 rounded-md animate-pulse" />
    </div>
    <div className="p-6 flex flex-col flex-1">
      <div className="flex flex-col gap-2 mb-auto">
        <div className="flex gap-4">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-1.5 mt-1">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="h-6 w-32 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </article>
);

// Skeleton grid de posts
const PostsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

const KercasaBlog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const stripHtml = (html?: string) => html ? html.replace(/<[^>]*>/g, "") : "";

  // âœ… Aqui está o uso correto da função com o initialPageParam
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    initialPageParam: 0, // ðŸ‘ˆ OBRIGATÓRIO agora
    queryFn: async ({ pageParam }) => fetchPostsClient(pageParam, 10),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length : undefined, // se trouxe menos que 10, acabou
  });

  const allPosts = data?.pages.flat() || [];

  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stripHtml(post.excerpt?.html).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        resultsCount={filteredPosts.length}
      />

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <>
            <FeaturedPostSkeleton />
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Todos os Artigos</h2>
              <PostsGridSkeleton />
            </div>
          </>
        ) : (
          <>
            <FeaturedSection posts={filteredPosts.slice(0, 3)} />

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Todos os Artigos</h2>
              <PostsGrid posts={filteredPosts} isLoading={isLoading} />

          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Carregando..." : "Carregar mais artigos"}
              </button>
            </div>
          )}
        </div>

        <NewsletterSection />
        </>
        )}
      </main>
    </div>
  );
};

export default KercasaBlog;

