'use client'

import React, { useState } from 'react';
import { Search, Home, Users, MapPin, Star, ArrowRight, Phone, Mail, Instagram, Facebook, Twitter, CheckCircle, TrendingUp, Globe, Shield } from 'lucide-react';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState('comprar');
  
  const features = [
    {
      icon: <Home className="w-8 h-8 text-purple-700" />,
      title: "Imóveis Verificados",
      description: "Todos os imóveis passam por verificação rigorosa para garantir qualidade e autenticidade"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Agentes Qualificados",
      description: "Rede de agentes certificados e especializados em diferentes regiões de Angola"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-700" />,
      title: "Análise de Mercado",
      description: "Relatórios detalhados sobre tendências e valorização imobiliária"
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      title: "Transações Seguras",
      description: "Plataforma segura com documentação digital e processos transparentes"
    }
  ];

  const stats = [
    { number: "5000+", label: "Imóveis Disponíveis" },
    { number: "200+", label: "Agentes Parceiros" },
    { number: "15", label: "Províncias Cobertas" },
    { number: "98%", label: "Satisfação dos Clientes" }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Compradora",
      content: "Encontrei minha casa dos sonhos em Luanda através do KerHome. O processo foi simples e seguro.",
      rating: 5
    },
    {
      name: "João Pereira",
      role: "Agente Imobiliário",
      content: "Como agente, o KerHome me conectou com mais clientes e aumentou minhas vendas em 40%.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Investidora",
      content: "A plataforma oferece excelentes ferramentas de análise para investimentos imobiliários.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
     
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o KerHome?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos uma plataforma completa que conecta compradores, vendedores e agentes, 
              facilitando todas as etapas do processo imobiliário.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Revolucionando o Mercado Imobiliário
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                O KerHome emergiu no mercado angolano com uma missão clara: transformar a forma como 
                as pessoas interagem com o mercado imobiliário. Nossa plataforma digital conecta 
                compradores, vendedores e agentes de forma eficiente e segura.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Não promovemos apenas imóveis, mas também capacitamos agentes imobiliários, 
                oferecendo ferramentas modernas para expandir seus negócios tanto nacionalmente 
                quanto internacionalmente.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Processos 100% digitais e transparentes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Rede nacional de agentes qualificados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Suporte 24/7 para clientes e parceiros</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Expansão para mercados internacionais</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-700 to-orange-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
                <p className="text-lg opacity-90 mb-6">
                  Facilitar a comercialização de imóveis através de tecnologia inovadora, 
                  conectando pessoas e criando oportunidades de negócio sustentáveis.
                </p>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Presença em 15 províncias angolanas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agentes" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Junte-se à Nossa Rede de Agentes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seja parte da revolução imobiliária. Oferecemos ferramentas, suporte e 
              oportunidades para agentes crescerem seus negócios.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cadastro Gratuito</h3>
              <p className="text-gray-600 mb-6">
                Registre-se gratuitamente e comece a usar nossa plataforma imediatamente.
              </p>
              <button className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors">
                Cadastrar Agora
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ferramentas Avançadas</h3>
              <p className="text-gray-600 mb-6">
                Acesse ferramentas de gestão, análise de mercado e marketing digital.
              </p>
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Ver Ferramentas
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-700 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expansão Internacional</h3>
              <p className="text-gray-600 mb-6">
                Oportunidades de negócio além das fronteiras angolanas.
              </p>
              <button className="bg-gradient-to-r from-purple-700 to-orange-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
                Saber Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de sucesso na nossa plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para encontrar seu imóvel ideal?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de angolanos que já confiam no KerHome
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-700 transition-colors">
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}