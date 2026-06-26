'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Users, Mail, UserPlus, Clock, CheckCircle2, Copy, ExternalLink, Loader2, Trash2, ShieldCheck, Shield, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAgencyInvites, sendAgencyInvite } from '@/lib/functions/supabase-actions/agency-invites';
import { fetchAgentsByAgency, removeAgentFromAgency } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { useUserStore } from '@/lib/store/user-store';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface AgencyTeamManagementProps {
    agencyId: string;
    isOwner?: boolean;
}

export function AgencyTeamManagement({ agencyId, isOwner }: AgencyTeamManagementProps) {
    const currentUser = useUserStore((state) => state.user);
    const [agents, setAgents] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);
    const [removingAgentId, setRemovingAgentId] = useState<string | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);

    const handleRemoveAgent = async (agentId: string) => {
        if (!currentUser?.id) return;
        setRemovingAgentId(agentId);
        try {
            const result = await removeAgentFromAgency(agentId, agencyId, currentUser.id);
            if (result.success) {
                toast.success('Corretor removido da agência.');
                setAgents(prev => prev.filter(a => a.id !== agentId));
            } else {
                toast.error(result.error || 'Erro ao remover corretor.');
            }
        } catch (err) {
            toast.error('Ocorreu um erro inesperado.');
        } finally {
            setRemovingAgentId(null);
            setShowRemoveConfirm(null);
        }
    };

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
        if (!inviteEmail || !currentUser?.id) return;

        setIsInviting(true);
        try {
            const result = await sendAgencyInvite(inviteEmail, agencyId, currentUser.id);
            if (result.success) {
                toast.success('Convite enviado com sucesso!');
                setInviteSent(true);
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
                    <p className="text-sm text-gray-500">{isOwner ? 'Gerencie seus corretores e convide novos membros.' : 'Visualize os membros da sua equipa.'}</p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => {
                            setShowInviteModal(true);
                            setInviteSent(false);
                            setInviteEmail('');
                        }}
                        className="bg-[#820AD1] hover:bg-[#6A08AA] text-white px-6 py-3 rounded-button font-bold transition-all shadow-card shadow-purple-200 flex items-center justify-center gap-2 text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Convidar Corretor
                    </button>
                )}
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
                                <div key={agent.id} className="bg-white p-4 rounded-card border border-border flex items-center gap-4 group hover:shadow-card-hover transition-all">
                                    <div className="relative w-12 h-12 rounded-badge overflow-hidden border-2 border-purple-50 shrink-0">
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
                                        {isOwner && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowRemoveConfirm(agent.id);
                                                }}
                                                disabled={removingAgentId === agent.id}
                                                className="p-2 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                                title="Remover da agência"
                                            >
                                                {removingAgentId === agent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-gray-50/50 rounded-card border-2 border-dashed border-border">
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
                                <div key={invite.id} className="bg-white p-4 rounded-card border border-border flex items-center gap-4 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                    <div className="w-10 h-10 rounded-badge bg-orange-50 flex items-center justify-center shrink-0">
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
                                        className="p-2 hover:bg-gray-100 rounded-button transition-all text-gray-400 hover:text-purple-600"
                                        title="Copiar Link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-gray-50/50 rounded-card border-2 border-dashed border-border">
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
                        className="w-full max-w-md bg-white rounded-card-lg p-8 shadow-floating relative flex flex-col"
                    >
                        {/* Botão de Fechar */}
                        <button 
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-badge hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <DialogHeader className="mb-8 p-0">
                            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight text-left">
                                {!inviteSent ? 'Convidar Corretor' : 'Convite Enviado!'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-sm mt-2 text-left">
                                {!inviteSent 
                                    ? 'Envie um link de acesso exclusivo para o seu novo colega de equipa.' 
                                    : 'O processo de convite foi iniciado com sucesso.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {!inviteSent ? (
                                <form onSubmit={handleSendInvite} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            E-mail do Profissional
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="exemplo@kercasa.com"
                                                className="w-full pl-12 pr-4 py-4 rounded-button bg-gray-50 border border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isInviting}
                                        className="w-full bg-[#820AD1] hover:bg-[#6A08AA] text-white py-4 rounded-button font-bold transition-all shadow-card shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        {isInviting ? 'Gerando...' : 'Enviar Convite'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="bg-green-50 p-6 rounded-card border border-green-100 text-center">
                                        <div className="w-12 h-12 bg-green-500 rounded-badge flex items-center justify-center mx-auto mb-3 shadow-card shadow-green-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium mt-4">
                                            O corretor receberá um e-mail para aceitar ou recusar a entrada na sua agência.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-3 bg-[#820AD1] hover:bg-[#6A08AA] text-white rounded-button transition-all text-sm font-bold shadow-card shadow-purple-500/20"
                                    >
                                        Fechar Janela
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Remoção */}
            <Dialog open={!!showRemoveConfirm} onOpenChange={() => setShowRemoveConfirm(null)}>
                <DialogContent 
                    className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4 !bg-black/40 !backdrop-blur-sm !border-none !shadow-none !max-w-none !translate-x-0 !translate-y-0 !top-0 !left-0 !h-full !w-full"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">Remover Corretor</DialogTitle>
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-floating relative"
                    >
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Remover Corretor</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Tem certeza que deseja remover este corretor da sua agência? Ele não poderá mais publicar imóveis em nome da agência.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRemoveConfirm(null)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => showRemoveConfirm && handleRemoveAgent(showRemoveConfirm)}
                                    disabled={removingAgentId === showRemoveConfirm}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {removingAgentId === showRemoveConfirm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Remover
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

