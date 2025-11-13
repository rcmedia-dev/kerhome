import Image from 'next/image';
import { Award, Trophy, Star, Shield, Home } from 'lucide-react';

interface HeroSectionProps {
  profile: any;
  agentStats: {
    propertiesSold: number;
    yearsExperience: number;
    clientSatisfaction: number;
    averageDaysOnMarket: number;
  };
}

export function HeroSection({ profile, agentStats }: HeroSectionProps) {
  const initials = profile
    ? `${profile.primeiro_nome?.[0] || ''}${profile.ultimo_nome?.[0] || ''}`
    : '';

  return (
    <div className="bg-gradient-to-r from-gray-600 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/3 flex justify-center">
            {profile?.avatar_url ? (
              <div className="relative">
                <Image
                  src={profile.avatar_url}
                  alt="agent profile picture"
                  width={200}
                  height={200}
                  className="rounded-full object-cover border-4 border-white shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-orange-500 text-white text-5xl font-bold border-4 border-white shadow-2xl">
                {initials}
              </div>
            )}
          </div>
          
          <div className="lg:w-2/3 text-center lg:text-left">
            {profile ? (
              <>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                  <div className="flex gap-3 items-center bg-white/15 hover:bg-white/20 px-4 py-2 rounded-md text-white border-0 backdrop-blur-sm">
                    <Trophy className="w-3 h-3 mr-1" />
                    Top Vendedor
                  </div>
                  <div className="flex gap-3 items-center bg-white/15 hover:bg-white/20 px-4 py-2 rounded-md text-white border-0 backdrop-blur-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Especialista em Luxo
                  </div>
                  <div className="flex gap-3 items-center bg-white/15 hover:bg-white/20 px-4 py-2 rounded-md text-white border-0 backdrop-blur-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {profile.primeiro_nome} {profile.ultimo_nome}
                </h1>
                
                <p className="text-xl text-purple-100 mb-6 max-w-2xl">
                  Especialista em negócios imobiliários com {agentStats.yearsExperience} anos transformando sonhos em realidade
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center bg-white/15 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <Home className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{agentStats.propertiesSold}+ Imóveis Vendidos</span>
                  </div>
                  <div className="flex items-center bg-white/15 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <Star className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{agentStats.clientSatisfaction}% Satisfação</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-4 w-3/4 mx-auto lg:mx-0"></div>
                <div className="h-4 bg-white/20 rounded mb-2 w-full"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}