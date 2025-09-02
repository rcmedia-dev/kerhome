'use client'

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Star, Instagram, Linkedin, Heart, Share2, Calendar, Home, Trophy, Award, Clock, Building2, MessageCircle } from "lucide-react";
import Image from "next/image";

// Mock data do agente
const agent = {
  id: "123",
  nome: "João Silva",
  foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
  bio: "Agente imobiliário com 8 anos de experiência em imóveis residenciais e comerciais. Especialista no mercado de Luanda e arredores.",
  localizacao: "Luanda, Angola",
  telefone: "+244 923 456 789",
  email: "joao@imobiliaria.com",
  redes: {
    instagram: "https://instagram.com/joaosilva",
    linkedin: "https://linkedin.com/in/joaosilva",
  },
  avaliacoes: 32,
  rating: 4.8,
  imoveisVendidos: 47,
  anosExperiencia: 8,
  especialidades: ["Apartamentos", "Vivendas", "Comercial"],
  premios: ["Top Vendedor 2022", "Melhor Atendimento 2021"],
  disponibilidade: "Disponível para novos clientes"
};

// Mock data de propriedades
const propriedades = [
  {
    id: 1,
    titulo: "Apartamento T3 no Talatona",
    imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    preco: "45.000.000 AKZ",
    localizacao: "Talatona, Luanda",
    quartos: 3,
    banheiros: 2,
    area: "120 m²",
    tipo: "Venda"
  },
  {
    id: 2,
    titulo: "Vivenda Luxuosa com Piscina",
    imagem: "https://images.unsplash.com/photo-1600585154210-7e4c0de5b43d?auto=format&fit=crop&w=800&q=80",
    preco: "120.000.000 AKZ",
    localizacao: "Futungo, Luanda",
    quartos: 4,
    banheiros: 3,
    area: "250 m²",
    tipo: "Venda"
  },
  {
    id: 3,
    titulo: "Apartamento T2 para Aluguer",
    imagem: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    preco: "250.000 AKZ/mês",
    localizacao: "Miraflores, Luanda",
    quartos: 2,
    banheiros: 1,
    area: "85 m²",
    tipo: "Aluguer"
  },
];

// Mock data de avaliações
const avaliacoes = [
  {
    id: 1,
    cliente: "Maria Santos",
    data: "15 Set 2023",
    rating: 5,
    comentario: "Excelente profissional, ajudou muito na compra da minha casa. Processo rápido e transparente.",
    clienteFoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    cliente: "Carlos Mendes",
    data: "2 Ago 2023",
    rating: 4.5,
    comentario: "Atendimento de qualidade. Conhece bem o mercado e negociou um ótimo preço para meu apartamento.",
    clienteFoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    cliente: "Ana Sousa",
    data: "28 Jul 2023",
    rating: 5,
    comentario: "Superou todas as expectativas. Encontrou exatamente o que procurava em tempo recorde.",
    clienteFoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
  }
];

