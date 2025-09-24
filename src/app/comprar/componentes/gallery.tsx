import { Heart, Share2, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FullscreenView } from "./full-screen-view";

// ===== COMPONENTE PROPERTY GALLERY =====
export function PropertyGallery ({ property }: { property: any }) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

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
    if (property?.gallery && property.gallery.length > 0) {
      setMainImage(property.gallery[0]);
      setThumbnails(property.gallery.slice(1));
      setAllImages(property.gallery);
    }
  }, [property]);

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
    if (!isMobile) return;
    
    if (direction === 'prev') {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
      );
    } else {
      setCurrentIndex((prevIndex) => 
        prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
      );
    }
    setMainImage(allImages[currentIndex]);
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

  // Renderização para desktop
  if (!isMobile) {
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

        <FullscreenView
          isFullscreen={isFullscreen}
          currentIndex={currentIndex}
          allImages={allImages}
          property={property}
          onClose={closeFullscreen}
          onNavigate={navigateImage}
        />
      </>
    );
  }

  // Renderização para mobile (carrossel)
  return (
    <>
      {mainImage && (
        <div className="mb-6">
          <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-4 group">
            <Image
              src={allImages[currentIndex]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Heart size={20} className="text-gray-600" />
              </button>
              <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
            
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
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
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
      />
    </>
  );
};