'use client';

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { MapPin, BedDouble, Ruler, Tag, Phone, Mail, MessageCircle, Share2, Maximize2, X, ChevronLeft, ChevronRight, Heart, Calendar, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyFilterSidebar } from "@/components/sidebar-filtro";
import { CidadesDisponiveis } from "@/components/cidades-disponiveis";
import { ImoveisDestaque } from "@/components/imoveis-destaque";
import { useAuth } from "@/components/auth-context";
import { getPropertyById } from "@/lib/actions/get-properties";
import { TPropertyResponseSchema } from "@/lib/types/property";
import AgentCardWithChat from "@/components/agent-card-with-chat";
import { useQuery } from "@tanstack/react-query";
import { getPropertyOwner } from "@/lib/actions/get-agent";
import Head from "next/head";

// Componente Skeleton melhorado
const PropertySkeleton = () => {
  return (
    <>
      <Head>
        <title>Carregando imóvel...</title>
        <meta property="og:title" content="Imóvel Incrível" />
        <meta property="og:description" content="Dê uma olhada neste imóvel incrível!" />
        <meta property="og:image" content="/placeholder-image.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <section className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
        <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 animate-pulse overflow-hidden border-b border-gray-200" />

        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-16">
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 items-start">
            <div className="md:col-span-2 space-y-8 sm:space-y-12 order-1 md:order-none">
              <div className="space-y-4 sm:space-y-6">
                <div className="h-7 w-32 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-10 sm:h-12 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 w-48 sm:w-64 bg-gray-300 rounded animate-pulse"></div>
                </div>
                
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-16 sm:w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div className="w-full h-[300px] sm:h-[400px] bg-gray-300 rounded-3xl animate-pulse"></div>
                <div className="flex gap-3 overflow-x-auto">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-300 rounded-xl animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2 border-b overflow-x-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-24 sm:w-32 bg-gray-300 rounded-t-md animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-4/6"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
              </div>

              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mx-auto mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                  <div className="h-12 bg-gray-400 rounded-lg animate-pulse mt-4"></div>
                </div>
              </div>
            </div>

            <div className="hidden md:block md:col-span-1 space-y-6">
              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-40 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border shadow-md rounded-2xl p-6">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const agents = [ 
  {id: 1, name: 'João Fernando', picture: '/people/1.jpg', sales: 25}, 
  {id: 2, name: 'Antonia Miguel', picture: '/people/2.jpg', sales: 18}, 
  {id: 3, name: 'Pedro Afonso', picture: '/people/3.jpg', sales: 32}
]

// Componente para a galeria de imagens com troca e tela cheia
function PropertyGallery({ property }: { property: any }) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    if (property?.gallery && property.gallery.length > 0) {
      setMainImage(property.gallery[0]);
      setThumbnails(property.gallery.slice(1));
      setAllImages(property.gallery);
    }
  }, [property]);

  const handleSwap = (clickedImg: string, idx: number) => {
    if (!mainImage) return;
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage;
    setMainImage(clickedImg);
    setThumbnails(newThumbs);
    
    const clickedIndex = allImages.indexOf(clickedImg);
    if (clickedIndex !== -1) {
      setCurrentIndex(clickedIndex);
    }
  };

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
      );
    } else {
      setCurrentIndex((prevIndex) => 
        prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, closeFullscreen]);

  const FullscreenView = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        <button
          onClick={closeFullscreen}
          className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
          aria-label="Fechar tela cheia"
        >
          <X size={28} />
        </button>

        <button
          onClick={() => navigateImage('prev')}
          className="absolute left-4 text-white p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={() => navigateImage('next')}
          className="absolute right-4 text-white p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
          aria-label="Próxima imagem"
        >
          <ChevronRight size={32} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={allImages[currentIndex]}
            alt={`${property.title} - Imagem ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {allImages.length}
        </div>
      </div>
    );
  };

  return (
    <>
      {mainImage && (
        <div className="mb-6">
          <div className="relative w-full h-[220px] sm:h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-4 group">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover cursor-zoom-in"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
              priority
              onClick={() => openFullscreen(allImages.indexOf(mainImage))}
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Heart size={20} className="text-gray-600" />
              </button>
              <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-50">
              <button
                onClick={() => openFullscreen(allImages.indexOf(mainImage))}
                className="bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Expandir imagem"
              >
                <Maximize2 size={24} className="text-gray-800" />
              </button>
            </div>
          </div>

          {thumbnails.length > 0 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {thumbnails.map((img, idx) => {
                const actualIndex = allImages.indexOf(img);
                return (
                  <button
                    key={idx}
                    onClick={() => handleSwap(img, idx)}
                    className="relative flex-shrink-0 w-20 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-xl overflow-hidden border border-gray-200 shadow cursor-pointer hover:ring-2 hover:ring-purple-400 transition group"
                  >
                    <Image
                      src={img}
                      alt={`${property.title} - miniatura ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 128px, 160px"
                    />
                    
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullscreen(actualIndex);
                      }}
                    >
                      <button
                        className="bg-white bg-opacity-80 p-1 rounded-full hover:bg-opacity-100 transition-all"
                        aria-label="Expandir imagem"
                      >
                        <Maximize2 size={16} className="text-gray-800" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <FullscreenView />
    </>
  );
}

