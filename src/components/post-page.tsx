'use client'

import React from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Noticias } from '@/lib/types/noticia';



// Props para o componente
interface PostPageProps {
  post: Noticias;
  relatedPosts?: Noticias[];
}

// Componente para o badge do redator
const AuthorBadge: React.FC = () => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
    Redator KerCasa
  </span>
);

// Componente para informações do post
const PostMetaInfo: React.FC<{ createdAt: string; readTime: string }> = ({ createdAt, readTime }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <AuthorBadge />
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        {formatDate(createdAt)}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        {readTime}
      </div>
    </div>
  );
};

// Componente para ações do post (compartilhar, etc)
const PostActions: React.FC<{ post: Noticias }> = ({ post }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt.html.replace(/<[^>]*>/g, ''),
        url: window.location.href,
      })
      .catch(error => console.log('Erro ao compartilhar:', error));
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
        aria-label="Compartilhar artigo"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">Compartilhar</span>
      </button>
    </div>
  );
};

// Componente para posts relacionados
const RelatedPosts: React.FC<{ posts: Noticias[] }> = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Artigos Relacionados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.slice(0, 2).map((post) => (
          <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-48 overflow-hidden">
              <img 
                src={post.coverImage.url} 
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <AuthorBadge />
                <span className="text-sm text-gray-500">5 min</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight hover:text-purple-700 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {stripHtml(post.excerpt.html)}
              </p>
              
              <Link 
                href={`/blog/${post.slug}`}
                className="text-purple-700 hover:text-orange-500 font-medium text-sm flex items-center gap-1 group"
              >
                Ler mais
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// Componente principal da página do post
const PostPage: React.FC<PostPageProps> = ({ post, relatedPosts }) => {
  // Função para renderizar o conteúdo HTML do post
  const renderContent = () => {
    return { __html: post.content.html };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/noticias"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar para o blog</span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">KERCASA BLOG</h1>
            </div>
            <div className="w-24"></div> {/* Espaçador para centralizar o título */}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Cabeçalho do artigo */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <PostMetaInfo createdAt={post.createdAt} readTime='5 min' />
              <PostActions post={post} />
            </div>
          </div>

          {/* Imagem de destaque */}
          <div className="rounded-xl overflow-hidden mb-8">
            <img 
              src={post.coverImage.url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Conteúdo do artigo */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-purple-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-blockquote:border-purple-700 prose-blockquote:bg-purple-50 prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg prose-li:marker:text-purple-700 mb-12"
            dangerouslySetInnerHTML={renderContent()}
          />

          {/* Autor e informações adicionais */}
          <div className="bg-purple-50 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-2">
                <User className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Redator KerCasa</h3>
                <p className="text-gray-600 text-sm">
                  Especialista em mercado imobiliário com anos de experiência em ajudar pessoas 
                  a encontrar o lar dos sonhos e fazer investimentos inteligentes.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Posts relacionados */}
        {/*<RelatedPosts posts={relatedPosts || []} />*/}
      </main>

      {/* Newsletter */}
      <div className="bg-white border-t border-gray-100 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Receba mais conteúdos como este
            </h3>
            <p className="text-gray-600 mb-8">
              Assine nossa newsletter e fique por dentro das melhores oportunidades e dicas do mercado imobiliário
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
              <button className="bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-all">
                Assinar Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;