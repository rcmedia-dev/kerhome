'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Save, User, Mail, Phone, Building, Award, Globe, Facebook, Linkedin, Instagram, Youtube, Edit3, Briefcase, Users, Share2 } from 'lucide-react';
import { updateUserProfile } from '@/lib/actions/supabase-actions/update-user-profile';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type SettingsProps = {
  profile: UserProfile;
};

// Tipos para as tabs
type TabType = 'pessoal' | 'profissional' | 'redes-sociais' | 'sobre';

// Componente de input estilizado
const StyledInput = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  disabled,
  icon: Icon,
  className 
}: {
  label: string;
  name: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled: boolean;
  icon: any;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("space-y-2", className)}
  >
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 flex items-center gap-2"
    >
      <Icon className="w-4 h-4 text-purple-600" />
      {label}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:bg-purple-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={`Digite seu ${label.toLowerCase()}`}
      />
    </motion.div>
  </motion.div>
);

// Componente de textarea estilizado
const StyledTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  disabled 
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 flex items-center gap-2"
    >
      <Edit3 className="w-4 h-4 text-purple-600" />
      {label}
    </label>
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:bg-purple-50 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        placeholder="Conte um pouco sobre você..."
      />
    </motion.div>
  </motion.div>
);

// Botão de submit animado
const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <motion.button
    type="submit"
    disabled={isSubmitting}
    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
    className={cn(
      "w-full px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg",
      isSubmitting 
        ? "bg-purple-400 cursor-not-allowed" 
        : "bg-gradient-to-r from-purple-700 to-orange-500 hover:from-purple-800 hover:to-orange-600 hover:shadow-xl"
    )}
  >
    <AnimatePresence mode="wait">
      {isSubmitting ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
          <span>Salvando...</span>
        </motion.div>
      ) : (
        <motion.div
          key="save"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Salvar Alterações</span>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

// Componente de Tab
const TabButton = ({ 
  tab, 
  currentTab, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  tab: TabType;
  currentTab: TabType;
  onClick: (tab: TabType) => void;
  icon: any;
  label: string;
}) => (
  <motion.button
    type="button"
    onClick={() => onClick(tab)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
      currentTab === tab
        ? "bg-gradient-to-r from-purple-700 to-orange-500 text-white shadow-lg"
        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </motion.button>
);

// Conteúdo das tabs
const PersonalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput
        label="Primeiro Nome"
        name="primeiro_nome"
        type="text"
        value={(form.primeiro_nome as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={User}
      />
      <StyledInput
        label="Último Nome"
        name="ultimo_nome"
        type="text"
        value={(form.ultimo_nome as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={User}
      />
      <StyledInput
        label="Email"
        name="email"
        type="email"
        value={(form.email as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Mail}
        className="md:col-span-2"
      />
      <StyledInput
        label="Telefone"
        name="telefone"
        type="tel"
        value={(form.telefone as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Phone}
        className="md:col-span-2"
      />
    </div>
  </motion.div>
);

const ProfessionalInfoTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput
        label="Empresa"
        name="empresa"
        type="text"
        value={(form.empresa as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Building}
      />
      <StyledInput
        label="Licença"
        name="licenca"
        type="text"
        value={(form.licenca as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Award}
      />
    </div>
  </motion.div>
);

const SocialMediaTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StyledInput
        label="Website"
        name="website"
        type="url"
        value={(form.website as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Globe}
      />
      <StyledInput
        label="Facebook"
        name="facebook"
        type="url"
        value={(form.facebook as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Facebook}
      />
      <StyledInput
        label="LinkedIn"
        name="linkedin"
        type="url"
        value={(form.linkedin as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Linkedin}
      />
      <StyledInput
        label="Instagram"
        name="instagram"
        type="text"
        value={(form.instagram as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Instagram}
      />
      <StyledInput
        label="YouTube"
        name="youtube"
        type="url"
        value={(form.youtube as string) || ''}
        onChange={handleChange}
        disabled={isSubmitting}
        icon={Youtube}
        className="md:col-span-2"
      />
    </div>
  </motion.div>
);

const AboutTab = ({ form, handleChange, isSubmitting }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <StyledTextarea
      label="Sobre Mim"
      name="sobre_mim"
      value={(form.sobre_mim as string) || ''}
      onChange={handleChange}
      disabled={isSubmitting}
    />
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <p className="text-sm text-purple-700">
        <strong>Dica:</strong> Compartilhe sua experiência, especializações e o que torna seu trabalho único. 
        Esta informação ajuda a construir confiança com seus clientes.
      </p>
    </div>
  </motion.div>
);

export function ConfiguracoesConta({ profile }: SettingsProps) {
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      const success = await updateUserProfile({
        userId: profile.id,
        profileData: form,
      });

      if (success) {
        toast.success('Perfil atualizado com sucesso!', {
          style: {
            background: 'linear-gradient(135deg, #7C3AED, #EA580C)',
            color: 'white',
            border: 'none',
          },
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar perfil',
        {
          style: {
            background: '#EF4444',
            color: 'white',
            border: 'none',
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'pessoal' as TabType, label: 'Informações Pessoais', icon: User },
    { id: 'profissional' as TabType, label: 'Profissional', icon: Briefcase },
    { id: 'redes-sociais' as TabType, label: 'Redes Sociais', icon: Share2 },
    { id: 'sobre' as TabType, label: 'Sobre Mim', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pessoal':
        return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'profissional':
        return <ProfessionalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'redes-sociais':
        return <SocialMediaTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      case 'sobre':
        return <AboutTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
      default:
        return <PersonalInfoTab form={form} handleChange={handleChange} isSubmitting={isSubmitting} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm overflow-hidden">
        {/* Efeito de gradiente no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-500" />
        
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-orange-100 rounded-2xl">
              <Settings className="w-8 h-8 text-purple-700" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
                Configurações da Conta
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Gerencie suas informações de forma organizada
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Navegação por Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab.id}
                  currentTab={activeTab}
                  onClick={setActiveTab}
                  icon={tab.icon}
                  label={tab.label}
                />
              ))}
            </motion.div>

            {/* Conteúdo da Tab Ativa */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>

            {/* Botão de Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end pt-6 border-t border-gray-200"
            >
              <SubmitButton isSubmitting={isSubmitting} />
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
}