// Componente para o botão de partilha
function ShareButton({ property }: { property: any }) {
  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Dê uma olhada neste imóvel incrível: ${property.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Erro ao partilhar:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors text-sm"
    >
      <Share2 size={16} />
      Partilhar
    </button>
  );
}

// Componente para estatísticas do imóvel
function PropertyStats({ property }: { property: any }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-semibold text-gray-700 mb-3">Estatísticas do Imóvel</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-2">
          <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Eye className="text-orange-500" size={18} />
          </div>
          <p className="text-sm text-gray-600">Visualizações</p>
          <p className="font-bold text-gray-800">1.2K</p>
        </div>
        <div className="p-2">
          <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="text-orange-500" size={18} />
          </div>
          <p className="text-sm text-gray-600">Favoritos</p>
          <p className="font-bold text-gray-800">84</p>
        </div>
        <div className="p-2">
          <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="text-orange-500" size={18} />
          </div>
          <p className="text-sm text-gray-600">Disponível</p>
          <p className="font-bold text-gray-800">Agora</p>
        </div>
      </div>
    </div>
  );
}

// Componente para o menu mobile
function MobileMenu() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 p-2 shadow-lg">
      <div className="flex justify-around items-center">
        <button className="flex flex-col items-center text-xs p-2 text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="mt-1">Início</span>
        </button>
        
        <button className="flex flex-col items-center text-xs p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="mt-1">Comprar</span>
        </button>
        
        <button className="flex flex-col items-center text-xs p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <span className="mt-1">Arrendar</span>
        </button>
        
        <button className="flex flex-col items-center text-xs p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="mt-1">Contato</span>
        </button>
      </div>
    </div>
  );
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [property, setProperty] = useState<TPropertyResponseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const propertyDetails = useQuery({
    queryKey: ['propertie-data-comprar'],
    queryFn: async() => {
      const response = await getPropertyById(id)
      setProperty(response)
      return response
    }
  })

  const ownerDetails = useQuery({
    queryKey: ['owner-data-comprar'],
    queryFn: async() => {
      const response = await getPropertyOwner(propertyDetails.data?.id)
      return response
    }
  })

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setLoading(true);
        const prop = await getPropertyById(id);
        setProperty(prop);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Não foi possível carregar os dados do imóvel.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading || !id) {
    return <PropertySkeleton />;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Erro ao carregar imóvel</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao carregar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Head>
          <title>Imóvel não encontrado</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
            <p className="text-gray-600">O imóvel que você está procurando não existe ou foi removido.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{property.title || "Imóvel Incrível"}</title>
        <meta name="description" content={property.description || "Dê uma olhada neste imóvel incrível!"} />
        
        <meta property="og:title" content={property.title || "Imóvel Incrível"} />
        <meta property="og:description" content={property.description || "Dê uma olhada neste imóvel incrível!"} />
        <meta property="og:image" content={property.gallery && property.gallery.length > 0 ? property.gallery[0] : "/placeholder-image.jpg"} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={property.title || "Imóvel Incrível"} />
        <meta name="twitter:description" content={property.description || "Dê uma olhada neste imóvel incrível!"} />
        <meta name="twitter:image" content={property.gallery && property.gallery.length > 0 ? property.gallery[0] : "/placeholder-image.jpg"} />
      </Head>
      
      <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden pb-16 md:pb-0">
        {/* Header com breadcrumb */}
        <div className="bg-white border-b border-gray-200 py-3 px-4">
          <div className="max-w-7xl mx-auto">
            <nav className="text-sm text-gray-500">
              <span>Início</span> / <span>Imóveis</span> / <span>{property.cidade || 'Cidade'}</span> / <span className="text-gray-800 font-medium">{property.title}</span>
            </nav>
          </div>
        </div>

        {/* Mapa no topo */}
        <div className="w-full h-[250px] sm:h-[350px] overflow-hidden border-b border-gray-200">
          <iframe
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              property.endereco ?? ''
            )}&output=embed`}
          ></iframe>
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-12">
          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Conteúdo principal */}
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              {/* Cabeçalho do imóvel */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                    {property.rotulo || (property.status === "arrendar" ? "Para Alugar" : "À Venda")}
                  </span>
                  <ShareButton property={property} />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words mb-2">
                  {property.title}
                </h1>
                
                <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words line-clamp-2">
                    {[property.endereco, property.bairro, property.cidade, property.provincia, property.pais].filter(Boolean).join(", ")}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {property.tipo && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                      <span className="font-semibold">Tipo:</span> {property.tipo}
                    </div>
                  )}
                  {typeof property.bedrooms !== 'undefined' && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                      <BedDouble className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{property.bedrooms} Quartos</span>
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                      <Ruler className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{property.size}</span>
                    </div>
                  )}
                  {typeof property.bathrooms !== 'undefined' && (
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                      <span className="font-semibold">Banheiros:</span> {property.bathrooms}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xl sm:text-2xl font-extrabold text-orange-500 flex items-center gap-2">
                    {property.price && (
                      <>
                        <Tag className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        {property.price.toLocaleString(
                          property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}
                        {property.unidade_preco && (
                          <span className="text-sm sm:text-base font-normal">
                            {property.unidade_preco === "kwanza"
                              ? "KZ"
                              : property.unidade_preco === "dolar"
                              ? "USD"
                              : property.unidade_preco}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                      <Heart size={16} />
                      Favoritar
                    </button>
                  </div>
                </div>
              </div>

              {/* Galeria de Fotos */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <PropertyGallery property={property} />
              </div>

              {/* Estatísticas do imóvel */}
              <PropertyStats property={property} />

              {/* Detalhes Técnicos */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg">Detalhes Técnicos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {typeof property.area_terreno !== 'undefined' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Área do Terreno</span>
                      <span className="text-gray-800">{property.area_terreno}</span>
                    </div>
                  )}
                  {property.size && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Tamanho</span>
                      <span className="text-gray-800">{property.size}</span>
                    </div>
                  )}
                  {property.garagemtamanho && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Garagem (m²)</span>
                      <span className="text-gray-800">{property.garagemtamanho}</span>
                    </div>
                  )}
                  {typeof property.bedrooms !== 'undefined' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Quartos</span>
                      <span className="text-gray-800">{property.bedrooms}</span>
                    </div>
                  )}
                  {typeof property.bathrooms !== 'undefined' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Banheiros</span>
                      <span className="text-gray-800">{property.bathrooms}</span>
                    </div>
                  )}
                  {typeof property.garagens !== 'undefined' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">Garagens</span>
                      <span className="text-gray-800">{property.garagens}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs Visão Geral */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <Tabs defaultValue="visao-geral" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="visao-geral"
                      className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
                    >
                      Visão Geral
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
                    >
                      Vídeo
                    </TabsTrigger>
                    <TabsTrigger
                      value="tour"
                      className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
                    >
                      Passeio Virtual
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visao-geral" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Informações Básicas</h4>
                        <ul className="space-y-2 text-gray-600">
                          {property.tipo && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Tipo</span>
                              <span className="font-medium">{property.tipo}</span>
                            </li>
                          )}
                          {typeof property.bedrooms !== 'undefined' && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Quartos</span>
                              <span className="font-medium">{property.bedrooms}</span>
                            </li>
                          )}
                          {typeof property.bathrooms !== 'undefined' && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Banheiros</span>
                              <span className="font-medium">{property.bathrooms}</span>
                            </li>
                          )}
                          {typeof property.garagens !== 'undefined' && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Garagens</span>
                              <span className="font-medium">{property.garagens}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h4>
                        <ul className="space-y-2 text-gray-600">
                          {property.anoconstrucao && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Ano de Construção</span>
                              <span className="font-medium">{property.anoconstrucao}</span>
                            </li>
                          )}
                          {property.propertyid && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>ID do Imóvel</span>
                              <span className="font-medium">{property.propertyid}</span>
                            </li>
                          )}
                          {property.status && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Status</span>
                              <span className="font-medium capitalize">{property.status}</span>
                            </li>
                          )}
                          {property.price && (
                            <li className="flex justify-between py-2 border-b border-gray-100">
                              <span>Preço</span>
                              <span className="font-medium text-orange-500">
                                {property.price.toLocaleString(
                                  property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                )}{" "}
                                {property.unidade_preco === "kwanza"
                                  ? "KZ"
                                  : property.unidade_preco === "dolar"
                                  ? "USD"
                                  : property.unidade_preco}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Características */}
                    {property.caracteristicas && Array.isArray(property.caracteristicas) && property.caracteristicas.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Características</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.caracteristicas
                            .filter((c): c is string => typeof c === 'string')
                            .map((c, i) => (
                              <span
                                key={i}
                                className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100"
                              >
                                {c}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Detalhes Adicionais */}
                    {property.detalhesadicionais && Array.isArray(property.detalhesadicionais) && property.detalhesadicionais.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Mais Detalhes</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {property.detalhesadicionais
                            .filter(
                              (d): d is { titulo: string; valor: string } =>
                                typeof d === 'object' &&
                                d !== null &&
                                'titulo' in d &&
                                'valor' in d
                            )
                            .map((d, i) => (
                              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium block text-sm text-gray-500">{d.titulo}</span>
                                <span className="text-gray-800">{d.valor}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="video">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Este imóvel não tem vídeo disponível.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tour">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Este imóvel não tem passeio virtual disponível.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Descrição */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
                <p className="text-gray-600 leading-relaxed">
                  {property.description || 
                    (property.status === "para alugar"
                      ? "Imóvel disponível para arrendamento com excelente localização e infraestrutura. Possui amplos espaços, acabamentos de qualidade e está situado em uma região privilegiada com fácil acesso a comércios, serviços e transporte público."
                      : "Excelente oportunidade de compra. Ideal para moradia ou investimento. Este imóvel oferece conforto, praticidade e potencial de valorização. Agende uma visita e comprove pessoalmente todas as qualidades deste empreendimento.")}
                </p>
              </div>

              {/* Endereço */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Localização</h2>
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
                  <span className="break-words">{property.endereco}</span>
                </div>
                <div className="w-full h-[200px] rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      property.endereco ?? ''
                    )}&output=embed&zoom=15`}
                  ></iframe>
                </div>
              </div>

              {/* Formulário de contato + Agente */}
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Entre em contato com o corretor
                </h3>
                <AgentCardWithChat ownerData={ownerDetails.data} propertyId={property.id} userId={user?.id}/>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Filtro de imóveis */}
                <PropertyFilterSidebar property={property} />

                {/* Cidades disponíveis */}
                <CidadesDisponiveis />

                {/* Imóveis em destaque */}
                <ImoveisDestaque />

                {/* Corretores em destaque */}
                <div className="bg-white border shadow-md rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Corretores em Destaque
                  </h3>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                          <Image
                            src={agent.picture}
                            alt={agent.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500">{agent.sales} imóveis vendidos</p>
                        </div>
                        <button className="text-orange-500 hover:text-orange-600 transition-colors">
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu mobile fixo na parte inferior */}
        <MobileMenu />
      </div>
    </>
  );
}