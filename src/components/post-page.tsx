'use client'

import React from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import readingTime from 'reading-time';
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
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        {formatDate(createdAt)}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
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
        className="flex items-center gap-2 text-gray-700 hover:text-purple-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
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
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Artigos Relacionados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.slice(0, 2).map((post) => (
          <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="h-48 overflow-hidden">
              <img 
                src={post.coverImage.url} 
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AuthorBadge />
                <span className="text-sm text-gray-500">{}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight hover:text-purple-700 transition-colors line-clamp-2">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 mb-5 text-sm leading-relaxed line-clamp-3">
                {stripHtml(post.excerpt.html)}
              </p>
              
              <Link 
                href={`/blog/${post.slug}`}
                className="text-purple-700 hover:text-purple-800 font-medium text-sm flex items-center gap-1 group transition-colors"
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

  const estimatedTime = readingTime(post.content.html) 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-[8%] py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/noticias"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
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
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-4 border-t border-b border-gray-100">
              <PostMetaInfo createdAt={post.createdAt} readTime={estimatedTime.minutes.toString()} />
              <PostActions post={post} />
            </div>
          </div>

          {/* Imagem de destaque */}
          <div className="rounded-xl overflow-hidden mb-10 shadow-md">
            <img 
              src={post.coverImage.url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Conteúdo do artigo */}
          <div className="mb-16">
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-5 prose-headings:mt-10
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-purple-700 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-strong:text-gray-900
                prose-blockquote:border-purple-600 prose-blockquote:bg-purple-50 prose-blockquote:text-gray-800 prose-blockquote:rounded-xl prose-blockquote:p-6 prose-blockquote:my-8
                prose-ol:my-6 prose-ul:my-6
                prose-li:marker:text-purple-600 prose-li:mb-2
                prose-hr:my-10 prose-hr:border-gray-200
                prose-img:rounded-xl prose-img:shadow-md prose-img:my-8"
              dangerouslySetInnerHTML={renderContent()}
            />
          </div>

          {/* Autor e informações adicionais */}
          <div className="bg-purple-50 rounded-2xl p-8 mb-16 border border-purple-100">
            <div className="flex items-start gap-6">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <User className="w-7 h-7 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Redator KerCasa</h3>
                <p className="text-gray-700 leading-relaxed">
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
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-5">
              Receba mais conteúdos como este
            </h3>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Assine nossa newsletter e fique por dentro das melhores oportunidades e dicas do mercado imobiliário
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-5 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-500"
              />
              <button className="bg-purple-700 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-purple-800 transition-all shadow-md hover:shadow-lg">
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