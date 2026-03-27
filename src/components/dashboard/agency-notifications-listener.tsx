'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { toast } from 'sonner';
import { Bell, MessageSquare } from 'lucide-react';

interface AgencyNotificationsListenerProps {
  imobiliariaId: string | null;
}

export function AgencyNotificationsListener({ imobiliariaId }: AgencyNotificationsListenerProps) {
  useEffect(() => {
    if (!imobiliariaId) return;

    const channelName = `agency-${imobiliariaId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('new-lead', (data: { sender_name: string; message: string }) => {
      toast.custom((t) => (
        <div className="bg-[#1A1A1A] text-white p-5 rounded-[2rem] shadow-2xl border border-white/10 flex items-start gap-4 max-w-sm animate-in slide-in-from-right-8 duration-500">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#820AD1] to-[#FF6B00] flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-white animate-ring" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm uppercase tracking-tighter mb-1">Novo Lead Gerado!</h4>
            <p className="text-gray-400 text-xs font-medium mb-3">
              <span className="text-white font-bold">{data.sender_name}</span> enviou uma mensagem de interesse.
            </p>
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => {
                    toast.dismiss(t);
                    // Trigger some action like opening chat list or specific tab if needed
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                  Ver Detalhes
               </button>
            </div>
          </div>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      });
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [imobiliariaId]);

  return null; // Este componente não renderiza nada visualmente por padrão, apenas gerencia eventos
}

