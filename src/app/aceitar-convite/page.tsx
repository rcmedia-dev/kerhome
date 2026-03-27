'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Building2, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { getInviteByToken, acceptAgencyInvite } from '@/lib/functions/supabase-actions/agency-invites';
import { useUserStore } from '@/lib/store/user-store';
import { toast } from 'sonner';
import Image from 'next/image';

function InviteContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { user, isLoading: authLoading } = useUserStore();
    const [isPending, startTransition] = useTransition();
    
    const [inviteData, setInviteData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Token de convite não fornecido.');
            setLoading(false);
            return;
        }

        async function loadInvite() {
            const result = await getInviteByToken(token!);
            if (result.invite) {
                setInviteData(result.invite);
            } else {
                setError(result.error || 'Erro ao carregar convite.');
            }
            setLoading(false);
        }

        loadInvite();
    }, [token]);

    const handleAccept = () => {
        if (!token) return;
        
        startTransition(async () => {
            const result = await acceptAgencyInvite(token);
            if (result.success) {
                toast.success(`Bem-vindo à equipa ${result.agencyName}!`, {
                    description: "Agora fazes parte da equipa oficial da agência.",
                    duration: 5000
                });
                router.push('/dashboard');
            } else {
                toast.error(result.error || 'Erro ao aceitar convite.');
            }
        });
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Verificando convite seguro...</p>
                </div>
            </div>
        );
    }

    if (error || !inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center"
                >
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-4">Ups! Problema no Convite</h1>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        {error || 'Não conseguimos validar este link. Ele pode ter expirado ou ser inválido.'}
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                        Voltar para o Início
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center"
                >
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-4">Convite Profissional</h1>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        Recebeste um convite para te juntares à <strong>{inviteData.imobiliaria.nome}</strong>. 
                        Precisas de fazer login para aceitar.
                    </p>
                    <button 
                        onClick={() => router.push(`/login?returnUrl=/aceitar-convite?token=${token}`)}
                        className="w-full bg-[#820AD1] text-white py-4 rounded-2xl font-black hover:bg-[#6A08AA] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                    >
                        Fazer Login para Continuar
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-4 mb-8 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image 
                                src={inviteData.imobiliaria.logo || '/logo-placeholder.png'} 
                                alt={inviteData.imobiliaria.nome}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    
                    <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        Convite de Equipa
                    </span>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Olá, {user.primeiro_nome}!
                    </h1>
                    
                    <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg">
                        Fomos informados que agora trabalhas com a <strong>{inviteData.imobiliaria.nome}</strong>. 
                        Desejas aceitar este convite e vincular o teu perfil à agência?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Ignorar por agora
                        </button>
                        <button 
                            onClick={handleAccept}
                            disabled={isPending}
                            className="w-full bg-[#820AD1] hover:bg-[#6A08AA] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                            Aderir à Equipa
                        </button>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Acesso Seguro
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Perfil Verificado
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AceitarConvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        }>
            <InviteContent />
        </Suspense>
    );
}
