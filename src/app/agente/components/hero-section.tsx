"use client";

import Image from "next/image";
import { Award, Trophy, Star, Shield, Home, Sparkles } from "lucide-react";
import type { HeroSectionProps, AgentProfile } from "@/types/agent";
import { motion } from "framer-motion";

export function HeroSection({ profile, agentStats }: HeroSectionProps) {
  // Verifica se profile é válido
  const hasProfile = profile !== null && profile !== undefined;

  // Gera iniciais somente se houver perfil válido
  const initials = hasProfile && profile
    ? `${profile.primeiro_nome?.[0] || ""}${profile.ultimo_nome?.[0] || ""}`
    : "";

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-orange-700 text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* FOTO OU INICIAIS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/3 flex justify-center"
          >
            {hasProfile && profile.avatar_url ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <Image
                  src={profile.avatar_url}
                  alt="agent profile picture"
                  width={220}
                  height={220}
                  className="relative rounded-full object-cover border-4 border-white shadow-2xl"
                />

                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-xl">
                  <Award className="w-7 h-7 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-[220px] h-[220px] flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-orange-500 text-white text-6xl font-bold border-4 border-white shadow-2xl">
                  {initials}
                </div>
              </div>
            )}
          </motion.div>

          {/* TEXTOS E ESTATÍSTICAS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-2/3 text-center lg:text-left"
          >
            {hasProfile && profile ? (
              <>
                {/* BADGES */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-white backdrop-blur-md border border-white/20 transition-all"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-semibold">Top Vendedor</span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-white backdrop-blur-md border border-white/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Especialista em Luxo</span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 px-4 py-2 rounded-full text-white backdrop-blur-md border border-green-400/30 transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-semibold">Verificado</span>
                  </motion.div>
                </div>

                {/* NOME COMPLETO */}
                <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                  {profile.primeiro_nome} {profile.ultimo_nome}
                </h1>

                {/* DESCRIÇÃO */}
                <p className="text-xl text-purple-100 mb-8 max-w-2xl leading-relaxed">
                  Especialista em negócios imobiliários com <span className="font-bold text-white">{agentStats.yearsExperience} anos</span> transformando sonhos em realidade
                </p>

                {/* ESTATÍSTICAS */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex items-center bg-white/15 hover:bg-white/25 rounded-xl px-5 py-3 backdrop-blur-md border border-white/20 transition-all"
                  >
                    <Home className="w-6 h-6 mr-3 text-orange-300" />
                    <div>
                      <div className="text-2xl font-bold">{agentStats.propertiesSold}+</div>
                      <div className="text-xs text-purple-200">Imóveis Vendidos</div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex items-center bg-white/15 hover:bg-white/25 rounded-xl px-5 py-3 backdrop-blur-md border border-white/20 transition-all"
                  >
                    <Star className="w-6 h-6 mr-3 text-yellow-300" />
                    <div>
                      <div className="text-2xl font-bold">{agentStats.clientSatisfaction}%</div>
                      <div className="text-xs text-purple-200">Satisfação</div>
                    </div>
                  </motion.div>
                </div>
              </>
            ) : (
              /* SKELETON LOADING */
              <div className="animate-pulse">
                <div className="h-10 bg-white/20 rounded-lg mb-6 w-3/4 mx-auto lg:mx-0"></div>
                <div className="h-6 bg-white/20 rounded-lg mb-3 w-full"></div>
                <div className="h-6 bg-white/20 rounded-lg w-2/3"></div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
