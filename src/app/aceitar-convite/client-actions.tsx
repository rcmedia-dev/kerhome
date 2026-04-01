'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptAgencyInvite, rejectAgencyInvite } from '@/lib/functions/supabase-actions/agency-invites';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function ClientInviteActions({ token, userEmail }: { token: string; userEmail: string }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'accepted' | 'rejected'>('idle');

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const result = await acceptAgencyInvite(token);
      if (result.success) {
        setStatus('accepted');
        toast.success(`Bem-vindo à equipa ${result.agencyName}!`);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        toast.error(result.error || 'Erro ao aceitar convite.');
        setProcessing(false);
      }
    } catch (err) {
      toast.error('Erro inesperado ao aceitar convite.');
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const result = await rejectAgencyInvite(token);
      if (result.success) {
        setStatus('rejected');
        toast.info('Convite recusado.');
        setTimeout(() => router.push('/'), 2000);
      } else {
        toast.error(result.error || 'Erro ao recursar convite.');
        setProcessing(false);
      }
    } catch (err) {
      toast.error('Erro inesperado ao recusar convite.');
      setProcessing(false);
    }
  };

  if (status === 'accepted') {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Convite Aceite!</h2>
        <p className="text-gray-600 text-sm">A redirecionar-te para o dashboard...</p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Convite Recusado</h2>
        <p className="text-gray-600 text-sm">Voltando para a página inicial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-6 text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Verificado como:</p>
        <p className="text-xs font-bold text-gray-900 truncate">{userEmail}</p>
      </div>

      <button
        onClick={handleAccept}
        disabled={processing}
        className="w-full py-4 bg-[#820AD1] hover:bg-[#6A08AA] text-white rounded-2xl font-black transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aceitar Convite'}
      </button>

      <button
        onClick={handleReject}
        disabled={processing}
        className="w-full py-4 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500 rounded-2xl font-bold transition-all disabled:opacity-50"
      >
        Recusar
      </button>
    </div>
  );
}
