import { Share2 } from "lucide-react";

// ===== COMPONENTE SHARE BUTTON =====
export function ShareButton({ property }: { property: any }) {
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
};