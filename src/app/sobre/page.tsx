'use client'

import React from 'react';
import { Home, Star, ArrowRight, Phone, Mail, Instagram, Facebook, Twitter, CheckCircle, TrendingUp, Globe, Shield, Heart, Building, Target, Award } from 'lucide-react';



// Componente de estatísticas
const StatsSection = () => {
  const stats = [
    { number: "5000+", label: "Imóveis Disponíveis" },
    { number: "98%", label: "Satisfação dos Clientes" },
    { number: "15", label: "Províncias Cobertas" },
    { number: "24/7", label: "Suporte Disponível" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente de recursos
const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-purple-700" />,
      title: "Transações Seguras",
      description: "Plataforma segura com documentação digital e processos transparentes"
    },
    {
      icon: <Home className="w-8 h-8 text-orange-500" />,
      title: "Imóveis Verificados",
      description: "Todos os imóveis passam por verificação rigorosa para garantir qualidade"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-700" />,
      title: "Análise de Mercado",
      description: "Relatórios detalhados sobre tendências e valorização imobiliária"
    },
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "Busca Inteligente",
      description: "Encontre o imóvel perfeito com nosso sistema de busca avançado"
    }
  ];

  return (
    <section id="servicos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Por que escolher o KerCasa?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conectamos você aos melhores imóveis com tecnologia avançada e processos simplificados
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 bg-gradient-to-br from-purple-100 to-orange-100 p-3 rounded-xl w-fit">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente sobre a empresa
const AboutSection = () => (
  <section id="sobre" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-gradient-to-r from-purple-100 to-orange-100 text-purple-800 px-4 py-2 rounded-full mb-6">
            <span className="font-medium">Sobre Nós</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Revolucionando o Mercado Imobiliário em Angola
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            O KerCasa nasceu com a missão de transformar a experiência de compra e venda de imóveis 
            em Angola. Combinamos tecnologia inovadora com conhecimento local para oferecer 
            uma plataforma completa e confiável.
          </p>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Nossa equipe é composta por especialistas em tecnologia e mercado imobiliário, 
            trabalhando juntos para simplificar processos e conectar pessoas aos seus lares ideais.
          </p>
          
          <div className="space-y-4">
            {[
              "Processos 100% digitais e transparentes",
              "Verificação rigorosa de todos os imóveis",
              "Suporte personalizado em todas as etapas",
              "Expansão contínua para novas províncias"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="bg-gradient-to-br from-purple-700 to-orange-500 rounded-2xl p-8 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Award className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
              <p className="text-lg opacity-90 mb-6 leading-relaxed">
                Facilitar o acesso à moradia digna através de tecnologia inovadora, 
                criando conexões significativas entre pessoas e seus futuros lares.
              </p>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Presentes em 15 províncias angolanas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Componente de depoimentos
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Santos",
      role: "Compradora em Luanda",
      content: "Encontrei minha casa dos sonhos através do KerCasa. O processo foi transparente e seguro.",
      rating: 5
    },
    {
      name: "João Pereira",
      role: "Vendedor em Benguela",
      content: "Consegui vender meu apartamento rapidamente e com toda a segurança que precisava.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Investidora",
      content: "As ferramentas de análise do KerCasa são excelentes para tomar decisões de investimento.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600">
            Histórias reais de quem encontrou seu lar com o KerCasa
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-gray-600 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Página principal
export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <StatsSection />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
    </div>
  );
}