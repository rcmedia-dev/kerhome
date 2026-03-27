'use client';

import { Pen, UserCircle, Store } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';

interface DashboardWelcomeCardProps {
    displayName: string;
    avatarUrl?: string | null;
    role?: string | null;
    agentRequestStatus?: string | null;
    isUploading: boolean;
    isRequestingAgent: boolean;
    onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRequestAgent: (name: string) => void;
    userAgency?: any;
}

export function DashboardWelcomeCard({
    displayName,
    avatarUrl,
    role,
    agentRequestStatus,
    isUploading,
    isRequestingAgent,
    onAvatarUpload,
    onRequestAgent,
    userAgency,
}: DashboardWelcomeCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isPending = agentRequestStatus === 'pending';
    const isAgent = ['agente', 'agent', 'corretor'].includes(role?.toLowerCase() || '');

    // Roles that can register an agency
    const canRegisterAgency = ['profissional', 'agente', 'agent', 'corretor'].includes(role?.toLowerCase() || '');

    // Only show register agency button if eligible and doesn't already have one
    const showRegisterAgencyButton = canRegisterAgency && !userAgency;

    // Show pending agency status
    const hasPendingAgency = userAgency && userAgency.status === 'pending';

    return (
        <div className="relative rounded-md bg-gradient-to-br from-purple-900 to-gray-900 overflow-hidden shadow-md p-6 group shrink-0 border border-purple-500/20">
            <div className="relative z-10 flex flex-col gap-4 text-center items-center">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4 group/avatar">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-500 to-orange-500 shadow-xl ring-4 ring-white/10">
                            <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden flex items-center justify-center relative">
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : null}
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-white font-bold">{displayName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-purple-600 shadow-lg hover:scale-110 transition-transform cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group-hover/avatar:bg-purple-600 group-hover/avatar:text-white"
                            title="Alterar Foto"
                        >
                            <Pen className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={onAvatarUpload}
                        />
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                            {isAgent ? 'Agente Kercasa' : 'Usuário'}
                        </span>

                        <h1 className="text-2xl font-bold text-white leading-tight mt-1">
                            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">{displayName.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-gray-400 text-xs">Bem-vindo ao seu painel.</p>

                        {!isAgent && agentRequestStatus !== 'approved' && (
                            <button
                                disabled={isRequestingAgent || isPending}
                                onClick={() => onRequestAgent(displayName)}
                                className="w-full lg:w-auto mt-2 lg:mt-1 h-8 lg:h-6 text-xs px-3 lg:px-2 bg-orange-500 text-white rounded shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? 'Aguardando Aprovação' : (isRequestingAgent ? 'Enviando...' : 'Solicitar ser Agente')}
                            </button>
                        )}

                        {/* Agency Registration Button - only for eligible roles without an agency */}
                        {showRegisterAgencyButton && (
                            <Link
                                href="/imobiliarias/registar"
                                className="w-full mt-2 h-8 text-xs px-3 bg-purple-600 hover:bg-purple-700 text-white rounded shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                                <Store className="w-3.5 h-3.5" />
                                Cadastrar Agência
                            </Link>
                        )}

                        {/* Pending agency badge */}
                        {hasPendingAgency && (
                            <span className="mt-2 px-2 py-1 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[10px] font-bold rounded-md animate-pulse">
                                Agência em análise...
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

