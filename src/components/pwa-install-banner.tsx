'use client';

import { Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'kercasa-pwa-install-dismissed';

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
    const ios = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !isStandalone;

    setIsIos(ios);
    if (isStandalone || dismissed) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (ios) setIsVisible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    setIsVisible(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setIsVisible(false);
    setInstallPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Instalar aplicação Kercasa"
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto max-w-md rounded-[22px] border border-purple-100 bg-white p-4 shadow-[0_16px_42px_rgba(45,25,83,0.2)] md:bottom-5 md:right-5 md:left-auto md:mx-0"
    >
      <div className="flex items-center gap-3 pr-6">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-purple-100 p-1">
          <img src="/favicon.ico" alt="Logo Kercasa" className="h-full w-full rounded-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black leading-tight text-slate-900">Leve a Kercasa consigo</h2>
          {isIos ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Toque em <Share className="mx-0.5 inline h-3.5 w-3.5 text-purple-600" /> e escolha <strong>Adicionar ao Ecrã Principal</strong>.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Abra imóveis e mensagens mais rapidamente.</p>
          )}
        </div>
        <button onClick={dismiss} className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar aviso">
          <X className="h-4 w-4" />
        </button>
      </div>
      {!isIos && (
        <>
          <button onClick={install} className="mt-4 w-full rounded-xl bg-purple-700 px-3 py-2.5 text-xs font-black text-white transition-colors hover:bg-purple-800 active:scale-[0.98]">
          Instalar agora
          </button>
          <button onClick={dismiss} className="mt-2 block w-full rounded-lg px-3 py-1.5 text-xs font-extrabold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
            Agora não
          </button>
        </>
      )}
    </aside>
  );
}
