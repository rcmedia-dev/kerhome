'use client'

import { Heart, Share2, Maximize2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { FullscreenView } from "@/components/full-screen";
import { useUserStore } from "@/lib/store/user-store";
import { toggleFavoritoProperty } from '@/lib/functions/toggle-favorite';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { toast } from 'sonner';

export function PropertyGallery({ property }: { property: any }) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const { user } = useUserStore();
  const ownerDetails = property.owner || null;
  const mountedRef = useRef(true);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const images: string[] = [];
    
    if (property?.image && typeof property.image === 'string') {
      images.push(property.image);
    }
    
    if (Array.isArray(property?.gallery)) {
      property.gallery.forEach((img: any) => {
        if (typeof img === 'string' && img && img !== property.image) {
          images.push(img);
        }
      });
    }

    if (images.length > 0) {
      setMainImage(images[0]);
      setThumbnails(images.slice(1));
      setAllImages(images);
    } else {
      setMainImage(null);
      setThumbnails([]);
      setAllImages([]);
    }
    setCurrentIndex(0);
  }, [property]);

  useEffect(() => {
    if (!user || property.id === 'preview-id') { setFavorito(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        if (!cancelled && mountedRef.current) {
          setFavorito(favoritos.some((fav: any) => fav.id === property.id));
        }
      } catch (e) {
        console.error("Error checking favorito:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user, property.id]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const toggleFavorito = useCallback(async () => {
    if (!user) { toast.warning('Você precisa estar autenticado para guardar imóveis.'); return; }
    if (isTogglingFav) return;
    setIsTogglingFav(true);
    const previousState = favorito;
    setFavorito(!favorito);
    try {
      const result = await toggleFavoritoProperty(user.id, property.id);
      if (!result.success) throw new Error(result.error || "Erro ao favoritar");
      setFavorito(result.isFavorited);
    } catch (e) {
      setFavorito(previousState);
      toast.error('Erro ao atualizar favoritos');
    } finally { if (mountedRef.current) setIsTogglingFav(false); }
  }, [user, favorito, property.id, isTogglingFav]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: property.title, url }); } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  }, [property.title]);

  const handleWhatsApp = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Olá, tenho interesse neste imóvel: ${property.title}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }, [property.title]);

  const handleSwap = (clickedImg: string, idx: number) => {
    if (!mainImage || isMobile) return;
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage;
    setMainImage(clickedImg);
    setThumbnails(newThumbs);

    const clickedIndex = allImages.indexOf(clickedImg);
    if (clickedIndex !== -1) {
      setCurrentIndex(clickedIndex);
    }
  };

  const handleCarouselNavigation = (direction: 'prev' | 'next') => {
    if (allImages.length === 0) return;

    let nextIndex = currentIndex;
    if (direction === 'prev') {
      nextIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    }
    setCurrentIndex(nextIndex);
    setMainImage(allImages[nextIndex]);
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
    handleCarouselNavigation(direction);
  };

  const hasVideo = !!(property as any).video_url;
  const hasTour360 = !!(property as any).tour_url || !!(property as any).imagem_360_da_propriedade;

  const galleryActions = (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      {hasVideo || hasTour360 ? (
        <div className="px-3 py-1.5 rounded-full bg-purple-600/90 backdrop-blur-sm border border-purple-400/30 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
          <span className="text-sm">▶</span>
          <span>{hasTour360 ? 'Tour 360°' : 'Vídeo'}</span>
        </div>
      ) : null}
      <button
        onClick={handleWhatsApp}
        className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
        title="Partilhar no WhatsApp"
      >
        <MessageCircle size={20} className="text-green-500" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleShare(); }}
        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        title="Partilhar"
      >
        <Share2 size={20} className="text-gray-600" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorito(); }}
        disabled={isTogglingFav}
        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        title={favorito ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
      >
        <Heart size={20} className={favorito ? 'text-red-500 fill-red-500' : 'text-gray-600'} />
      </button>
    </div>
  );

  const photoCounter = allImages.length > 1 && (
    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white font-bold text-sm shadow-lg z-10">
      <span className="text-white/90">{currentIndex + 1}</span>
      <span className="text-white/40 mx-1.5">/</span>
      <span className="text-white/90">{allImages.length}</span>
    </div>
  );

  if (!isMobile) {
    return (
      <>
        {mainImage && (
          <div>
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group">
              <Image
                src={mainImage}
                alt={property.title}
                fill
                className="object-cover cursor-zoom-in"
                sizes="100vw"
                priority
                unoptimized={true}
                onClick={() => openFullscreen(allImages.indexOf(mainImage))}
              />

              {galleryActions}
              {photoCounter}

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
                    <div
                      key={idx}
                      onClick={() => handleSwap(img, idx)}
                      role="button"
                      tabIndex={0}
                      className="relative flex-shrink-0 w-20 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-xl overflow-hidden border border-gray-200 shadow cursor-pointer hover:ring-2 hover:ring-purple-400 transition group"
                    >
                      <Image
                        src={img}
                        alt={`${property.title} - miniatura ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 128px, 160px"
                        unoptimized={true}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <FullscreenView
          isFullscreen={isFullscreen}
          currentIndex={currentIndex}
          allImages={allImages}
          property={property}
          onClose={closeFullscreen}
          onNavigate={navigateImage}
          ownerDetails={ownerDetails}
          userId={user?.id}
        />
      </>
    );
  }

  return (
    <>
      {mainImage && (
        <div className="mb-6">
          <div className="relative w-full max-w-full h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-4 group">
            <Image
              src={allImages[currentIndex]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={true}
            />

            {galleryActions}
            {photoCounter}

            <button
              onClick={() => handleCarouselNavigation('prev')}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => handleCarouselNavigation('next')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-50">
              <button
                onClick={() => openFullscreen(currentIndex)}
                className="bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Expandir imagem"
              >
                <Maximize2 size={24} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}

      <FullscreenView
        isFullscreen={isFullscreen}
        currentIndex={currentIndex}
        allImages={allImages}
        property={property}
        onClose={closeFullscreen}
        onNavigate={navigateImage}
        ownerDetails={ownerDetails}
        userId={user?.id}
      />
    </>
  );
}
