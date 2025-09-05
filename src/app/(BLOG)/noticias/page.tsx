'use client'

import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Noticias } from '@/lib/types/noticia';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/lib/actions/supabase-actions/posts-actions';
import Link from 'next/link';




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



// Componente para o cabeçalho
const Header: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          KERCASA BLOG
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Seu guia completo no mercado imobiliário
        </p>
      </div>
    </div>
  </header>
);

// Componente para a barra de pesquisa
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, resultsCount }) => (
  <div className="container mx-auto px-4 mt-6">
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Encontre artigos do seu interesse
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar artigos por título ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          {resultsCount} artigo{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  </div>
);

// Componente para o badge do redator
const AuthorBadge: React.FC = () => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
    Redator KerCasa
  </span>
);

// Componente para informações do post (data e tempo de leitura)
const PostInfo: React.FC<PostInfoProps> = ({ createdAt, readTime }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-4 mb-4 flex-wrap">
      <AuthorBadge />
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        {formatDate(createdAt)}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <User className="w-4 h-4" />
        {readTime}
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
    "px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 group max-w-fit"; // 🔥 max-w-fit
  const variants = {
    primary: "bg-purple-700 text-white hover:bg-purple-800",
    secondary: "text-purple-700 hover:text-orange-500",
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
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };



  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="h-48 overflow-hidden">
        <img 
          src={post.coverImage.url} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <AuthorBadge />
          <span className="text-sm text-gray-500">5 min</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight group-hover:text-purple-700 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {stripHtml(post.excerpt.html)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {new Date(post.createdAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          <ActionButton href={`/noticias/${post.slug}`} variant="secondary">
            Ler mais
          </ActionButton>
        </div>
      </div>
    </article>
  );
};

// Componente para o post em destaque
const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="md:flex">
        <div className="md:flex-shrink-0 md:w-1/2">
          <img 
            src={post.coverImage.url} 
            alt={post.title}
            className="h-64 w-full object-cover md:h-full"
          />
        </div>
        <div className="p-8">
          <PostInfo createdAt={post.createdAt} readTime='5 min' />
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
            {post.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            {stripHtml(post.excerpt.html)}
          </p>
          <ActionButton href={`/noticias/${post.slug}`}>
            Ler Artigo
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

// Componente para a seção de posts em destaque
const FeaturedSection: React.FC<FeaturedSectionProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Post em Destaque
      </h2>
      <FeaturedPost post={posts[0]} />
    </div>
  );
};

// Componente para a grid de posts
const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl shadow-sm p-12 max-w-md mx-auto">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar o termo de busca
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// Componente para a seção de newsletter
const NewsletterSection: React.FC = () => (
  <div className="bg-white rounded-xl p-8 md:p-10 shadow-md border border-gray-100 mb-12">
    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
      Receba as Novidades do Mercado Imobiliário
    </h3>
    <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
      Assine nossa newsletter и fique por dentro das melhores oportunidades e dicas do setor
    </p>
    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Seu melhor e-mail"
        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
      />
      <button className="bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-all">
        Assinar
      </button>
    </div>
  </div>
);

// Componente principal do blog
const KercasaBlog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  const blogPosts = useQuery({
    queryKey: ['posts'],
    queryFn: async() => {
        const posts = await fetchPosts()
        return posts
    }
  })

  console.log(blogPosts)

  const filteredPosts = blogPosts?.data?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stripHtml(post.excerpt.html).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        resultsCount={filteredPosts?.length || 0} 
      />
      
      <main className="container mx-auto px-4 py-6">
        <FeaturedSection posts={filteredPosts ?? []} />
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Todos os Artigos
          </h2>
          <PostsGrid posts={filteredPosts ?? []} />
        </div>

        <NewsletterSection />
      </main>
    </div>
  );
};

export default KercasaBlog;