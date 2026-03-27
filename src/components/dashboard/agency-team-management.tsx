'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Users, Mail, UserPlus, Clock, CheckCircle2, Copy, ExternalLink, Loader2, Trash2, ShieldCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAgencyInvites, sendAgencyInvite } from '@/lib/functions/supabase-actions/agency-invites';
import { fetchAgentsByAgency } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface AgencyTeamManagementProps {
    agencyId: string;
}

export function AgencyTeamManagement({ agencyId }: AgencyTeamManagementProps) {
    const [agents, setAgents] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [agentsData, invitesData] = await Promise.all([
                fetchAgentsByAgency(agencyId),
                getAgencyInvites(agencyId)
            ]);
            setAgents(agentsData);
            setInvites(invitesData);
        } catch (error) {
            console.error('Erro ao carregar dados da equipa:', error);
            toast.error('Não foi possível carregar os dados da equipa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [agencyId]);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        try {
            const result = await sendAgencyInvite(inviteEmail, agencyId);
            if (result.success) {
                toast.success('Convite gerado com sucesso!');
                setGeneratedLink(result.inviteLink || null);
                loadData();
            } else {
                toast.error(result.error || 'Erro ao enviar convite.');
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado.');
        } finally {
            setIsInviting(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                toast.success('Link copiado para a área de transferência!');
            } catch (err) {
                console.error('Falha ao copiar:', err);
                toast.error('Não foi possível copiar o link.');
            }
        } else {
            // Fallback para navegadores antigos ou ambiente inseguro se necessário
            toast.error('O seu navegador não suporta cópia automática.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Carregando equipa e convites...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Botão de Convite */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" /> Gestão de Equipa
                    </h3>
                    <p className="text-sm text-gray-500">Gerencie seus corretores e convide novos membros.</p>
                </div>
                <button
                    onClick={() => {
                        setShowInviteModal(true);
                        setGeneratedLink(null);
                        setInviteEmail('');
                    }}
                    className="bg-[#820AD1] hover:bg-[#6A08AA] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Convidar Corretor
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lista de Corretores Atuais */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                        Corretores Ativos ({agents.length})
                    </h4>
                    <div className="space-y-3">
                        {agents.length > 0 ? (
                            agents.map((agent) => (
                                <div key={agent.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-50 shrink-0">
                                        <Image
                                            src={agent.avatar_url || '/placeholder-avatar.png'}
                                            alt={agent.primeiro_nome || 'Agente'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h5 className="font-bold text-gray-900 truncate">
                                                {agent.primeiro_nome} {agent.ultimo_nome}
                                            </h5>
                                            {agent.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-2">
                                        {/* Futuras ações: Remover, Alterar Cargo */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 text-sm">Nenhum corretor vinculado.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Convites Enviados */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                        Convites Pendentes ({invites.filter(i => i.status === 'pending').length})
                    </h4>
                    <div className="space-y-3">
                        {invites.some(i => i.status === 'pending') ? (
                            invites.filter(i => i.status === 'pending').map((invite) => (
                                <div key={invite.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-900 truncate text-sm">
                                            {invite.email}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />Expira em {new Date(invite.expires_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/aceitar-convite?token=${invite.token}`)}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-purple-600"
                                        title="Copiar Link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 text-sm">Nenhum convite pendente.</p>
                            </div>
                        )}

                        {/* Convites Aceitos (Mini lista) */}
                        {invites.some(i => i.status === 'accepted') && (
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Aceitos Recentemente</p>
                                <div className="space-y-2 opacity-60">
                                    {invites.filter(i => i.status === 'accepted').slice(0, 3).map((invite) => (
                                        <div key={invite.id} className="flex items-center gap-2 text-xs">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            <span className="text-gray-600 font-medium">{invite.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Convite */}
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                <DialogContent 
                    className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4 !bg-black/40 !backdrop-blur-sm !border-none !shadow-none !max-w-none !translate-x-0 !translate-y-0 !top-0 !left-0 !h-full !w-full"
                    showCloseButton={false}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative custom-scrollbar flex flex-col"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">Convidar Corretor</h3>
                            <p className="text-white/60 text-xs mt-1">
                                Envie um link de acesso exclusivo para o seu novo colega de equipa.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {!generatedLink ? (
                                <form onSubmit={handleSendInvite} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">
                                            E-mail do Profissional
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="exemplo@email.com"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500 transition-all outline-none font-medium text-white placeholder-white/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isInviting}
                                        className="w-full bg-[#820AD1] hover:bg-[#6A08AA] text-white py-4 rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        Enviar Convite
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20 text-center">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="font-bold text-white text-lg mb-1">Convite Gerado!</h4>
                                        <p className="text-white/60 text-xs font-medium">
                                            Partilhe o link abaixo. O link expira em 48 horas.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 text-center">Link de Acesso:</p>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-white/60 truncate">
                                                {generatedLink}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(generatedLink)}
                                                className="bg-white text-black p-4 rounded-xl hover:bg-gray-200 transition-all shadow-lg shrink-0"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-2 text-white/40 hover:text-white transition-all text-xs font-bold mt-2"
                                    >
                                        Fechar Janela
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

