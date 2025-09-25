import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";


// ===== COMPONENTE FULLSCREEN VIEW =====
export function FullscreenView({ 
  isFullscreen, 
  currentIndex, 
  allImages, 
  property, 
  onClose, 
  onNavigate 
}: { 
  isFullscreen: boolean;
  currentIndex: number;
  allImages: string[];
  property: any;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, onClose, onNavigate]);

  if (!isFullscreen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
        aria-label="Fechar tela cheia"
      >
        <X size={28} />
      </button>

      <button
        onClick={() => onNavigate('prev')}
        className="absolute left-4 text-white p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-10"
        aria-label="Imagem anterior"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={() => onNavigate('next')}
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