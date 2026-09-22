'use client';

import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, Clock, CheckCircle2, Copy, Loader2, Trash2, ShieldCheck, X, AlertTriangle, Users, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAgencyInvites, sendAgencyInvite, revokeAgencyInvite } from '@/lib/functions/supabase-actions/agency-invites';
import { fetchAgentsByAgency, removeAgentFromAgency } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { useUserStore } from '@/lib/store/user-store';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AgencyTeamManagementProps {
    agencyId: string;
    isOwner?: boolean;
}

function TeamAccordion({
    icon,
    iconClass,
    title,
    subtitle,
    count,
    isOpen,
    onToggle,
    children,
    className,
    id,
}: {
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    subtitle: string;
    count?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
    id: string;
}) {
    const panelId = `${id}-panel`;
    return (
        <div
            className={cn(
                'bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all',
                isOpen && 'border-purple-200/70 shadow-lg shadow-purple-500/5',
                'lg:shadow-sm lg:border-border',
                className
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[52px] text-left"
            >
                <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all', iconClass)}>
                    {icon}
                </span>
                <span className="flex-1 min-w-0">
                    <strong className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 leading-tight">
                        <span className="truncate">{title}</span>
                        {typeof count === 'number' && (
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">
                                {count}
                            </span>
                        )}
                    </strong>
                    <span
                        className={cn(
                            'text-[11px] leading-snug block truncate',
                            isOpen ? 'text-purple-600 font-semibold' : 'text-emerald-600 font-semibold'
                        )}
                    >
                        {subtitle}
                    </span>
                </span>
                <ChevronDown
                    className={cn(
                        'w-4 h-4 shrink-0 text-gray-400 transition-transform duration-300 lg:hidden',
                        isOpen && 'rotate-180 text-purple-600'
                    )}
                />
            </button>
            <div id={panelId} role="region" aria-label={title} className={cn(isOpen ? 'block' : 'hidden lg:block')}>
                <div className="px-3.5 pb-3.5 border-t border-gray-100 pt-3">{children}</div>
            </div>
        </div>
    );
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
    const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null);
    const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);
    const [openSection, setOpenSection] = useState<string | null>('agentes');

    const now = Date.now();
    const isInviteExpired = (invite: { expires_at: string }) =>
        new Date(invite.expires_at).getTime() < now;

    const pendingActive = invites.filter(i => i.status === 'pending' && !isInviteExpired(i));
    const pendingExpired = invites.filter(i => i.status === 'pending' && isInviteExpired(i));
    const pendingInvites = [...pendingActive, ...pendingExpired];
    const acceptedInvites = invites.filter(i => i.status === 'accepted');

    const toggleSection = (id: string) => {
        setOpenSection(prev => (prev === id ? null : id));
    };

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

    const handleRevokeInvite = async (inviteId: string) => {
        if (!currentUser?.id) return;
        setRevokingInviteId(inviteId);
        try {
            const result = await revokeAgencyInvite(inviteId, agencyId, currentUser.id);
            if (result.success) {
                toast.success('Convite removido.');
                setInvites(prev => prev.filter(i => i.id !== inviteId));
            } else {
                toast.error(result.error || 'Erro ao remover convite.');
            }
        } catch (err) {
            toast.error('Ocorreu um erro inesperado.');
        } finally {
            setRevokingInviteId(null);
            setShowRevokeConfirm(null);
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
            <div className="space-y-4 animate-pulse" aria-label="A carregar equipa" aria-busy="true">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-3 w-28 rounded bg-gray-200" />
                        <div className="h-4 w-64 rounded bg-gray-100" />
                    </div>
                    <div className="h-12 w-full sm:w-36 rounded-2xl bg-gray-200" />
                </div>
                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                    <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-3">
                        <div className="h-9 w-full rounded-xl bg-gray-100" />
                        <div className="h-16 rounded-xl bg-gray-50" />
                        <div className="h-16 rounded-xl bg-gray-50" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-3">
                        <div className="h-9 w-full rounded-xl bg-gray-100" />
                        <div className="h-16 rounded-xl bg-gray-50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header — V3: eyebrow + botão convidar dashed */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest text-purple-600/80 mb-1">
                        Gestão de Equipa
                    </p>
                    <p className="text-sm text-gray-500">{isOwner ? 'Gerencie seus corretores e convide novos membros.' : 'Visualize os membros da sua equipa.'}</p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => {
                            setShowInviteModal(true);
                            setInviteSent(false);
                            setInviteEmail('');
                        }}
                        className="w-full sm:w-auto shrink-0 border-2 border-dashed border-[#820AD1]/45 text-[#820AD1] bg-[#820AD1]/[0.04] hover:bg-[#820AD1]/10 hover:border-[#820AD1]/70 px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm min-h-[48px] active:scale-[0.98]"
                    >
                        <UserPlus className="w-4 h-4" />
                        Convidar
                    </button>
                )}
            </div>

            {/* Acordeões V3 — mobile empilhados, desktop 2 colunas */}
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
                <TeamAccordion
                    id="agentes"
                    icon={<Users className="w-4 h-4" />}
                    iconClass="bg-purple-50 text-purple-600"
                    title="Corretores Ativos"
                    subtitle={agents.length > 0 ? 'Membros da agência' : 'Ainda sem corretores'}
                    count={agents.length}
                    isOpen={openSection === 'agentes'}
                    onToggle={() => toggleSection('agentes')}
                >
                    <div className="space-y-3">
                        {agents.length > 0 ? (
                            agents.map((agent) => (
                                <div key={agent.id} className="bg-white p-3.5 rounded-2xl border border-border flex items-center gap-3.5 group hover:shadow-card-hover transition-all">
                                    <div className="relative w-11 h-11 rounded-badge overflow-hidden border-2 border-purple-50 shrink-0 bg-purple-50">
                                        <Image
                                            src={agent.avatar_url || '/placeholder-avatar.png'}
                                            alt={agent.primeiro_nome || 'Agente'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h5 className="font-bold text-gray-900 truncate text-[14.5px]">
                                                {agent.primeiro_nome} {agent.ultimo_nome}
                                            </h5>
                                            {agent.role === 'admin' && (
                                                <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-wide border border-purple-100">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{agent.email}</p>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowRemoveConfirm(agent.id);
                                            }}
                                            disabled={removingAgentId === agent.id}
                                            className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-all disabled:opacity-50 shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
                                            title="Remover da agência"
                                        >
                                            {removingAgentId === agent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-gray-50/50 rounded-card border-2 border-dashed border-border">
                                <p className="text-gray-400 text-sm">Nenhum corretor vinculado.</p>
                            </div>
                        )}
                    </div>
                </TeamAccordion>

                <TeamAccordion
                    id="convites"
                    icon={<Mail className="w-4 h-4" />}
                    iconClass="bg-orange-50 text-orange-500"
                    title="Convites Pendentes"
                    subtitle={
                        pendingActive.length > 0
                            ? 'Aguardando resposta'
                            : pendingExpired.length > 0
                                ? `${pendingExpired.length} expirado(s)`
                                : 'Sem convites ativos'
                    }
                    count={pendingActive.length || pendingExpired.length}
                    isOpen={openSection === 'convites'}
                    onToggle={() => toggleSection('convites')}
                >
                    <div className="space-y-3">
                        {pendingInvites.length > 0 ? (
                            pendingInvites.map((invite) => {
                                const expired = isInviteExpired(invite);
                                return (
                                <div
                                    key={invite.id}
                                    className={cn(
                                        'bg-white p-3.5 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group',
                                        expired
                                            ? 'border-2 border-dashed border-red-200 bg-red-50/40'
                                            : 'border-2 border-dashed border-orange-200'
                                    )}
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-badge border flex items-center justify-center shrink-0',
                                        expired
                                            ? 'bg-red-50 border-red-100'
                                            : 'bg-orange-50 border-orange-100'
                                    )}>
                                        <Mail className={cn('w-5 h-5', expired ? 'text-red-400' : 'text-orange-500')} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <h5 className="font-bold text-gray-900 truncate text-sm">
                                                {invite.email}
                                            </h5>
                                            {expired && (
                                                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-wide border border-red-200">
                                                    Expirado
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider',
                                                expired ? 'text-red-500' : 'text-gray-400'
                                            )}>
                                                <Clock className="w-3 h-3" />
                                                {expired ? 'Link inválido' : `Expira em ${new Date(invite.expires_at).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                    </div>
                                    {!expired && (
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/aceitar-convite?token=${invite.token}`)}
                                            className="p-2.5 hover:bg-purple-50 rounded-xl transition-all text-gray-400 hover:text-purple-600 shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
                                            title="Copiar Link"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    )}
                                    {isOwner && (
                                        <button
                                            onClick={() => setShowRevokeConfirm(invite.id)}
                                            disabled={revokingInviteId === invite.id}
                                            className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-all disabled:opacity-50 shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
                                            title="Remover convite"
                                        >
                                            {revokingInviteId === invite.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center bg-gray-50/50 rounded-card border-2 border-dashed border-border">
                                <p className="text-gray-400 text-sm">Nenhum convite pendente.</p>
                            </div>
                        )}

                        {acceptedInvites.length > 0 && (
                            <div className="pt-3 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Aceitos Recentemente</p>
                                <div className="space-y-2 opacity-60">
                                    {acceptedInvites.slice(0, 3).map((invite) => (
                                        <div key={invite.id} className="flex items-center gap-2 text-xs">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            <span className="text-gray-600 font-medium truncate">{invite.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TeamAccordion>
            </div>

            {/* Modal de Convite — bottom sheet no mobile, centrado no desktop */}
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                <DialogContent
                    className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! p-0! sm:p-4! bg-black/40! backdrop-blur-sm! border-none! shadow-none! max-w-none! translate-x-0! translate-y-0! top-0! left-0! h-full! w-full!"
                    showCloseButton={false}
                >
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-card-lg p-5 sm:p-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8 shadow-floating relative flex flex-col max-h-[92vh] overflow-y-auto"
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
                                        className="w-full bg-[#820AD1] hover:bg-[#6A08AA] text-white py-4 rounded-button font-bold transition-all shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        {isInviting ? 'Gerando...' : 'Enviar Convite'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="bg-green-50 p-6 rounded-card border border-green-100 text-center">
                                        <div className="w-12 h-12 bg-green-500 rounded-badge flex items-center justify-center mx-auto mb-3 shadow-green-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium mt-4">
                                            O corretor receberá um e-mail para aceitar ou recusar a entrada na sua agência.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-3 bg-[#820AD1] hover:bg-[#6A08AA] text-white rounded-button transition-all text-sm font-bold shadow-purple-500/20"
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
                    className="fixed! inset-0! z-50! flex! items-center! justify-center! p-4! bg-black/40! backdrop-blur-sm! border-none! shadow-none! max-w-none! translate-x-0! translate-y-0! top-0! left-0! h-full! w-full"
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

            {/* Modal de Confirmação de Revogação de Convite */}
            <Dialog open={!!showRevokeConfirm} onOpenChange={() => setShowRevokeConfirm(null)}>
                <DialogContent
                    className="fixed! inset-0! z-50! flex! items-center! justify-center! p-4! bg-black/40! backdrop-blur-sm! border-none! shadow-none! max-w-none! translate-x-0! translate-y-0! top-0! left-0! h-full! w-full"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">Remover Convite</DialogTitle>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-floating relative"
                    >
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Remover Convite</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                O link de convite deixará de funcionar e a notificação do convidado será removida.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRevokeConfirm(null)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => showRevokeConfirm && handleRevokeInvite(showRevokeConfirm)}
                                    disabled={revokingInviteId === showRevokeConfirm}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {revokingInviteId === showRevokeConfirm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

