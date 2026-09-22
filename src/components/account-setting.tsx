'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Save, User, Briefcase, Share2, FileText, Camera, Loader2, Check, Settings } from 'lucide-react';
import { updateUserProfile } from '@/lib/functions/supabase-actions/update-user-profile';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/dashboard/shared-ui';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { compressAvatar } from '@/lib/utils/image';

type SettingsProps = {
  profile: UserProfile;
};

type TabType = 'pessoal' | 'profissional' | 'redes-sociais' | 'sobre';

const sectionToTab: Record<string, TabType> = {
  general: 'pessoal',
  pessoal: 'pessoal',
  profissional: 'profissional',
  'redes-sociais': 'redes-sociais',
  redes: 'redes-sociais',
  sobre: 'sobre',
};

const tabToSection: Record<TabType, string> = {
  pessoal: 'general',
  profissional: 'profissional',
  'redes-sociais': 'redes-sociais',
  sobre: 'sobre',
};

const StyledInput = ({
  label, name, type, value, onChange, disabled, className, required, hint
}: {
  label: string; name: string; type: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled: boolean; icon?: any; className?: string; required?: boolean; hint?: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("space-y-1.5", className)}>
    <label htmlFor={name} className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-400">
      {label}{required ? ' *' : ''}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <input id={name} name={name} type={type} value={value || ''} onChange={onChange} disabled={disabled} required={required}
        className="w-full min-h-[46px] rounded-xl border-[1.5px] border-gray-200 bg-[#fafbfc] px-3.5 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={`Digite seu ${label.toLowerCase()}`} />
      {hint && <p className="text-[11px] text-gray-400 mt-1.5">{hint}</p>}
    </motion.div>
  </motion.div>
);

const StyledTextarea = ({ label, name, value, onChange, disabled }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; disabled: boolean;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
    <label htmlFor={name} className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-400">
      {label}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <textarea id={name} name={name} rows={4} value={value || ''} onChange={onChange} disabled={disabled}
        className="w-full min-h-[110px] rounded-xl border-[1.5px] border-gray-200 bg-[#fafbfc] px-3.5 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        placeholder="Conte um pouco sobre você..." />
    </motion.div>
  </motion.div>
);

const SubmitButton = ({ isSubmitting, isDirty, savedFlash }: {
  isSubmitting: boolean; isDirty: boolean; savedFlash: boolean;
}) => (
  <motion.button type="submit" disabled={isSubmitting || !isDirty}
    whileHover={{ scale: isSubmitting || !isDirty ? 1 : 1.02 }}
    whileTap={{ scale: isSubmitting || !isDirty ? 1 : 0.98 }}
    className={cn(
      "px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white",
      savedFlash
        ? "bg-green-600 shadow-lg shadow-green-200"
        : "bg-gradient-to-r from-purple-700 to-orange-500 shadow-lg shadow-purple-500/25 hover:from-purple-800 hover:to-orange-600",
      (isSubmitting || !isDirty) && "opacity-45 cursor-not-allowed hover:from-purple-700 hover:to-orange-500 shadow-none"
    )}>
    <AnimatePresence mode="wait">
      {isSubmitting ? (
        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          <span>A guardar…</span>
        </motion.div>
      ) : savedFlash ? (
        <motion.div key="saved" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex items-center gap-2">
          <Check className="w-4 h-4" /><span>Guardado</span>
        </motion.div>
      ) : (
        <motion.div key="save" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>{isDirty ? 'Salvar alterações' : 'Sem alterações'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const SegmentedTabs = ({ tabs, activeTab, onTabChange }: {
  tabs: { id: TabType; label: string; icon: any }[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => (
  <div role="tablist" aria-label="Secções de definições" className="flex gap-1 p-1 bg-gray-100/80 border border-gray-200/70 rounded-2xl">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
            isActive
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          )}
        >
          <tab.icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{tab.label}</span>
        </button>
      );
    })}
  </div>
);

const PersonalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StyledInput label="Primeiro Nome" name="primeiro_nome" type="text" value={(form.primeiro_nome as string) || ''} onChange={handleChange} disabled={isSubmitting} required />
      <StyledInput label="Último Nome" name="ultimo_nome" type="text" value={(form.ultimo_nome as string) || ''} onChange={handleChange} disabled={isSubmitting} required />
      <StyledInput
        label="Email"
        name="email"
        type="email"
        value={(form.email as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        className="md:col-span-2"
        required
        hint="O email de login é gerido na conta de autenticação — aqui atualiza o email exibido no perfil."
      />
      <StyledInput label="Telefone" name="telefone" type="tel" value={(form.telefone as string) || ''} onChange={handleChange} disabled={isSubmitting} className="md:col-span-2" />
    </div>
  </motion.div>
);

const ProfessionalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StyledInput label="Empresa" name="empresa" type="text" value={(form.empresa as string) || ''} onChange={handleChange} disabled={isSubmitting} />
      <StyledInput label="Licença" name="licenca" type="text" value={(form.licenca as string) || ''} onChange={handleChange} disabled={isSubmitting} />
    </div>
  </motion.div>
);

const SocialMediaTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StyledInput label="Website" name="website" type="url" value={(form.website as string) || ''} onChange={handleChange} disabled={isSubmitting} />
      <StyledInput label="Facebook" name="facebook" type="url" value={(form.facebook as string) || ''} onChange={handleChange} disabled={isSubmitting} />
      <StyledInput label="LinkedIn" name="linkedin" type="url" value={(form.linkedin as string) || ''} onChange={handleChange} disabled={isSubmitting} />
      <StyledInput label="Instagram" name="instagram" type="text" value={(form.instagram as string) || ''} onChange={handleChange} disabled={isSubmitting} />
      <StyledInput label="YouTube" name="youtube" type="url" value={(form.youtube as string) || ''} onChange={handleChange} disabled={isSubmitting} className="md:col-span-2" />
    </div>
  </motion.div>
);

const AboutTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <StyledTextarea label="Sobre Mim" name="sobre_mim" value={(form.sobre_mim as string) || ''} onChange={handleChange} disabled={isSubmitting} />
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <p className="text-sm text-purple-700">
        <strong>Dica:</strong> Compartilhe sua experiência, especializações e o que torna seu trabalho único.
        Esta informação ajuda a construir confiança com seus clientes.
      </p>
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────
export function ConfiguracoesConta({ profile }: SettingsProps) {
  const updateUser = useUserStore(state => state.updateUser);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<UserProfile>>(profile);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  const initialFormRef = useRef<Partial<UserProfile>>({ ...profile });

  const pName = `${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}`.trim() || profile.email || '';

  // Sync tab with URL (?section=general|profissional|redes-sociais|sobre)
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && sectionToTab[section]) {
      setActiveTab(sectionToTab[section]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const want = tabToSection[activeTab];
    if (params.get('section') !== want) {
      params.set('section', want);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [activeTab]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um ficheiro de imagem (PNG ou JPG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning('A imagem deve ter no máximo 10MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const compressed = await compressAvatar(file);
      const fileExt = (compressed.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, compressed, { upsert: true, contentType: compressed.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setForm(prev => ({ ...prev, avatar_url: publicUrl }));
      initialFormRef.current = { ...initialFormRef.current, avatar_url: publicUrl };
      await updateUser({ avatar_url: publicUrl });
      toast.success('Foto de perfil atualizada!');
    } catch (error: any) {
      console.error('Erro ao atualizar avatar:', error);
      if (String(error?.message || '').toLowerCase().includes('maximum allowed size')) {
        toast.error('Imagem demasiado grande. Tente uma foto menor ou mais leve.');
      } else {
        toast.error('Erro ao atualizar a foto.');
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const filledCount = (() => {
    const fields = ['primeiro_nome', 'ultimo_nome', 'email', 'telefone', 'empresa', 'licenca', 'sobre_mim', 'website', 'instagram'];
    return fields.filter(f => {
      const val = form[f as keyof UserProfile] ?? profile[f as keyof UserProfile];
      return val && String(val).trim() !== '';
    }).length;
  })();

  const profileCompletion = Math.round((filledCount / 9) * 100);

  const roleLabel = (() => {
    const r = (profile.role || '').toLowerCase();
    if (['agente', 'agent', 'corretor', 'profissional'].includes(r)) return 'Agente';
    if (r === 'admin') return 'Admin';
    return 'Membro';
  })();

  type MissingField = { key: string; label: string; section: TabType };

  const missingFields: MissingField[] = (() => {
    const meta: { key: string; label: string; section: TabType }[] = [
      { key: 'telefone', label: 'Telefone', section: 'pessoal' },
      { key: 'sobre_mim', label: 'Biografia', section: 'sobre' },
      { key: 'empresa', label: 'Empresa', section: 'profissional' },
      { key: 'licenca', label: 'Licença', section: 'profissional' },
      { key: 'website', label: 'Website', section: 'redes-sociais' },
    ];
    return meta.filter(({ key }) => {
      const val = form[key as keyof UserProfile] ?? profile[key as keyof UserProfile];
      return !val || String(val).trim() === '';
    });
  })();

  const hasName = Boolean(
    (form.primeiro_nome || profile.primeiro_nome || '').toString().trim()
  );

  const goToSection = (section: TabType) => {
    setActiveTab(section);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('section', tabToSection[section]);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const tabFields: Record<TabType, string[]> = {
    pessoal: ['primeiro_nome', 'ultimo_nome', 'email', 'telefone'],
    profissional: ['empresa', 'licenca'],
    'redes-sociais': ['website', 'facebook', 'linkedin', 'instagram', 'youtube'],
    sobre: ['sobre_mim'],
  };

  const isTabDirty = (tab: TabType) => {
    return tabFields[tab].some(f => {
      const formVal = form[f as keyof UserProfile];
      const initVal = initialFormRef.current[f as keyof UserProfile];
      return formVal !== undefined && formVal !== initVal;
    });
  };

  const isDirty = isTabDirty(activeTab);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDiscard = () => {
    setForm(prev => {
      const next = { ...prev };
      tabFields[activeTab].forEach(f => {
        (next as any)[f] = initialFormRef.current[f as keyof UserProfile];
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!isDirty) return;
    setIsSubmitting(true);
    try {
      const tabData: Partial<UserProfile> = {};
      tabFields[activeTab].forEach(f => {
        if (form[f as keyof UserProfile] !== undefined) {
          (tabData as any)[f] = form[f as keyof UserProfile];
        }
      });
      const success = await updateUserProfile({ userId: profile.id, profileData: tabData });
      if (success) {
        await updateUser(tabData);
        tabFields[activeTab].forEach(f => {
          if (tabData[f as keyof UserProfile] !== undefined) {
            (initialFormRef.current as any)[f] = tabData[f as keyof UserProfile];
          }
        });
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1600);
        toast.success('Secção atualizada com sucesso!', {
          style: { background: 'linear-gradient(135deg, #7C3AED, #EA580C)', color: 'white', border: 'none' },
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'pessoal' as TabType, label: 'Geral', icon: User },
    { id: 'profissional' as TabType, label: 'Profissional', icon: Briefcase },
    { id: 'redes-sociais' as TabType, label: 'Redes', icon: Share2 },
    { id: 'sobre' as TabType, label: 'Sobre', icon: FileText },
  ];

  const sectionLabel = tabs.find(t => t.id === activeTab)?.label ?? '';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pessoal': return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'profissional': return <ProfessionalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'redes-sociais': return <SocialMediaTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'sobre': return <AboutTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      default: return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
    }
  };

  const avatarBlock = (
    <div className="relative group/avatar w-fit">
      <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-purple-500 to-orange-500 p-[3px]">
        <div className="relative w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center z-20 gap-1 px-1 text-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
              <span className="text-[8px] font-bold text-white leading-tight">A processar…</span>
            </div>
          )}
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-orange-500 bg-clip-text text-transparent">
              {pName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploadingAvatar}
        aria-label="Alterar foto de perfil"
        title="Alterar foto de perfil"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center text-purple-600 shadow-sm hover:bg-purple-600 hover:text-white hover:scale-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed z-10"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />
    </div>
  );

  const saveBar = (
    <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className={cn(
        "flex items-center gap-2 text-[13px] font-semibold",
        isDirty ? "text-amber-600" : savedFlash ? "text-green-600" : "text-gray-400"
      )}>
        {isDirty ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Secção <strong className="font-bold">{sectionLabel}</strong> · alterações por guardar
          </>
        ) : savedFlash ? (
          <>
            <Check className="w-4 h-4" /> Tudo sincronizado
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            Sem alterações
          </>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={!isDirty || isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Descartar
        </button>
        <SubmitButton isSubmitting={isSubmitting} isDirty={isDirty} savedFlash={savedFlash} />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

      {/* ═══════════ MOBILE LAYOUT ═══════════ */}
      <div className="lg:hidden min-h-full flex flex-col bg-gray-50/50">
        <SectionHeader
          title="Configurações da Conta"
          icon={Settings}
          description="Gerencie o seu perfil, dados e redes sociais."
          className="!mb-0 !px-0 pt-1"
        />
        {/* Profile Header (Variation 1) */}
        <div className="flex flex-col items-center py-6 px-5 bg-white border-b border-gray-100">
          <div className="mb-3">{avatarBlock}</div>
          <div className="text-[17px] font-extrabold text-gray-900 text-center">{pName}</div>
          <div className="text-[13px] text-gray-400 mt-0.5 truncate max-w-full" title={profile.email || undefined}>
            {profile.email}
          </div>
          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-100">
            {roleLabel}
          </span>
          {/* Score bar */}
          <div className="w-full max-w-[200px] mt-4">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
              <span>Completude</span>
              <span className="text-purple-600 tabular-nums">{profileCompletion}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileCompletion}
              aria-label="Completude do perfil"
              className="h-[6px] rounded-full bg-gray-100 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all duration-500 motion-reduce:transition-none"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400 text-center tabular-nums">
              {filledCount} de 9 campos
            </p>
          </div>
        </div>

        {/* Pill Tabs + Inline Form (Variation 5) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
            {/* Pill Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md shadow-purple-200"
                        : "bg-white text-gray-500 border border-gray-200 active:scale-95"
                    )}>
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4">

                {activeTab === 'pessoal' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primeiro Nome</label>
                      <input name="primeiro_nome" type="text" required minLength={2} value={(form.primeiro_nome as string) || (profile.primeiro_nome as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Último Nome</label>
                      <input name="ultimo_nome" type="text" required minLength={2} value={(form.ultimo_nome as string) || (profile.ultimo_nome as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
                      <input name="email" type="email" required value={(form.email as string) || (profile.email as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Telefone</label>
                      <input name="telefone" type="tel" value={(form.telefone as string) || (profile.telefone as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                  </>
                )}

                {activeTab === 'profissional' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Empresa</label>
                      <input name="empresa" type="text" value={(form.empresa as string) || (profile.empresa as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Licença</label>
                      <input name="licenca" type="text" value={(form.licenca as string) || (profile.licenca as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                  </>
                )}

                {activeTab === 'redes-sociais' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Website</label>
                      <input name="website" type="url" value={(form.website as string) || (profile.website as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Facebook</label>
                      <input name="facebook" type="url" value={(form.facebook as string) || (profile.facebook as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">LinkedIn</label>
                      <input name="linkedin" type="url" value={(form.linkedin as string) || (profile.linkedin as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Instagram</label>
                      <input name="instagram" type="text" value={(form.instagram as string) || (profile.instagram as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">YouTube</label>
                      <input name="youtube" type="url" value={(form.youtube as string) || (profile.youtube as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                    </div>
                  </>
                )}

                {activeTab === 'sobre' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sobre Mim</label>
                      <textarea name="sobre_mim" rows={5} value={(form.sobre_mim as string) || (profile.sobre_mim as string) || ''} onChange={handleChange}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                        placeholder="Conte um pouco sobre você..." />
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5">
                      <p className="text-[13px] text-purple-700 leading-relaxed">
                        <strong>Dica:</strong> Compartilhe sua experiência e especializações.
                      </p>
                    </div>
                  </>
                )}

                {/* Per-tab Save Button */}
                {isTabDirty(activeTab) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <button type="submit" disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-[14px] font-bold active:scale-[0.98] transition-transform shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* ═══════════ DESKTOP LAYOUT — V4 (two-column profile + form) ═══════════ */}
      <div className="hidden lg:block">
        <SectionHeader
          title="Configurações da Conta"
          icon={Settings}
          description="Gerencie o seu perfil, dados profissionais e redes sociais."
          className="mb-6"
        />

        <form onSubmit={handleSubmit} className="flex items-start gap-0">
          {/* Left rail: identity + optimization */}
          <aside
            aria-label="Resumo do perfil"
            className="w-full lg:w-[248px] xl:w-[280px] shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:custom-scrollbar lg:pr-0.5 flex flex-col gap-3"
          >
            {/* Identity */}
            <Card className="relative shadow-card border border-border bg-white overflow-hidden !gap-0 !py-0">
              <div className="h-1 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-500" />
              <div className="px-5 pt-5 pb-5 flex flex-col items-center text-center gap-3">
                {avatarBlock}
                <div className="min-w-0 w-full">
                  <div className="text-[15px] font-black text-gray-900 leading-snug break-words">
                    {pName}
                  </div>
                  <div
                    className="text-xs text-gray-400 mt-0.5 truncate"
                    title={profile.email || undefined}
                  >
                    {profile.email}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-100">
                  {roleLabel}
                </span>
                <div className="w-full">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-gray-400">
                      Completude
                    </span>
                    <span className="text-xs font-black text-purple-700 tabular-nums">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={profileCompletion}
                    aria-label="Completude do perfil"
                    className="h-2 rounded-full bg-gray-100 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all duration-500 motion-reduce:transition-none"
                      style={{
                        width: `${profileCompletion}%`,
                        minWidth: profileCompletion > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-gray-400 tabular-nums">
                    {filledCount} de 9 campos preenchidos
                  </p>
                </div>
              </div>
            </Card>

            {/* Optimization / checklist */}
            <Card className="relative shadow-card border border-border bg-white overflow-hidden !gap-0 !py-0">
              <div className="h-1 bg-gradient-to-r from-purple-700 to-orange-500" />
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                    Otimização
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md",
                      profileCompletion >= 80
                        ? "bg-green-50 text-green-700"
                        : profileCompletion >= 50
                          ? "bg-amber-50 text-amber-700"
                          : "bg-orange-50 text-orange-700"
                    )}
                  >
                    {profileCompletion}%
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    aria-hidden
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 relative"
                    style={{
                      background: `conic-gradient(#820AD1 0 ${profileCompletion}%, #e5e7eb ${profileCompletion}% 100%)`,
                    }}
                  >
                    <div className="absolute inset-[5px] bg-white rounded-full" />
                    <span className="relative z-10 text-sm font-black text-purple-700 tabular-nums">
                      {profileCompletion}
                    </span>
                  </div>
                  <p className="text-left text-xs text-gray-500 leading-snug">
                    {missingFields.length > 0 ? (
                      <>
                        Falta{' '}
                        <strong className="text-gray-700 font-bold">
                          {missingFields.slice(0, 2).map(m => m.label).join(' e ')}
                        </strong>
                        . Toque para preencher.
                      </>
                    ) : (
                      <>
                        <strong className="text-green-700 font-bold">Perfil completo.</strong>
                        <br />
                        Nada em falta por agora.
                      </>
                    )}
                  </p>
                </div>

                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-[13px] text-green-700 font-semibold rounded-lg px-1.5 py-1 bg-green-50/60">
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    <span>Foto · Nome</span>
                  </li>
                  {missingFields.slice(0, 4).map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => goToSection(item.section)}
                        className="w-full flex items-center gap-2 text-[13px] text-amber-700 font-semibold rounded-lg px-1.5 py-1 hover:bg-amber-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-amber-500/90 shrink-0">
                          Completar
                        </span>
                      </button>
                    </li>
                  ))}
                  {missingFields.length === 0 && hasName && (
                    <li className="flex items-center gap-2 text-[13px] text-green-700 font-semibold rounded-lg px-1.5 py-1 bg-green-50/60">
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      <span>Campos essenciais</span>
                    </li>
                  )}
                </ul>
              </div>
            </Card>
          </aside>

          {/* Modern divider between columns */}
          <div
            aria-hidden
            className="hidden lg:block self-stretch w-px shrink-0 mx-5 min-h-[420px] bg-gradient-to-b from-purple-200/0 via-gray-200 to-orange-200/0"
          />

          {/* Right: form card */}
          <div className="flex-1 min-w-0">
            <Card className="relative shadow-lg border-0 bg-white overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-500" />
              <CardContent className="pt-6 pb-0">
                <SegmentedTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="pt-7 pb-6"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              {saveBar}
            </Card>
          </div>
        </form>
      </div>

    </motion.div>
  );
}
