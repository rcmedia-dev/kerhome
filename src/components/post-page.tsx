'use client'

import {
  Calendar,
  User,
  ArrowLeft,
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
      className="fixed top-[64px] left-0 right-0 h-1 bg-purple-700 z-30 origin-left"
      style={{ scaleX }}
    />
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
const Sidebar: React.FC<{ post: Noticias }> = ({ post }) => {
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
      {/* Ad Card 1 */}
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 group cursor-pointer">
        <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-sm">
          <img
            src="/house10.jpg"
            alt="Publicidade"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Anúncio
            </span>
          </div>
        </div>
      </div>

      {/* Ad Card 2 */}
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 group cursor-pointer">
        <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-sm">
          <img
            src="/house11.jpg"
            alt="Publicidade"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Anúncio
            </span>
          </div>
        </div>
      </div>

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
          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 mb-2 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button className="w-full bg-white text-gray-900 font-bold text-xs uppercase tracking-widest py-2.5 rounded-lg hover:bg-purple-700 hover:text-white transition-colors">
            Inscrever
          </button>
        </div>
      </div>
    </div>
  );
};

const PostPage: React.FC<PostPageProps> = ({ post, relatedPosts }) => {
  const estimatedTime = readingTime(post.content.html);

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
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <div className="max-w-5xl mx-auto mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <div className="flex justify-center md:justify-start mb-6">
                <Breadcrumbs title={post.title} />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8 text-balance">
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
              src={post.coverImage.url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>

          {/* Wrapper Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">

            {/* Main Content */}
            <main className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Deck / Excerpt */}
                <p className="text-xl md:text-2xl leading-relaxed text-gray-500 font-serif italic mb-12 border-l-4 border-purple-500 pl-6 py-1">
                  {post.excerpt.html.replace(/<[^>]*>/g, '')}
                </p>

                {/* Article Body */}
                <article className="prose prose-lg md:prose-xl prose-stone max-w-none
                     prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
                     prose-p:text-gray-600 prose-p:leading-loose
                     prose-a:text-purple-700 prose-a:no-underline hover:prose-a:underline prose-a:font-bold
                     prose-img:rounded-3xl prose-img:shadow-lg prose-img:my-12
                     prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic
                     first-letter:text-6xl first-letter:font-black first-letter:text-gray-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]
                   ">
                  <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
                </article>

                {/* Tags Section (Placeholder for now) */}
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

            {/* Sidebar */}
            <aside className="lg:col-span-4 pl-0 lg:pl-12">
              <div className="sticky top-28 space-y-12">
                <Sidebar post={post} />

                {/* Related (Desktop Sidebar View) */}
                {relatedPosts && relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <span className="w-4 h-px bg-gray-300"></span>
                      Leia Também
                    </h3>
                    <div className="space-y-6">
                      {relatedPosts.slice(0, 2).map((rp) => (
                        <Link href={`/noticias/${rp.slug}`} key={rp.id} className="group block">
                          <div className="aspect-3/2 rounded-xl overflow-hidden mb-3 bg-gray-100">
                            <img src={rp.coverImage.url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <h4 className="font-bold text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">
                            {rp.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
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