'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Save, User, Mail, Phone, Building, Award, Globe, Facebook, Linkedin, Instagram, Youtube, Edit3, Briefcase, Users, Share2 } from 'lucide-react';
import { updateUserProfile } from '@/lib/functions/supabase-actions/update-user-profile';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentProfileTips } from '@/components/agent-profile-tips';
import { useUserStore } from '@/lib/store/user-store';

type SettingsProps = {
  profile: UserProfile;
};

type TabType = 'pessoal' | 'profissional' | 'redes-sociais' | 'sobre';

const StyledInput = ({ 
  label, name, type, value, onChange, disabled, icon: Icon, className, required 
}: {
  label: string; name: string; type: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled: boolean; icon: any; className?: string; required?: boolean;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("space-y-2", className)}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-purple-600" />{label}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <input id={name} name={name} type={type} value={value || ''} onChange={onChange} disabled={disabled} required={required}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:bg-purple-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={`Digite seu ${label.toLowerCase()}`} />
    </motion.div>
  </motion.div>
);

const StyledTextarea = ({ label, name, value, onChange, disabled }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; disabled: boolean;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex items-center gap-2">
      <Edit3 className="w-4 h-4 text-purple-600" />{label}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <textarea id={name} name={name} rows={4} value={value || ''} onChange={onChange} disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:bg-purple-50 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        placeholder="Conte um pouco sobre você..." />
    </motion.div>
  </motion.div>
);

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <motion.button type="submit" disabled={isSubmitting}
    whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
    className={cn(
      "w-full px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg",
      isSubmitting ? "bg-purple-400 cursor-not-allowed" 
        : "bg-linear-to from-purple-700 to-orange-500 hover:from-purple-800 hover:to-orange-600 hover:shadow-xl"
    )}>
    <AnimatePresence mode="wait">
      {isSubmitting ? (
        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          <span>Salvando...</span>
        </motion.div>
      ) : (
        <motion.div key="save" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex items-center gap-2">
          <Save className="w-5 h-5" /><span>Salvar Alterações</span>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const TabButton = ({ tab, currentTab, onClick, icon: Icon, label }: {
  tab: TabType; currentTab: TabType; onClick: (tab: TabType) => void; icon: any; label: string;
}) => (
  <motion.button type="button" onClick={() => onClick(tab)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
      currentTab === tab ? "bg-linear-to from-purple-700 to-orange-500 text-white shadow-lg"
        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
    )}>
    <Icon className="w-4 h-4" /><span>{label}</span>
  </motion.button>
);

const PersonalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput label="Primeiro Nome" name="primeiro_nome" type="text" value={(form.primeiro_nome as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={User} required />
      <StyledInput label="Último Nome" name="ultimo_nome" type="text" value={(form.ultimo_nome as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={User} required />
      <StyledInput label="Email" name="email" type="email" value={(form.email as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Mail} className="md:col-span-2" required />
      <StyledInput label="Telefone" name="telefone" type="tel" value={(form.telefone as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Phone} className="md:col-span-2" />
    </div>
  </motion.div>
);

const ProfessionalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput label="Empresa" name="empresa" type="text" value={(form.empresa as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Building} />
      <StyledInput label="Licença" name="licenca" type="text" value={(form.licenca as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Award} />
    </div>
  </motion.div>
);

const SocialMediaTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput label="Website" name="website" type="url" value={(form.website as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Globe} />
      <StyledInput label="Facebook" name="facebook" type="url" value={(form.facebook as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Facebook} />
      <StyledInput label="LinkedIn" name="linkedin" type="url" value={(form.linkedin as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Linkedin} />
      <StyledInput label="Instagram" name="instagram" type="text" value={(form.instagram as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Instagram} />
      <StyledInput label="YouTube" name="youtube" type="url" value={(form.youtube as string) || ''} onChange={handleChange} disabled={isSubmitting} icon={Youtube} className="md:col-span-2" />
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
  const [form, setForm] = useState<Partial<UserProfile>>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');

  const profileCompletion = (() => {
    const fields = ['primeiro_nome', 'ultimo_nome', 'email', 'telefone', 'empresa', 'licenca', 'sobre_mim', 'website', 'instagram'];
    const filled = fields.filter(f => {
      const val = form[f as keyof UserProfile] ?? profile[f as keyof UserProfile];
      return val && String(val).trim() !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const tabFields: Record<TabType, string[]> = {
    pessoal: ['primeiro_nome', 'ultimo_nome', 'email', 'telefone'],
    profissional: ['empresa', 'licenca'],
    'redes-sociais': ['website', 'facebook', 'linkedin', 'instagram', 'youtube'],
    sobre: ['sobre_mim'],
  };

  const isTabDirty = (tab: TabType) => {
    return tabFields[tab].some(f => {
      const formVal = form[f as keyof UserProfile];
      const profVal = profile[f as keyof UserProfile];
      return formVal !== undefined && formVal !== profVal;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
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
        toast.success('Perfil atualizado com sucesso!', {
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

  const pName = `${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}`.trim() || profile.email || '';

  const tabs = [
    { id: 'pessoal' as TabType, label: 'Informações Pessoais', icon: User },
    { id: 'profissional' as TabType, label: 'Profissional', icon: Briefcase },
    { id: 'redes-sociais' as TabType, label: 'Redes Sociais', icon: Share2 },
    { id: 'sobre' as TabType, label: 'Sobre Mim', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pessoal': return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'profissional': return <ProfessionalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'redes-sociais': return <SocialMediaTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'sobre': return <AboutTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      default: return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

      {/* ═══════════ MOBILE LAYOUT ═══════════ */}
      <div className="lg:hidden min-h-full flex flex-col bg-gray-50/50">
        {/* Profile Header (Variation 1) */}
        <div className="flex flex-col items-center py-6 px-5 bg-white border-b border-gray-100">
          <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-br from-purple-500 to-orange-500 p-[3px] mb-3">
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  {pName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="text-[17px] font-extrabold text-gray-900">{pName}</div>
          <div className="text-[13px] text-gray-400 mt-0.5">{profile.email}</div>
          {/* Score bar */}
          <div className="w-full max-w-[180px] mt-4">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
              <span>Perfil</span>
              <span className="text-purple-600">{profileCompletion}%</span>
            </div>
            <div className="h-[5px] rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
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

      {/* ═══════════ DESKTOP LAYOUT ═══════════ */}
      <div className="hidden lg:block">
        <Card className="shadow-xl border-0 bg-linear-to from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to from-purple-700 via-purple-500 to-orange-500" />
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to from-purple-100 to-orange-100 rounded-2xl">
                <Settings className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-linear-to from-purple-700 to-orange-500 bg-clip-text text-transparent">
                  Configurações da Conta
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Gerencie suas informações de forma organizada
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <AgentProfileTips userId={profile.id as string} />
            </div>
            <motion.form onSubmit={handleSubmit} className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
                {tabs.map((tab) => (
                  <TabButton key={tab.id} tab={tab.id} currentTab={activeTab} onClick={setActiveTab} icon={tab.icon} label={tab.label} />
                ))}
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-75">
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex justify-end pt-6 border-t border-gray-200">
                <SubmitButton isSubmitting={isSubmitting} />
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}
