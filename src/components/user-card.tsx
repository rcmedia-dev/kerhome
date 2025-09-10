// components/user-card.tsx
'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { CanSeeIt } from './can';
import { Edit, Upload, X, Camera, Cloud, User, Plus, Pen } from 'lucide-react';
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

export function UserCard({ user, displayName, stats, onAvatarUpdate }: UserCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para obter as iniciais do usuário
  const getUserInitials = () => {
    if (user.primeiro_nome && user.ultimo_nome) {
      return `${user.primeiro_nome[0]}${user.ultimo_nome[0]}`.toUpperCase();
    }
    if (user.primeiro_nome) {
      return user.primeiro_nome[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Obter a descrição do perfil
  const getProfileDescription = () => {
    if (user.sobre_mim) return user.sobre_mim;
    if (user.empresa) return user.empresa;
    if (user.username) return `@${user.username}`;
    return "Usuário";
  };

  // Manipular seleção de arquivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user.id) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Fazer upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário com a nova URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Chamar callback para atualizar o estado pai
      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      alert('Foto de perfil atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remover avatar
  const handleRemoveAvatar = async () => {
    if (!user.avatar_url || !user.id) return;

    if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

    setIsUploading(true);

    try {
      // Extrair nome do arquivo da URL
      const urlParts = user.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Remover arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from('user-avatars')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Remover URL do avatar do perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Chamar callback para atualizar o estado pai
      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

      alert('Foto de perfil removida com sucesso!');

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      alert('Erro ao remover a foto de perfil. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Abrir o seletor de arquivos
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="text-center pb-2">
        <div className="relative inline-block">
          {/* Avatar - Foto ou iniciais */}
          {user.avatar_url ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-purple-700 overflow-hidden ring-4 ring-purple-500/50">
              <img 
                src={user.avatar_url} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-purple-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ring-4 ring-purple-500/50">
              {getUserInitials()}
            </div>
          )}
          
          {/* Input de arquivo oculto */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
            ref={fileInputRef}
            disabled={isUploading}
          />
          
          {/* Botão de editar (apenas quando já tem foto) */}
          {user.avatar_url && !isUploading && (
            <button
              onClick={handleUploadClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md transition-all hover:bg-orange-600"
              title="Alterar foto de perfil"
            >
              <Pen className="w-4 h-4" />
            </button>
          )}
          
          {/* Indicador de upload em andamento */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        {/* Botão de upload destacado abaixo do avatar */}
        {!user.avatar_url && !isUploading && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUploadClick}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-medium">Adicionar foto de perfil</span>
            </button>
          </div>
        )}
        
        <CardTitle className="text-lg sm:text-xl text-gray-800 mt-4">
          {displayName}
          {user.role === 'agente' && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Agente
            </span>
          )}
          {user.role === 'admin' && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Administrador
            </span>
          )}
        </CardTitle>
        
        <CardDescription className="text-gray-500 text-xs sm:text-base">
          {getProfileDescription()}
        </CardDescription>

        {/* Informações adicionais se disponíveis */}
        {(user.empresa || user.licenca) && (
          <div className="mt-2 text-xs text-gray-400">
            {user.empresa && <div>{user.empresa}</div>}
            {user.licenca && <div>Licença: {user.licenca}</div>}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {stats.map((stat, i) => {
            const StatIcon = stat.icon;

            if (stat.label === "Visualizações" || stat.label === "Faturas") {
              return (
                <CanSeeIt key={i}>
                  <div className="p-3 sm:p-4 bg-purple-100 rounded-xl flex items-center justify-between border border-purple-200">
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
              <div
                key={i}
                className="p-3 sm:p-4 bg-purple-100 rounded-xl flex items-center justify-between border border-purple-200"
              >
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-purple-700">{stat.value}</div>
                  <div className="text-xs text-purple-600">{stat.label}</div>
                </div>
                <StatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            );
          })}
        </div>

        {/* Links de redes sociais se disponíveis */}
        {(user.facebook || user.instagram || user.linkedin || user.youtube || user.website) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Redes Sociais</h4>
            <div className="flex justify-center space-x-3">
              {/* ... ícones de redes sociais ... */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}