// components/user-card.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { CanSeeIt } from './can';
import { Plus, Pen, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id?: string;
  primeiro_nome?: string;
  ultimo_nome?: string;
  username?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  licenca?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
  sobre_mim?: string;
  pacote_agente_id?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
}

export type Stat = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
};

export type UserCardProps = {
  user: UserProfile;
  displayName: string;
  stats: Stat[];
  onAvatarUpdate?: (newAvatarUrl: string) => void;
};

// Componente AvatarSection refeito
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
    <div className="relative inline-block">
      <div 
        className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-purple-50 to-amber-50 border-2 border-dashed border-purple-200 cursor-pointer transition-all duration-300 hover:border-orange-400 hover:shadow-lg"
        onClick={onUploadClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {user.avatar_url ? (
          <>
            <img 
              src={user.avatar_url} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover rounded-full"
            />
            {/* Overlay de edição no hover - Laranja suave */}
            {(isHovered || isUploading) && (
              <div className="absolute inset-0 bg-black opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {isUploading ? (
                  <div className="text-orange-800 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Pen className="w-6 h-6 text-purple-700 mb-1" />
                    <span className="text-xs text-purple-800 font-medium">Editar</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-purple-400 hover:text-purple-600 transition-colors">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium text-purple-600">Adicionar foto</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role?: string }) => {
  if (!role) return null;

  const roleConfig = {
    agente: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Agente' },
    admin: { bg: 'bg-red-100', text: 'text-red-800', label: 'Administrador' },
    default: { bg: 'bg-gray-100', text: 'text-gray-800', label: role }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.default;

  return (
    <span className={`ml-2 text-xs ${config.bg} ${config.text} px-2 py-1 rounded-full`}>
      {config.label}
    </span>
  );
};

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => {
  const StatIcon = stat.icon;

  if (stat.label === "Visualizações" || stat.label === "Faturas") {
    return (
      <CanSeeIt key={index}>
        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl flex items-center justify-between border border-purple-100 transition-all duration-300 hover:shadow-md hover:border-purple-200">
          <div>
            <div className="text-lg sm:text-2xl font-bold text-purple-700">{stat.value}</div>
            <div className="text-xs text-purple-600">{stat.label}</div>
          </div>
          <StatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
      </CanSeeIt>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-purple-50 rounded-xl flex items-center justify-between border border-purple-100 transition-all duration-300 hover:shadow-md hover:border-purple-200">
      <div>
        <div className="text-lg sm:text-2xl font-bold text-purple-700">{stat.value}</div>
        <div className="text-xs text-purple-600">{stat.label}</div>
      </div>
      <StatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
    </div>
  );
};

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
    <div className="mt-4 pt-4 border-t border-purple-200">
      <h4 className="text-xs font-semibold text-purple-600 mb-2">Redes Sociais</h4>
      <div className="flex justify-center space-x-3">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-600 transition-colors"
          >
            {link.platform}
          </a>
        ))}
      </div>
    </div>
  );
};

export function UserCard({ user, displayName, stats, onAvatarUpdate }: UserCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProfileDescription = () => {
    if (user.sobre_mim) return user.sobre_mim;
    if (user.empresa) return user.empresa;
    if (user.username) return `@${user.username}`;
    return "Usuário";
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user.id) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload sem progresso (o Supabase não suporta onUploadProgress)
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate?.(publicUrl);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card className="shadow-md border-purple-100">
      <CardHeader className="text-center pb-2">
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
        
        <CardTitle className="text-lg sm:text-xl text-purple-900 mt-4 flex items-center justify-center">
          {displayName}
          <RoleBadge role={user.role} />
        </CardTitle>
        
        <CardDescription className="text-purple-700 text-xs sm:text-base">
          {getProfileDescription()}
        </CardDescription>

        {(user.empresa || user.licenca) && (
          <div className="mt-2 text-xs text-purple-600">
            {user.empresa && <div>{user.empresa}</div>}
            {user.licenca && <div>Licença: {user.licenca}</div>}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        <SocialLinks user={user} />
      </CardContent>
    </Card>
  );
}