'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Camera, Users, Settings2, EyeOff, Shield, Save, Loader2, ChevronDown, MapPin, Globe, Facebook, Instagram, Linkedin, Twitter, Phone, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateUserAgencyAction } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { uploadLogoAction } from '@/lib/functions/supabase-actions/admin-imobiliaria-actions';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';

import { AgencyProperties } from '../dashboard-tabs-content';
import { AgencyTeamManagement } from './agency-team-management';

const MAX_LOGO_BYTES = 1024 * 1024;

interface AgencyManagementProps {
    agency: any;
    agencyProperties: any[] | null;
}

function AccordionSection({
    icon,
    iconClass,
    title,
    subtitle,
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
                'lg:bg-transparent lg:border-0 lg:rounded-none lg:overflow-visible lg:shadow-none',
                className
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="lg:hidden w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[52px] text-left"
            >
                <span
                    className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
                        iconClass,
                        !isOpen && 'opacity-90'
                    )}
                >
                    {icon}
                </span>
                <span className="flex-1 min-w-0">
                    <strong className="block text-[13.5px] font-bold text-gray-900 leading-tight truncate">{title}</strong>
                    <span className={cn('text-[11px] leading-snug block truncate', isOpen ? 'text-purple-600 font-semibold' : 'text-emerald-600 font-semibold')}>
                        {subtitle}
                    </span>
                </span>
                <ChevronDown
                    className={cn(
                        'w-4 h-4 shrink-0 text-gray-400 transition-transform duration-300',
                        isOpen && 'rotate-180 text-purple-600'
                    )}
                />
            </button>
            <div id={panelId} role="region" aria-label={title} className={cn(isOpen ? 'block' : 'hidden lg:block')}>
                <div className="px-3.5 pb-3.5 border-t border-gray-100 pt-1 lg:p-0 lg:border-t-0 lg:pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function AgencyManagement({ agency, agencyProperties }: AgencyManagementProps) {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const user = useUserStore((state) => state.user);
    const isOwner = user?.id === agency?.owner_id;
    const [activeSubTab, setActiveSubTab] = useState<'general' | 'team'>('general');
    const [openSection, setOpenSection] = useState<string | null>('identificacao');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(agency.logo);
    const [formData, setFormData] = useState({
        nome: agency.nome || '',
        telefone: agency.telefone || '',
        whatsapp: agency.whatsapp || '',
        website: agency.website || '',
        descricao: agency.descricao || '',
        cidade: agency.cidade || '',
        bairro: agency.bairro || '',
        endereco: agency.endereco || '',
        facebook: agency.facebook || '',
        instagram: agency.instagram || '',
        linkedin: agency.linkedin || '',
        twitter: agency.twitter || '',
    });
    const initialFormDataRef = useRef(formData);

    const isDirty =
        logoFile !== null ||
        (Object.keys(formData) as Array<keyof typeof formData>).some(
            (key) => formData[key] !== initialFormDataRef.current[key]
        );

    // Sync sub-tab with URL (?section=team|general)
    useEffect(() => {
        const section = searchParams.get('section');
        if (section === 'team' || section === 'general') {
            setActiveSubTab(section);
        }
    }, [searchParams]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('section') !== activeSubTab) {
            params.set('section', activeSubTab);
            window.history.replaceState(null, '', `?${params.toString()}`);
        }
    }, [activeSubTab]);

    const toggleSection = (id: string) => {
        setOpenSection(prev => (prev === id ? null : id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Selecione um ficheiro de imagem (PNG ou JPG).');
            return;
        }
        if (file.size > MAX_LOGO_BYTES) {
            toast.error('O logo é muito grande. O limite é de 1MB.');
            return;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner) return;
        setIsSubmitting(true);

        try {
            let logoUrl = agency.logo;
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append('file', logoFile);
                const uploadRes = await uploadLogoAction(logoFormData);
                if (uploadRes.success) {
                    logoUrl = uploadRes.url;
                } else {
                    toast.error('Erro ao enviar logo: ' + uploadRes.error);
                    setIsSubmitting(false);
                    return;
                }
            }

            const dataToUpdate = { ...formData, logo: logoUrl };
            const result = await updateUserAgencyAction(agency.id, dataToUpdate, agency);

            if (result.success) {
                if ('resetStatus' in result && result.resetStatus) {
                    toast.warning('Atenção: Alterar o nome da empresa exigirá uma nova aprovação da equipa RC Media', {
                        duration: 6000,
                    });
                } else {
                    toast.success('Dados da agência atualizados com sucesso!');
                }
                setLogoFile(null);
                initialFormDataRef.current = { ...formData };
                setSavedFlash(true);
                window.setTimeout(() => setSavedFlash(false), 1600);
                queryClient.invalidateQueries({ queryKey: ['user-agency'] });
            } else {
                toast.error('Erro ao atualizar agência: ' + (result as any).error);
            }
        } catch (error) {
            console.error('Erro ao salvar agência:', error);
            toast.error('Ocorreu um erro inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusPill =
        agency.status === 'approved' ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-1">
                ✓ Aprovada
            </span>
        ) : (
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 animate-pulse inline-flex items-center gap-1">
                Pendente
            </span>
        );

    const inputBase =
        'w-full outline-none transition-all text-gray-900 placeholder-gray-400/80 ' +
        'border-0 bg-transparent p-0 text-[15.5px] font-medium rounded-none ' +
        'lg:p-3 lg:text-sm lg:rounded-button lg:border lg:border-border lg:bg-gray-50/50 lg:font-normal ' +
        'lg:focus:ring-2 lg:focus:ring-purple-500 lg:focus:bg-white lg:focus:border-transparent';

    const readonlyCls = isOwner
        ? ''
        : 'text-gray-500 cursor-default bg-gray-50/60 lg:bg-gray-100/70 lg:opacity-80 focus:outline-none focus:ring-0';

    const fieldRow = 'py-3 border-b border-gray-100 last:border-b-0 lg:py-0 lg:mb-4 lg:last:mb-0 lg:border-0';
    const labelCls = 'block text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-gray-400 mb-1.5 lg:text-xs lg:mb-1 lg:font-bold';

    return (
        <div className="space-y-0 lg:space-y-8">
            {/* ══════════ Mobile: Variação 1 — Top Bar (título estilo SectionHeader/visitas) ══════════ */}
            <div className="lg:hidden sticky top-0 z-40 -mx-3 -mt-3 px-3 py-3 bg-white/92 backdrop-blur-md border-b border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="p-1.5 bg-gradient-to-r from-purple-100 to-orange-100 rounded-lg shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4 text-purple-700" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-[15px] font-black bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent leading-tight tracking-tight truncate">
                            Minha Agência
                        </h1>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500/80 truncate">
                            {isOwner ? 'Gestão da imobiliária' : 'Modo leitura'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!isOwner && (
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 inline-flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Membro
                        </span>
                    )}
                    {statusPill}
                </div>
            </div>

            {/* ══════════ Desktop: Header estilo SectionHeader/visitas ══════════ */}
            <div className="hidden lg:flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-orange-100 rounded-card shrink-0 shadow-card">
                        <Building2 className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent leading-tight tracking-tight">
                            Gestão da Agência
                        </h2>
                        <p className="text-gray-500 text-[11px] md:text-xs font-bold uppercase tracking-widest mt-0.5 opacity-70">
                            {isOwner ? 'Gerencie as informações da sua imobiliária vinculada.' : 'Visualize as informações da sua imobiliária.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isOwner && (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Membro
                        </span>
                    )}
                    {statusPill}
                </div>
            </div>

            {/* ══════════ Mobile: Variação 1 — Profile ══════════ */}
            <div className="lg:hidden flex flex-col items-center px-4 py-5 bg-white border-b border-gray-100 -mx-3 mb-0">
                <label className={cn('relative block w-[84px] h-[84px] rounded-[26px] bg-gradient-to-br from-purple-600 to-orange-500 p-[3px] shadow-lg shadow-purple-500/25', isOwner && 'cursor-pointer')}>
                    <div className="w-full h-full rounded-[23px] bg-white overflow-hidden flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-9 h-9 text-gray-300" />
                        )}
                    </div>
                    {isOwner && (
                        <>
                            <span className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                                <Camera className="w-4 h-4" />
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        </>
                    )}
                </label>
                <h2 className="mt-3 text-lg font-black text-gray-900 text-center leading-tight">{agency.nome || 'Minha Agência'}</h2>
                <p className="text-xs text-gray-500 mt-1 text-center">
                    {[agency.cidade, agency.bairro].filter(Boolean).join(' · ') || 'Localização da agência'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold border border-purple-100">
                        {isOwner ? 'Proprietário' : 'Membro'}
                    </span>
                    {agency.verificada && (
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100">
                            Verificada
                        </span>
                    )}
                    {agency.status !== 'approved' && (
                        <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100">
                            Revisão pendente
                        </span>
                    )}
                </div>
                {isOwner && <p className="text-[10px] text-gray-400 mt-2">Recomendado: 512×512px (PNG ou JPG)</p>}
            </div>

            {/* Sub-Tabs Selector — segmented compacto */}
            <div className="flex items-center p-1 bg-gray-100/70 border border-gray-200/60 rounded-xl w-full lg:w-fit gap-0.5 mt-3 mb-4 lg:mt-0 lg:mb-8">
                <button
                    onClick={() => setActiveSubTab('general')}
                    className={cn(
                        'flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 lg:px-5 py-1.5 rounded-[10px] text-[12.5px] lg:text-sm font-bold transition-all min-h-[34px] whitespace-nowrap',
                        activeSubTab === 'general'
                            ? 'bg-white text-purple-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    <Settings2 className="w-3.5 h-3.5 shrink-0" />
                    Informações
                </button>
                <button
                    onClick={() => setActiveSubTab('team')}
                    className={cn(
                        'flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 lg:px-5 py-1.5 rounded-[10px] text-[12.5px] lg:text-sm font-bold transition-all min-h-[34px] whitespace-nowrap',
                        activeSubTab === 'team'
                            ? 'bg-white text-purple-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    Equipa
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeSubTab === 'general' ? (
                    <motion.div
                        key="general"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-0 lg:space-y-8"
                    >
                        {!isOwner && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-4 lg:mb-0">
                                <EyeOff className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-800">Modo de Leitura</p>
                                    <p className="text-xs text-blue-600/80 mt-0.5">
                                        Você é um membro da equipa. Apenas o proprietário da agência pode editar as informações.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                                {/* Logo — desktop only (mobile usa o profile acima) */}
                                <div className="hidden lg:block lg:col-span-1 space-y-4">
                                    <div className="relative group">
                                        <div className="w-full aspect-square rounded-card bg-gray-100 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>
                                        {isOwner && (
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-card">
                                                <Camera className="w-8 h-8 text-white" />
                                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                            </label>
                                        )}
                                    </div>
                                    {isOwner && <p className="text-[10px] text-gray-400 text-center">Recomendado: 512x512px (PNG ou JPG)</p>}
                                </div>

                                {/* Campos — Acordeões (V3) no mobile, layout original no desktop */}
                                <div className="lg:col-span-2 space-y-3 lg:space-y-0">
                                    <AccordionSection
                                        id="identificacao"
                                        icon={<Building2 className="w-[17px] h-[17px]" />}
                                        iconClass="bg-purple-100 text-purple-700"
                                        title="Identificação"
                                        subtitle={formData.nome ? formData.nome : 'Nome e descrição'}
                                        isOpen={openSection === 'identificacao'}
                                        onToggle={() => toggleSection('identificacao')}
                                    >
                                        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                                            <div className={cn(fieldRow, 'lg:col-span-2')}>
                                                <label htmlFor="agency-nome" className={labelCls}>Nome da Empresa</label>
                                                <input
                                                    id="agency-nome"
                                                    type="text"
                                                    name="nome"
                                                    value={formData.nome}
                                                    onChange={handleChange}
                                                    readOnly={!isOwner}
                                                    className={cn(inputBase, readonlyCls)}
                                                    placeholder="Nome oficial da imobiliária"
                                                    required
                                                />
                                            </div>
                                            <div className={cn(fieldRow, 'lg:col-span-2 lg:mb-0')}>
                                                <label htmlFor="agency-descricao" className={labelCls}>Descrição / Sobre</label>
                                                <textarea
                                                    id="agency-descricao"
                                                    name="descricao"
                                                    value={formData.descricao}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    readOnly={!isOwner}
                                                    className={cn(inputBase, 'resize-none min-h-[84px] lg:min-h-0', readonlyCls)}
                                                    placeholder="Descreva sua imobiliária, anos de mercado, especialidades..."
                                                />
                                            </div>
                                        </div>
                                    </AccordionSection>

                                    <AccordionSection
                                        id="contactos"
                                        icon={<Phone className="w-[17px] h-[17px]" />}
                                        iconClass="bg-blue-100 text-blue-600"
                                        title="Contactos"
                                        subtitle={[formData.telefone, formData.whatsapp].filter(Boolean).join(' · ') || 'Telefone e website'}
                                        isOpen={openSection === 'contactos'}
                                        onToggle={() => toggleSection('contactos')}
                                    >
                                        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                                            <div className={fieldRow}>
                                                <label htmlFor="agency-telefone" className={labelCls}>Telefone Comercial</label>
                                                <input
                                                    id="agency-telefone"
                                                    type="tel"
                                                    name="telefone"
                                                    value={formData.telefone}
                                                    onChange={handleChange}
                                                    readOnly={!isOwner}
                                                    className={cn(inputBase, readonlyCls)}
                                                    placeholder="Ex: +244 9..."
                                                />
                                            </div>
                                            <div className={fieldRow}>
                                                <label htmlFor="agency-whatsapp" className={labelCls}>WhatsApp</label>
                                                <input
                                                    id="agency-whatsapp"
                                                    type="tel"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    readOnly={!isOwner}
                                                    className={cn(inputBase, readonlyCls)}
                                                    placeholder="Link ou Número"
                                                />
                                            </div>
                                            <div className={cn(fieldRow, 'lg:col-span-2 lg:mb-0')}>
                                                <label htmlFor="agency-website" className={labelCls}>Website</label>
                                                <input
                                                    id="agency-website"
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    readOnly={!isOwner}
                                                    className={cn(inputBase, readonlyCls)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </AccordionSection>
                                </div>
                            </div>

                            <div className="space-y-3 lg:space-y-0">
                                <AccordionSection
                                    id="endereco"
                                    icon={<MapPin className="w-[17px] h-[17px]" />}
                                    iconClass="bg-orange-100 text-orange-600"
                                    title="Endereço"
                                    subtitle={[formData.cidade, formData.bairro].filter(Boolean).join(' · ') || 'Cidade e bairro'}
                                    isOpen={openSection === 'endereco'}
                                    onToggle={() => toggleSection('endereco')}
                                    className="lg:border-t lg:border-gray-100 lg:pt-6"
                                >
                                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                                        <div className="lg:col-span-1 space-y-0 lg:space-y-4">
                                            <h3 className="hidden lg:flex font-bold text-gray-700 items-center gap-2">
                                                <MapPin className="w-4 h-4 text-purple-600" /> Endereço
                                            </h3>
                                            <div className={fieldRow}>
                                                <label htmlFor="agency-cidade" className={labelCls}>Cidade</label>
                                                <input id="agency-cidade" name="cidade" value={formData.cidade} onChange={handleChange} readOnly={!isOwner} className={cn(inputBase, readonlyCls)} />
                                            </div>
                                            <div className={fieldRow}>
                                                <label htmlFor="agency-bairro" className={labelCls}>Bairro</label>
                                                <input id="agency-bairro" name="bairro" value={formData.bairro} onChange={handleChange} readOnly={!isOwner} className={cn(inputBase, readonlyCls)} />
                                            </div>
                                            <div className={cn(fieldRow, 'lg:mb-0')}>
                                                <label htmlFor="agency-endereco" className={labelCls}>Endereço Completo</label>
                                                <input id="agency-endereco" name="endereco" value={formData.endereco} onChange={handleChange} readOnly={!isOwner} className={cn(inputBase, readonlyCls)} />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionSection>

                                <AccordionSection
                                    id="redes"
                                    icon={<Globe className="w-[17px] h-[17px]" />}
                                    iconClass="bg-pink-100 text-pink-600"
                                    title="Redes Sociais"
                                    subtitle={
                                        [formData.facebook, formData.instagram, formData.linkedin, formData.twitter].filter(Boolean).length > 0
                                            ? `${[formData.facebook, formData.instagram, formData.linkedin, formData.twitter].filter(Boolean).length} perfis ligados`
                                            : 'Facebook, Instagram…'
                                    }
                                    isOpen={openSection === 'redes'}
                                    onToggle={() => toggleSection('redes')}
                                    className="lg:border-t lg:border-gray-100 lg:pt-6"
                                >
                                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                                        <div className="lg:col-span-2 space-y-0 lg:space-y-4">
                                            <h3 className="hidden lg:flex font-bold text-gray-700 items-center gap-2">
                                                <Globe className="w-4 h-4 text-purple-600" /> Redes Sociais
                                            </h3>
                                            <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                                                <div className={cn(fieldRow, 'flex items-center gap-2.5 lg:flex')}>
                                                    <Facebook className="w-4 h-4 text-blue-600 shrink-0 hidden lg:block" />
                                                    <div className="flex-1 min-w-0">
                                                        <label htmlFor="agency-facebook" className={cn(labelCls, 'lg:hidden')}>Facebook</label>
                                                        <input id="agency-facebook" name="facebook" value={formData.facebook} onChange={handleChange} readOnly={!isOwner} placeholder="Facebook handle" className={cn(inputBase, readonlyCls)} />
                                                    </div>
                                                </div>
                                                <div className={cn(fieldRow, 'flex items-center gap-2.5 lg:flex')}>
                                                    <Instagram className="w-4 h-4 text-pink-600 shrink-0 hidden lg:block" />
                                                    <div className="flex-1 min-w-0">
                                                        <label htmlFor="agency-instagram" className={cn(labelCls, 'lg:hidden')}>Instagram</label>
                                                        <input id="agency-instagram" name="instagram" value={formData.instagram} onChange={handleChange} readOnly={!isOwner} placeholder="Instagram handle" className={cn(inputBase, readonlyCls)} />
                                                    </div>
                                                </div>
                                                <div className={cn(fieldRow, 'flex items-center gap-2.5 lg:flex')}>
                                                    <Linkedin className="w-4 h-4 text-blue-800 shrink-0 hidden lg:block" />
                                                    <div className="flex-1 min-w-0">
                                                        <label htmlFor="agency-linkedin" className={cn(labelCls, 'lg:hidden')}>LinkedIn</label>
                                                        <input id="agency-linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} readOnly={!isOwner} placeholder="Linkedin handle" className={cn(inputBase, readonlyCls)} />
                                                    </div>
                                                </div>
                                                <div className={cn(fieldRow, 'flex items-center gap-2.5 lg:flex lg:mb-0')}>
                                                    <Twitter className="w-4 h-4 text-sky-500 shrink-0 hidden lg:block" />
                                                    <div className="flex-1 min-w-0">
                                                        <label htmlFor="agency-twitter" className={cn(labelCls, 'lg:hidden')}>Twitter / X</label>
                                                        <input id="agency-twitter" name="twitter" value={formData.twitter} onChange={handleChange} readOnly={!isOwner} placeholder="Twitter handle" className={cn(inputBase, readonlyCls)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionSection>
                            </div>

                            {isOwner && (
                                <>
                                    {/* Mobile: sticky save bar (V1) — encosta acima da bottom nav (sem sobrepor) */}
                                    <div className="lg:hidden sticky bottom-[calc(55px+max(env(safe-area-inset-bottom,0px),16px))] z-40 -mx-3 px-3 pt-4 pb-3 bg-gradient-to-t from-white via-white/95 to-transparent mt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isDirty}
                                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:to-purple-800 text-white min-h-[52px] px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : savedFlash ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {isSubmitting ? 'A guardar…' : savedFlash ? 'Guardado' : isDirty ? 'Salvar Alterações' : 'Sem alterações'}
                                        </button>
                                    </div>

                                    {/* Desktop: botão original */}
                                    <div className="hidden lg:flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isDirty}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-button font-bold transition-all shadow-purple-200 flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : savedFlash ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {isSubmitting ? 'A guardar…' : savedFlash ? 'Guardado' : isDirty ? 'Salvar Alterações' : 'Sem alterações'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>

                        {agency.status === 'approved' && (
                            <AgencyProperties
                                properties={agencyProperties}
                                agencyName={agency.nome}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="team"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <AgencyTeamManagement agencyId={agency.id} isOwner={isOwner} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
