import { Share2, MessageCircle, Facebook, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { useTrackEvent } from "@/hooks/use-track-event";
import { toast } from "sonner";

interface ShareButtonProps {
  property: {
    id: string;
    title: string;
    owner_id?: string;
  };
}

// ===== COMPONENTE SHARE BUTTON =====
// Rastreia sub-eventos: share_whatsapp | share_facebook | share_copy_link
export function ShareButton({ property }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { track } = useTrackEvent();

  const shareBase: Omit<Parameters<typeof track>[0], 'event_type'> = {
    entity_type: 'imovel',
    entity_id:   property.id,
    owner_id:    property.owner_id,
  };

  const handleWhatsApp = useCallback(() => {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Dê uma olhada neste imóvel: ${property.title}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    track({ ...shareBase, event_type: 'share_whatsapp' });
    setIsOpen(false);
  }, [property.title, shareBase, track]);

  const handleFacebook = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    track({ ...shareBase, event_type: 'share_facebook' });
    setIsOpen(false);
  }, [shareBase, track]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copiado!");
      track({ ...shareBase, event_type: 'share_copy_link' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
    setIsOpen(false);
  }, [shareBase, track]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Share2 size={16} />
        Partilhar
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-xl p-2 w-48 flex flex-col gap-1">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors w-full text-left"
            >
              <MessageCircle size={16} className="text-green-500" />
              WhatsApp
            </button>

            <button
              onClick={handleFacebook}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors w-full text-left"
            >
              <Facebook size={16} className="text-blue-600" />
              Facebook
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} className="text-gray-400" />
              )}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
