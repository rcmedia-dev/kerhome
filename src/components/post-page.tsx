'use client'

import { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Clock,
  Share2,
  Twitter,
  Facebook,
  Link as LinkIcon,
  ChevronRight,
  Home,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import readingTime from 'reading-time';
import { toast } from 'sonner';
import { Noticias } from '@/lib/types/noticia';
import { TPropertyResponseSchema } from '@/lib/types/property';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

// Props
interface PostPageProps {
  post: Noticias;
  relatedPosts?: Noticias[];
  properties?: TPropertyResponseSchema[];
}

// Reading Progress Bar
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-[64px] left-0 right-0 h-1 bg-purple-700 z-50 origin-left"
      style={{ scaleX }}
    />
  );
};

// --- NEW COMPONENTS FOR ADS AND LAYOUT ---

const PropertyAd = ({ property, layout = 'horizontal' }: { property: TPropertyResponseSchema, layout?: 'horizontal' | 'sidebar' }) => {
  if (layout === 'sidebar') {
    return (
      <Link href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`} className="bg-white p-4 rounded-3xl border border-gray-100 group cursor-pointer block hover:shadow-xl transition-all">
        <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-sm mb-4">
          <img
            src={property.image || '/house10.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">Sugestão Kercasa</div>
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold">
            {property.price?.toLocaleString()} Kz
          </div>
        </div>
        <h4 className="text-gray-900 font-bold text-sm leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
          {property.title}
        </h4>
        <p className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-widest">{property.bairro || property.cidade}</p>
      </Link>
    );
  }

  return (
    <div className="my-12 p-1 bg-linear-to-br from-gray-50 to-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl group/ad">
      <div className="bg-white rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-2/5 aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 relative shadow-inner">
          <img
            src={property.image || "/house12.jpg"}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/ad:scale-110"
          />
          <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-10">Sugestão Kercasa</div>
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover/ad:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 text-center md:text-left flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">Negócio em Destaque</span>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight line-clamp-2 group-hover/ad:text-purple-700 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span className="text-2xl font-black text-gray-900 line-clamp-1">
                {property.price?.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase">Kz</span>
              </span>
              <div className="w-px h-6 bg-gray-200" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{property.bairro || property.cidade}</span>
            </div>
          </div>

          <div>
            <Link
              href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`}
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#7C3AED] text-white !text-white rounded-2xl text-base font-black hover:bg-[#6D28D9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-100/50"
            >
              <span className="text-white">Ver Detalhes do Imóvel</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safely inject ad after the 2nd paragraph
const injectAdAtParagraph = (html: string, ad: React.ReactNode, paragraphIndex: number = 2) => {
  const parts = html.split('</p>');
  if (parts.length <= paragraphIndex) return <div dangerouslySetInnerHTML={{ __html: html }} />;

  const before = parts.slice(0, paragraphIndex).join('</p>') + '</p>';
  const after = parts.slice(paragraphIndex).join('</p>');

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: before }} />
      {ad}
      <div dangerouslySetInnerHTML={{ __html: after }} />
    </>
  );
};

// Breadcrumbs
const Breadcrumbs: React.FC<{ title: string }> = ({ title }) => (
  <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 overflow-hidden whitespace-nowrap">
    <Link href="/" className="hover:text-purple-700 transition-colors">
      <Home size={14} />
    </Link>
    <ChevronRight size={10} className="shrink-0 text-gray-300" />
    <Link href="/noticias" className="hover:text-purple-700 transition-colors">
      INSIGHTS
    </Link>
    <ChevronRight size={10} className="shrink-0 text-gray-300" />
    <span className="text-gray-900 truncate">{title}</span>
  </nav>
);

