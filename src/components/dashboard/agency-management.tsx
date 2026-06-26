'use client';

import React, { useState } from 'react';
import { Building2, Phone, Globe, Mail, MapPin, Save, AlertTriangle, Loader2, Camera, Facebook, Instagram, Linkedin, Twitter, Users, Settings2, EyeOff, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateUserAgencyAction, getUserAgency } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { uploadLogoAction } from '@/lib/functions/supabase-actions/admin-imobiliaria-actions';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';

import { AgencyProperties } from '../dashboard-tabs-content';
import { AgencyTeamManagement } from './agency-team-management';

interface AgencyManagementProps {
    agency: any;
    agencyProperties: any[] | null;
}

export function AgencyManagement({ agency, agencyProperties }: AgencyManagementProps) {
    const queryClient = useQueryClient();
    const user = useUserStore((state) => state.user);
    const isOwner = user?.id === agency?.owner_id;
    const [activeSubTab, setActiveSubTab] = useState<'general' | 'team'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão da Agência</h2>
                    <p className="text-sm text-gray-500">{isOwner ? 'Gerencie as informações da sua imobiliária vinculada.' : 'Visualize as informações da sua imobiliária.'}</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isOwner && (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Membro
                        </span>
                    )}
                    {agency.status === 'approved' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                            Aprovada
                        </span>
                    ) : (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 animate-pulse">
                            Pendente
                        </span>
                    )}
                </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex flex-wrap items-center p-1.5 bg-gray-100/50 rounded-card w-full sm:w-fit mb-8 gap-1">
                <button
                    onClick={() => setActiveSubTab('general')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-button text-sm font-bold transition-all",
                        activeSubTab === 'general' ? "bg-white text-purple-700 shadow-card" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Settings2 className="w-4 h-4" />
                    Informações Gerais
                </button>
                <button
                    onClick={() => setActiveSubTab('team')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-button text-sm font-bold transition-all",
                        activeSubTab === 'team' ? "bg-white text-purple-700 shadow-card" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Users className="w-4 h-4" />
                    Gestão de Equipa
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeSubTab === 'general' ? (
                    <motion.div
                        key="general"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {!isOwner && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                                <EyeOff className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-800">Modo de Leitura</p>
                                    <p className="text-xs text-blue-600/80 mt-0.5">
                                        Você é um membro da equipa. Apenas o proprietário da agência pode editar as informações.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Imagem e Dados Principais */}
                                <div className="lg:col-span-1 space-y-4">
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

                                {/* Formulário */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Empresa</label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            readOnly={!isOwner}
                                            className={cn(
                                                "w-full p-3 rounded-button border border-border bg-gray-50/50 transition-all outline-none",
                                                isOwner ? "focus:ring-2 focus:ring-purple-500 focus:bg-white" : "text-gray-500 cursor-default"
                                            )}
                                            placeholder="Nome oficial da imobiliária"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone Comercial</label>
                                        <input
                                            type="text"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleChange}
                                            readOnly={!isOwner}
                                            className={cn(
                                                "w-full p-3 rounded-button border border-border bg-gray-50/50 transition-all outline-none",
                                                isOwner ? "focus:ring-2 focus:ring-purple-500 focus:bg-white" : "text-gray-500 cursor-default"
                                            )}
                                            placeholder="Ex: +244 9..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            readOnly={!isOwner}
                                            className={cn(
                                                "w-full p-3 rounded-button border border-border bg-gray-50/50 transition-all outline-none",
                                                isOwner ? "focus:ring-2 focus:ring-purple-500 focus:bg-white" : "text-gray-500 cursor-default"
                                            )}
                                            placeholder="Link ou Número"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                                        <input
                                            type="text"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            readOnly={!isOwner}
                                            className={cn(
                                                "w-full p-3 rounded-button border border-border bg-gray-50/50 transition-all outline-none",
                                                isOwner ? "focus:ring-2 focus:ring-purple-500 focus:bg-white" : "text-gray-500 cursor-default"
                                            )}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição / Sobre</label>
                                        <textarea
                                            name="descricao"
                                            value={formData.descricao}
                                            onChange={handleChange}
                                            rows={4}
                                            readOnly={!isOwner}
                                            className={cn(
                                                "w-full p-3 rounded-button border border-border bg-gray-50/50 transition-all outline-none resize-none",
                                                isOwner ? "focus:ring-2 focus:ring-purple-500 focus:bg-white" : "text-gray-500 cursor-default"
                                            )}
                                            placeholder="Descreva sua imobiliária, anos de mercado, especialidades..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                                <div className="md:col-span-1 space-y-4">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600" /> Endereço
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Cidade</label>
                                            <input name="cidade" value={formData.cidade} onChange={handleChange} readOnly={!isOwner} className={cn("w-full p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Bairro</label>
                                            <input name="bairro" value={formData.bairro} onChange={handleChange} readOnly={!isOwner} className={cn("w-full p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Endereço Completo</label>
                                            <input name="endereco" value={formData.endereco} onChange={handleChange} readOnly={!isOwner} className={cn("w-full p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-purple-600" /> Redes Sociais
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Facebook className="w-4 h-4 text-blue-600" />
                                            <input name="facebook" value={formData.facebook} onChange={handleChange} readOnly={!isOwner} placeholder="Facebook handle" className={cn("flex-1 p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Instagram className="w-4 h-4 text-pink-600" />
                                            <input name="instagram" value={formData.instagram} onChange={handleChange} readOnly={!isOwner} placeholder="Instagram handle" className={cn("flex-1 p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Linkedin className="w-4 h-4 text-blue-800" />
                                            <input name="linkedin" value={formData.linkedin} onChange={handleChange} readOnly={!isOwner} placeholder="Linkedin handle" className={cn("flex-1 p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Twitter className="w-4 h-4 text-sky-500" />
                                            <input name="twitter" value={formData.twitter} onChange={handleChange} readOnly={!isOwner} placeholder="Twitter handle" className={cn("flex-1 p-2 text-sm border-b outline-none", isOwner ? "focus:border-purple-500" : "text-gray-500 cursor-default")} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isOwner && (
                                <div className="flex justify-end pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-button font-bold transition-all shadow-card shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Salvar Alterações
                                    </button>
                                </div>
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

