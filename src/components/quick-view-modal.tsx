'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BedDouble, Bath, Ruler, MapPin, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export function QuickViewModal({
  property,
  onClose
}: {
  property: any;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const images = [property.image, ...(Array.isArray(property.gallery) ? property.gallery.filter(Boolean) : [])].filter(Boolean);
  const priceParsed = (() => {
    const n = typeof property.price === 'string' ? parseInt(property.price) : property.price;
    return isNaN(Number(n)) ? 0 : Number(n);
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-3xl overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Gallery */}
          <div className="relative h-[300px] sm:h-[400px] w-full shrink-0 bg-gray-100">
            <Image
              src={images[imageIndex] || '/house.jpg'}
              alt={property.title || 'Imóvel'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              unoptimized
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setImageIndex(i => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h2>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="line-clamp-1">{property.endereco || 'Localização não informada'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Tag className="w-5 h-5 text-orange-500 -rotate-90" />
              <span className="text-2xl font-bold text-orange-600">
                {priceParsed.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {property.unidade_preco === 'dolar' ? '$' : property.unidade_preco === 'euro' ? '€' : 'Kz'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-y border-gray-100 py-4">
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-gray-400" />
                <span>{property.bedrooms || 0} Quartos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.bathrooms || 0} Banheiros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span>{property.size || property.area_terreno || '—'}</span>
              </div>
            </div>

            {property.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {property.description}
              </p>
            )}

            <Link
              href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`}
              onClick={onClose}
              className="block w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Detalhes Completos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
