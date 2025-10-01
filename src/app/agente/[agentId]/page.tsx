'use client'

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Linkedin, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import React from 'react';
import Link from 'next/link';

export default function AgentProfilePage(
  params: { params: Promise<{ agentId: string }> }
) {
  // Unwrap dos parâmetros (Next.js 15+)
  const { agentId } = React.use(params.params);

  const [activeTab, setActiveTab] = useState('properties');

  // Query para perfil
  const agentProfile = useQuery({
    queryKey: ['agent-profile', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId);
      if (error) throw error;
      return data;
    }
  });

  // Query para imóveis
  const agentProperties = useQuery({
    queryKey: ['agent-properties', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', agentId);
      if (error) throw error;
      return data;
    }
  });

  // Pega o primeiro perfil (já que supabase retorna array)
  const profile = agentProfile.data?.[0];

  // Gera iniciais
  const initials = profile
    ? `${profile.primeiro_nome?.[0] || ''}${profile.ultimo_nome?.[0] || ''}`
    : '';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <Card className="p-6 shadow-sm border-gray-100 sticky top-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="agent profile picture"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] flex items-center justify-center rounded-full bg-purple-700 text-white text-3xl font-bold border-4 border-gray-100">
                    {initials}
                  </div>
                )}
                
                <div className="mt-4">
                  {profile ? (
                    <>
                      <h1 className="text-2xl font-bold text-gray-800">
                        {profile.primeiro_nome} {profile.ultimo_nome}
                      </h1>
                      <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Disponível para novos clientes
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Carregando perfil...</p>
                  )}
                </div>

                <div className="w-full mt-6 space-y-3">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                </div>

                {profile && (
                  <div className="w-full mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3">Informações de contacto</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {profile.telefone || "Não informado"}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {profile.email || "Não informado"}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profile.localizacao || "Não informado"}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      {profile.instagram && (
                        <a href={profile.instagram} target="_blank" className="text-gray-400 hover:text-pink-600 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:w-2/3">
            {/* Abas */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8">
                <button 
                  className={`pb-4 px-1 ${activeTab === 'properties' ? 'border-b-2 border-orange-500 text-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('properties')}
                >
                  Imóveis ({agentProperties.data?.length || 0})
                </button>
                <button 
                  className={`pb-4 px-1 ${activeTab === 'about' ? 'border-b-2 border-orange-500 text-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('about')}
                >
                  Sobre
                </button>
              </div>
            </div>

            {/* Conteúdo das abas */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-1 gap-5">
                  {agentProperties.data?.map((prop) => (
                    <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-gray-100 flex flex-col md:flex-row h-full px-5">
                      <div className="md:w-2/5 relative h-64 md:h-auto">
                        <Image 
                          src={prop.gallery[0]} 
                          alt={prop.title} 
                          fill
                          className="object-cover w-full h-full rounded-lg" 
                        />
                        <div className={`absolute top-3 left-3 text-xs font-medium py-1 px-2 rounded ${prop.status === 'para comprar' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {prop.status}
                        </div>
                      </div>

                      <CardContent className="p-5 md:w-3/5 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">{prop.title}</h3>
                          <p className="text-gray-900 font-bold text-xl mb-3">{prop.preco}</p>
                          
                          <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            <span>{prop.bathrooms} quartos</span>
                            <span>{prop.bedrooms} banheiros</span>
                            <span>{prop.size}m²</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {prop.endereco}
                          </div>
                        </div>

                        <Link
                          href={`/propriedades/${prop.id}`}
                        >
                          <Button
                            className="flex gap-2 text-sm mt-auto text-white bg-orange-500 hover:bg-orange-600">
                              <Sparkles className="w-4 h-4" />
                              Ver Detalhes
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.sobre_mim || "Informações não disponíveis."}
                  </p>
                </div>  
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