export default function AgentProfilePage() {
  const [activeTab, setActiveTab] = useState('properties');
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedProperties = showAllProperties ? propriedades : propriedades.slice(0, 3);
  const displayedReviews = showAllReviews ? avaliacoes : avaliacoes.slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar com informações de contato + estatísticas */}
          <div className="lg:w-1/3">
            <Card className="p-6 shadow-sm border-gray-100 sticky top-6 space-y-6">

              {/* Informações de contato */}
              <div className="flex flex-col items-center text-center">
                <Image
                  src={agent.foto}
                  alt={agent.nome}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-gray-100"
                />
                
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-gray-800">{agent.nome}</h1>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {agent.rating} ({agent.avaliacoes})
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {agent.disponibilidade}
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar agora
                  </Button>
                  
                  <Button variant="outline" className="w-full border-gray-300 py-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                  
                  <Button variant="outline" className="w-full border-gray-300 py-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar visita
                  </Button>
                </div>

                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-3">Informações de contacto</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {agent.telefone}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {agent.email}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {agent.localizacao}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <a href={agent.redes.instagram} target="_blank" className="text-gray-400 hover:text-pink-600 transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href={agent.redes.linkedin} target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-700 mb-4">Estatísticas</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Imóveis vendidos</span>
                    </div>
                    <span className="font-semibold">{agent.imoveisVendidos}+</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Anos de experiência</span>
                    </div>
                    <span className="font-semibold">{agent.anosExperiencia}+</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Avaliação média</span>
                    </div>
                    <span className="font-semibold">{agent.rating}/5</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:w-2/3">
            {/* Abas de navegação */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8">
                <button 
                  className={`pb-4 px-1 ${activeTab === 'properties' ? 'border-b-2 border-orange-500 text-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('properties')}
                >
                  Imóveis ({propriedades.length})
                </button>
                <button 
                  className={`pb-4 px-1 ${activeTab === 'reviews' ? 'border-b-2 border-orange-500 text-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Avaliações ({avaliacoes.length})
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
                  {displayedProperties.map((prop) => (
                    <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-gray-100 flex flex-col md:flex-row h-full px-5">
                      <div className="md:w-2/5 relative h-64 md:h-auto">
                        <Image 
                          src={prop.imagem} 
                          alt={prop.titulo} 
                          fill
                          className="object-cover w-full h-full rounded-lg" 
                        />
                        <div className={`absolute top-3 left-3 text-xs font-medium py-1 px-2 rounded ${prop.tipo === 'Venda' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {prop.tipo}
                        </div>
                      </div>

                      <CardContent className="p-5 md:w-3/5 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">{prop.titulo}</h3>
                          <p className="text-gray-900 font-bold text-xl mb-3">{prop.preco}</p>
                          
                          <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            <span>{prop.quartos} quartos</span>
                            <span>{prop.banheiros} banheiros</span>
                            <span>{prop.area}m²</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {prop.localizacao}
                          </div>
                        </div>

                        <Button className="text-sm bg-orange-500 hover:bg-orange-600 mt-auto">
                          Ver detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {propriedades.length > 3 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAllProperties(!showAllProperties)}
                      className="border-gray-300"
                    >
                      {showAllProperties ? 'Ver menos' : `Ver todos os ${propriedades.length} imóveis`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {displayedReviews.map((avaliacao) => (
                  <Card key={avaliacao.id} className="p-6 border-gray-100">
                    <div className="flex items-start gap-4">
                      <Image
                        src={avaliacao.clienteFoto}
                        alt={avaliacao.cliente}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{avaliacao.cliente}</h4>
                            <p className="text-sm text-gray-500">{avaliacao.data}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(avaliacao.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-gray-700">{avaliacao.comentario}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {avaliacoes.length > 2 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="border-gray-300"
                    >
                      {showAllReviews ? 'Ver menos avaliações' : `Ver todas as ${avaliacoes.length} avaliações`}
                    </Button>
                  </div>
                )}
                
                <Card className="p-6 border-gray-100 mt-8">
                  <h3 className="font-medium text-gray-900 mb-4">Deixe sua avaliação</h3>
                  <p className="text-sm text-gray-600 mb-4">Partilhe a sua experiência com este agente.</p>
                  <Button className="bg-orange-500 hover:bg-orange-500">
                    Escrever avaliação
                  </Button>
                </Card>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.bio} Com um profundo conhecimento do mercado imobiliário de Luanda, 
                    oferece aos seus clientes um serviço personalizado e transparente, garantindo 
                    a melhor experiência na compra, venda ou arrendamento de imóveis.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Especialidades</h3>
                  <div className="flex flex-wrap gap-3">
                    {agent.especialidades.map((especialidade, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 py-2 px-4 rounded-full text-sm">
                        {especialidade}
                      </span>
                    ))}
                  </div>
                </div>
                
                {agent.premios && agent.premios.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Reconhecimentos</h3>
                    <div className="space-y-3">
                      {agent.premios.map((premio, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-700">{premio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Método de Trabalho</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Consulta Inicial</h4>
                        <p className="text-sm text-gray-600 mt-1">Análise das necessidades e expectativas do cliente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Home className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Seleção de Imóveis</h4>
                        <p className="text-sm text-gray-600 mt-1">Seleção personalizada de acordo com o perfil do cliente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Visitas</h4>
                        <p className="text-sm text-gray-600 mt-1">Agendamento de visitas aos imóveis selecionados</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Trophy className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Negociação</h4>
                        <p className="text-sm text-gray-600 mt-1">Acompanhamento em todo o processo de negociação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
