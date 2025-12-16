// components/user-card.tsx
'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CanSeeIt } from '@/components/can';
import { Pen, Upload, Globe, Facebook, Instagram, Linkedin, Youtube, Building, BadgeCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/store/user-store';

export type Stat = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
};

export type UserCardProps = {
  user: UserProfile;
  displayName: string;
  stats: Stat[];
  housesRemaining?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
};

// Componente AvatarSection com animações
const AvatarSection = ({
  user,
  isUploading,
  onUploadClick
}: {
  user: UserProfile;
  isUploading: boolean;
  onUploadClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 border-2 border-dashed border-purple-300 cursor-pointer transition-all duration-300 hover:border-orange-400 hover:shadow-xl"
        onClick={onUploadClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {user.avatar_url ? (
          <>
            <motion.img
              src={user.avatar_url}
              alt="Foto de perfil"
              className="w-full h-full object-cover rounded-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />

            <AnimatePresence>
              {(isHovered || isUploading) && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center text-white"
                    >
                      <Pen className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Editar</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            className="w-full h-full rounded-2xl flex flex-col items-center justify-center text-purple-400 hover:text-purple-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium text-purple-600">Adicionar foto</span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Badge de papel com design moderno
const RoleBadge = ({ role }: { role?: string }) => {
  if (!role) return null;

  const roleConfig = {
    agente: {
      bg: 'bg-gradient-to-r from-orange-500 to-amber-500',
      text: 'text-white',
      label: 'Agente',
      icon: BadgeCheck
    },
    admin: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      text: 'text-white',
      label: 'Admin',
      icon: BadgeCheck
    },
    user: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      text: 'text-white',
      label: 'Usuário',
      icon: BadgeCheck
    },
    default: {
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      text: 'text-white',
      label: role,
      icon: BadgeCheck
    }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.default;
  const IconComponent = config.icon;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "ml-2 text-xs px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm",
        config.bg,
        config.text
      )}
    >
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </motion.span>
  );
};

// Card de estatística com animação
const StatCard = ({ stat, index }: { stat: Stat; index: number }) => {
  const StatIcon = stat.icon;

  const statContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.05,
        y: -2
      }}
      className={cn(
        "p-4 bg-gradient-to-br from-white to-purple-50 rounded-2xl flex items-center justify-between border border-purple-100 transition-all duration-300 hover:shadow-lg",
        "relative overflow-hidden group"
      )}
    >
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
          {stat.value}
        </div>
        <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
      </div>
      <div className="relative z-10 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
        <StatIcon className="w-4 h-4 text-purple-600" />
      </div>
    </motion.div>
  );

  if (stat.label === "Visualizações" || stat.label === "Faturas") {
    return (
      <CanSeeIt key={index}>
        {statContent}
      </CanSeeIt>
    );
  }

  return statContent;
};

// Ícones das redes sociais
const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  const icons = {
    facebook: { icon: Facebook, color: 'hover:text-blue-600' },
    instagram: { icon: Instagram, color: 'hover:text-pink-600' },
    linkedin: { icon: Linkedin, color: 'hover:text-blue-700' },
    youtube: { icon: Youtube, color: 'hover:text-red-600' },
    website: { icon: Globe, color: 'hover:text-purple-600' }
  };

  const config = icons[platform as keyof typeof icons] || { icon: Globe, color: 'hover:text-gray-600' };
  const IconComponent = config.icon;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.2, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 transition-all duration-200 shadow-sm",
        config.color
      )}
    >
      <IconComponent className="w-4 h-4" />
    </motion.a>
  );
};

// Seção de redes sociais
const SocialLinks = ({ user }: { user: UserProfile }) => {
  const socialLinks = [
    { platform: 'facebook', url: user.facebook },
    { platform: 'instagram', url: user.instagram },
    { platform: 'linkedin', url: user.linkedin },
    { platform: 'youtube', url: user.youtube },
    { platform: 'website', url: user.website }
  ].filter(link => link.url);

  if (socialLinks.length === 0) return null;

  return (
    <motion.div
      className="mt-6 pt-4 border-t border-purple-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h4 className="text-xs font-semibold text-gray-600 mb-3 text-center">Redes Sociais</h4>
      <div className="flex justify-center space-x-2">
        {socialLinks.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <SocialIcon platform={link.platform} url={link.url || ""} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Informações da empresa/licença
const ProfessionalInfo = ({ user }: { user: UserProfile }) => {
  if (!user.empresa && !user.licenca) return null;

  return (
    <motion.div
      className="mt-4 space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {user.empresa && (
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Building className="w-4 h-4 mr-2 text-purple-500" />
          <span className="font-medium">{user.empresa}</span>
        </div>
      )}
      {user.licenca && (
        <div className="flex items-center justify-center text-xs text-gray-500">
          <BadgeCheck className="w-4 h-4 mr-2 text-orange-500" />
          <span>Licença: {user.licenca}</span>
        </div>
      )}
    </motion.div>
  );
};

export function UserCard({ user, displayName, stats, housesRemaining, onAvatarUpdate }: UserCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProfileDescription = () => {
    if (user.empresa) return user.empresa;
    if (user.username) return `@${user.username}`;
    return "Bem-vindo ao seu perfil";
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... existing logic ...
    const file = event.target.files?.[0];
    if (!file || !user.id) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    setIsUploading(true);

    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      onAvatarUpdate?.(publicUrl);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='p-4'
    >
      <Card className=" shadow-lg border-0 bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm overflow-hidden">
        {/* Efeito de gradiente no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500" />

        <CardHeader className="text-center pb-4 pt-6">
          <AvatarSection
            user={user}
            isUploading={isUploading}
            onUploadClick={handleAvatarClick}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            ref={fileInputRef}
            disabled={isUploading}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center">
              {displayName}
              <RoleBadge role={user.role || "user"} />
            </CardTitle>

            <CardDescription className="text-gray-600 text-sm mt-2 leading-relaxed">
              {getProfileDescription()}
            </CardDescription>

            {/* Exibir Imóveis Restantes se for agente */}
            {user.role === 'agent' && housesRemaining !== undefined && (
              <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-md border border-purple-100">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-purple-700">
                  {housesRemaining} {housesRemaining === 1 ? 'imóvel restante' : 'imóveis restantes'}
                </span>
              </div>
            )}
          </motion.div>

          <ProfessionalInfo user={user} />
        </CardHeader>

        <CardContent className="pt-4">
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </motion.div>

          <SocialLinks user={user} />
        </CardContent>
      </Card>
    </motion.div>
  );
}