// Sidebar Component (Author, Share, Newsletter)
const Sidebar: React.FC<{ post: Noticias; ads: TPropertyResponseSchema[] }> = ({ post, ads }) => {
  const handleShare = (platform?: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = post.title;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(url);
        toast.success('Link copiado!');
      }
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Sidebar Ad Cards */}
      {ads.map((ad) => (
        <PropertyAd key={ad.id} property={ad} layout="sidebar" />
      ))}

      {/* Share Actions */}
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-gray-300"></span>
          Partilhar
        </h3>
        <div className="flex gap-2">
          <button onClick={() => handleShare('twitter')} className="flex-1 py-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors flex justify-center items-center">
            <Twitter size={18} />
          </button>
          <button onClick={() => handleShare('facebook')} className="flex-1 py-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors flex justify-center items-center">
            <Facebook size={18} />
          </button>
          <button onClick={() => handleShare()} className="flex-1 py-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors flex justify-center items-center">
            <LinkIcon size={18} />
          </button>
        </div>
      </div>

      {/* Mini Newsletter */}
      <div className="bg-gray-900 p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/30 transition-colors"></div>
        <div className="relative z-10">
          <h3 className="text-white font-bold text-lg leading-tight mb-2">Newsletter Semanal</h3>
          <p className="text-gray-400 text-xs mb-4">Receba as melhores oportunidades.</p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button className="w-full bg-white text-gray-900 font-bold text-xs uppercase tracking-widest py-2.5 rounded-lg hover:bg-purple-700 hover:text-white transition-colors">
              Inscrever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const PostPage: React.FC<PostPageProps> = ({ post, relatedPosts, properties }) => {
  const [selectedAds, setSelectedAds] = useState<TPropertyResponseSchema[]>([]);
  const estimatedTime = readingTime(post.content?.html || '');

  useEffect(() => {
    if (properties && properties.length > 0) {
      // Pick 3 unique random properties
      const shuffled = [...properties].sort(() => 0.5 - Math.random());
      setSelectedAds(shuffled.slice(0, 3));
    }
  }, [properties]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-purple-200 selection:text-purple-900">
      <ReadingProgress />

      {/* Main Layout */}
      <div className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">

          {/* Hero Section */}
          <div className="max-w-5xl mx-auto mb-12 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="flex justify-start mb-6">
                <Breadcrumbs title={post.title} />
              </div>

              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-8 w-full max-w-full"
                style={{ wordBreak: 'normal', overflowWrap: 'break-word', hyphens: 'none', whiteSpace: 'normal' }}
              >
                {post.title}
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 text-sm font-medium text-gray-500 border-t border-gray-100 pt-8 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Autor</span>
                    <span className="text-gray-900">Redação KerCasa</span>
                  </div>
                </div>

                <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {estimatedTime.text.replace('read', 'de leitura')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-video md:aspect-21/9 rounded-3xl overflow-hidden shadow-2xl mb-16 md:mb-24 bg-gray-100 relative"
          >
            <img
              src={post.coverImage?.url || '/house.jpg'}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>

          {/* Wrapper Grid (Content + Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">

            {/* Sidebar (Appears AFTER content on mobile, sticky on desktop) */}
            <aside className="lg:col-span-4 order-last">
              <div className="lg:sticky lg:top-28 space-y-12">
                <Sidebar post={post} ads={selectedAds.slice(1, 3)} />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-8 order-first overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Deck / Excerpt */}
                <div className="w-full mb-12 border-l-4 border-purple-500 pl-6 py-2">
                  <p className="text-lg md:text-2xl leading-relaxed text-gray-600 font-serif italic whitespace-pre-wrap break-words">
                    {post.excerpt?.html?.replace(/<[^>]*>/g, '') || ''}
                  </p>
                </div>

                {/* Article Body with injected ad */}
                <article className="prose prose-lg md:prose-xl prose-stone max-w-[720px] mx-auto w-full 
                     prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 prose-headings:mt-12 prose-headings:mb-6
                     prose-p:text-gray-600 prose-p:leading-[1.7] prose-p:break-words
                     prose-a:text-purple-700 prose-a:no-underline hover:prose-a:underline prose-a:font-bold
                     prose-img:rounded-3xl prose-img:shadow-lg prose-img:my-12 prose-img:w-full prose-img:h-auto prose-img:object-cover
                     prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic
                     prose-ul:pl-6 prose-ul:list-disc
                     first-letter:text-6xl first-letter:font-black first-letter:text-gray-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]
                   ">
                  <div className="w-full break-words overflow-x-auto">
                    {injectAdAtParagraph(
                      post.content?.html || '',
                      selectedAds[0] ? <PropertyAd property={selectedAds[0]} /> : null
                    )}
                  </div>
                </article>

                {/* Tags Section */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {['Imobiliário', 'Mercado', 'Luanda', 'Investimento'].map(tag => (
                      <span key={tag} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-bold hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </main>
          </div>

          {/* --- Bottom Related Posts Grid (3x1) --- */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-gray-100 max-w-7xl mx-auto">


              <div className="flex items-center justify-between mb-10 px-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
                  Leia a seguir
                </h2>
                <Link href="/noticias" className="text-purple-700 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Ver todos os artigos
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gridAutoRows: 'auto', gap: '2rem' }} className="px-4">
                {relatedPosts.slice(0, 3).map((rp) => (
                  <Link
                    href={`/noticias/${rp.slug}`}
                    key={rp.id}
                    className="group bg-gray-50/50 rounded-3xl p-4 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100"
                    style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
                  >
                    <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-gray-200">
                      <img
                        src={rp.coverImage?.url || '/house.jpg'}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest px-2 py-0.5 bg-purple-50 rounded-md">Artigo</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(rp.createdAt).toLocaleDateString('pt-AO', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3
                        className="font-black text-gray-900 text-base md:text-lg leading-snug group-hover:text-purple-700 transition-colors mb-4"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', hyphens: 'none', overflowWrap: 'anywhere', wordBreak: 'normal' }}
                      >
                        {rp.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between text-purple-700">
                        <span className="text-xs font-bold uppercase tracking-widest">Ler mais</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Newsletter Large */}
      <section className="bg-purple-900 py-24 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Não perca nada.</h2>
          <p className="text-purple-100 text-lg mb-10 max-w-xl mx-auto">
            Junte-se à nossa comunidade e receba atualizações exclusivas do mercado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="px-6 py-4 rounded-xl bg-white/10 text-white placeholder:text-purple-200 border border-white/20 focus:outline-none focus:bg-white/20 backdrop-blur-sm"
            />
            <button className="px-8 py-4 rounded-xl bg-white text-purple-900 font-bold uppercase tracking-widest hover:bg-purple-50 transition-colors shadow-lg">
              Entrar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostPage;
