import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Play, View, MessageCircle, Phone, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useChatStore } from '@/lib/store/chat-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VisitScheduler } from './visit-scheduler';


// ===== COMPONENTE FULLSCREEN VIEW =====
export function FullscreenView({ 
  isFullscreen, 
  currentIndex, 
  allImages, 
  property, 
  onClose, 
  onNavigate,
  ownerDetails,
  userId
}: { 
  isFullscreen: boolean;
  currentIndex: number;
  allImages: string[];
  property: any;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  ownerDetails?: any;
  userId?: string;
}) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | '360'>('photos');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { openChat, checkExistingConversation, createConversation } = useChatStore();

  const hasVideo = !!property.video_url;
  const has360 = !!property.imagem_360_da_propriedade;
  const agencyData = property.imobiliarias;

  const displayName = agencyData ? agencyData.nome : (ownerDetails ? `${ownerDetails.primeiro_nome || ''} ${ownerDetails.ultimo_nome || ''}`.trim() : 'Corretor');
  const displayPhone = agencyData ? (agencyData.whatsapp || agencyData.telefone) : (ownerDetails?.telefone);

  const handleStartChat = async () => {
    if (!userId) {
      toast.error('Você precisa estar logado para iniciar um chat.');
      router.push('/login');
      return;
    }

    if (ownerDetails && userId === ownerDetails.id) {
      toast.info("Você não pode iniciar um chat com você mesmo.");
      return;
    }

    setLoading(true);
    try {
      const targetType = agencyData ? 'agency' : 'agent';
      const targetId = ownerDetails?.id;
      if (!targetId) throw new Error("ID do proprietário não encontrado");

      let conversationId = await checkExistingConversation(userId, targetId, targetType);
      
      if (!conversationId) {
        const newConv = await createConversation({
          myId: userId,
          targetId: targetId,
          targetType,
          imobiliariaId: ownerDetails?.imobiliaria_id
        });
        if (newConv) conversationId = newConv.id;
      }

      if (conversationId) {
        openChat(conversationId, agencyData ? {
          id: targetId,
          primeiro_nome: agencyData.nome,
          ultimo_nome: '',
          email: ownerDetails?.email || null,
          avatar_url: agencyData.logo || null
        } : undefined);
        toast.success(`Chat iniciado com ${displayName}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      setActiveTab('photos');
    }
  }, [isFullscreen]);
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* Header fixo com Contacto e Close */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex items-center gap-6 min-w-0">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
          <div className="hidden md:block min-w-0">
            <h2 className="text-gray-900 font-bold text-lg truncate max-w-[300px]">
              {property.title}
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
              Visualização Expandida
            </p>
          </div>
        </div>

        {/* Botões de Ação de Contacto */}
        {ownerDetails && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleStartChat}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
            >
              <MessageCircle size={18} />
              <span className="hidden lg:inline">{loading ? '...' : (agencyData ? 'Chat Agência' : 'Chat Corretor')}</span>
            </button>

            <VisitScheduler 
              property={{
                id: property.id,
                title: property.title,
                image: property.image
              }}
              ownerData={{
                id: ownerDetails.id,
                name: displayName,
                imobiliaria_id: ownerDetails.imobiliaria_id
              }}
              userId={userId}
            >
              <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-orange-900/20">
                <Calendar size={18} />
                <span className="hidden lg:inline">Agendar</span>
              </button>
            </VisitScheduler>

            {displayPhone && (
              <a
                href={`https://wa.me/${displayPhone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${property.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-green-900/20"
              >
                <Phone size={18} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Área Central de Média */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        {activeTab === 'photos' && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-6 text-gray-900 p-4 rounded-full bg-white/60 hover:bg-white/80 border border-black/10 shadow-lg backdrop-blur-md transition-all z-20 group"
              aria-label="Anterior"
            >
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('next')}
              className="absolute right-6 text-gray-900 p-4 rounded-full bg-white/60 hover:bg-white/80 border border-black/10 shadow-lg backdrop-blur-md transition-all z-20 group"
              aria-label="Próximo"
            >
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative w-full h-full p-4 md:p-12">
              <Image
                src={allImages[currentIndex]}
                alt={`${property.title} - ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                unoptimized
              />
            </div>

            {/* Contador de Fotos */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-black/5 text-gray-900 shadow-md font-bold text-sm tracking-wider">
              {currentIndex + 1} <span className="text-gray-300 px-1">/</span> {allImages.length}
            </div>
          </>
        )}

        {activeTab === 'videos' && property.video_url && (
          <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 mx-4">
            <video
              src={property.video_url}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
        )}

        {activeTab === '360' && property.imagem_360_da_propriedade && (
          <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
            <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden border border-white/10 bg-gray-900 group shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <Image
                src={property.imagem_360_da_propriedade}
                alt="360 View"
                fill
                className="object-cover opacity-30 blur-sm"
                unoptimized
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="p-8 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
                  <View size={80} className="text-white/80" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-black text-white mb-2">Visualização 360°</h3>
                  <p className="text-white/50 max-w-md mx-auto px-4">
                    O tour interativo está a ser preparado. Em breve poderá explorar todos os detalhes deste imóvel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer fixo com Navegação de Média */}
      <footer className="h-20 bg-white/80 backdrop-blur-xl border-t border-black/5 flex items-center justify-center z-30 shrink-0">
        <div className="flex items-center gap-3 md:gap-6 px-4">
          
          {/* Photos Button */}
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
              activeTab === 'photos'
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                : 'bg-black/5 text-gray-900 border-black/5 hover:bg-black/10'
            }`}
          >
            <ImageIcon size={18} className={activeTab === 'photos' ? 'text-white' : 'text-gray-500'} />
            <span className="hidden sm:inline text-inherit">Fotos ({allImages.length})</span>
            <span className="sm:hidden text-inherit">{allImages.length}</span>
          </button>

          {/* Videos Button */}
          <button
            onClick={() => hasVideo && setActiveTab('videos')}
            disabled={!hasVideo}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
              activeTab === 'videos'
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                : 'bg-black/5 text-gray-900 border-black/5'
            } ${!hasVideo ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-black/10'}`}
          >
            <Play size={18} className={activeTab === 'videos' ? 'text-white' : 'text-gray-500'} />
            <span className="hidden sm:inline text-inherit">Vídeo ({hasVideo ? 1 : 0})</span>
            <span className="sm:hidden text-inherit">{hasVideo ? 1 : 0}</span>
          </button>

          {/* 360 Button */}
          <button
            onClick={() => has360 && setActiveTab('360')}
            disabled={!has360}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
              activeTab === '360'
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                : 'bg-black/5 text-gray-900 border-black/5'
            } ${!has360 ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-black/10'}`}
          >
            <View size={18} className={activeTab === '360' ? 'text-white' : 'text-gray-500'} />
            <span className="hidden sm:inline text-inherit">360° ({has360 ? 1 : 0})</span>
            <span className="sm:hidden text-inherit">{has360 ? 1 : 0}</span>
          </button>

        </div>
      </footer>
    </div>
  );
};
