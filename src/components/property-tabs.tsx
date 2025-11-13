'use client'

import { TPropertyResponseSchema } from "@/lib/types/property";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    PANOLENS: any;
    THREE: any;
  }
}
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";

// ===== COMPONENTE PROPERTY TABS =====
export function PropertyTabs({ property }: { property: TPropertyResponseSchema }) {
  const [isPanolensLoaded, setIsPanolensLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const scriptsLoadedRef = useRef(false);

  // Verificar se PanoLens está carregado
  useEffect(() => {
    if (activeTab === "tour" && typeof window !== 'undefined' && !scriptsLoadedRef.current) {
      
      const loadScripts = async () => {
        try {
          // Verificar se já estão carregados
          if (window.THREE && window.PANOLENS) {
            setIsPanolensLoaded(true);
            scriptsLoadedRef.current = true;
            return;
          }

          // Carregar Three.js versão compatível (r105)
          if (!window.THREE) {
            await new Promise((resolve, reject) => {
              const threeScript = document.createElement('script');
              threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r105/three.min.js';
              threeScript.onload = () => {
                console.log('Three.js r105 carregado');
                resolve(true);
              };
              threeScript.onerror = () => {
                console.error('Falha ao carregar Three.js');
                reject(new Error('Falha ao carregar Three.js'));
              };
              document.head.appendChild(threeScript);
            });
          }

          // Carregar PanoLens
          if (!window.PANOLENS) {
            await new Promise((resolve, reject) => {
              const panolensScript = document.createElement('script');
              panolensScript.src = 'https://cdn.jsdelivr.net/npm/panolens@0.11.0/build/panolens.min.js';
              panolensScript.onload = () => {
                console.log('PanoLens carregado');
                resolve(true);
              };
              panolensScript.onerror = () => {
                console.error('Falha ao carregar PanoLens');
                reject(new Error('Falha ao carregar PanoLens'));
              };
              document.head.appendChild(panolensScript);
            });
          }

          // Dar tempo para inicialização
          setTimeout(() => {
            setIsPanolensLoaded(true);
            scriptsLoadedRef.current = true;
          }, 500);

        } catch (error) {
          console.error('Erro ao carregar scripts:', error);
        }
      };

      loadScripts();
    }
  }, [activeTab]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <Tabs 
        defaultValue="visao-geral" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="visao-geral"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Vídeo
          </TabsTrigger>
          <TabsTrigger
            value="tour"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Passeio Virtual
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Informações Básicas</h4>
              <ul className="space-y-2 text-gray-600">
                {property.tipo && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Tipo</span>
                    <span className="font-medium">{property.tipo}</span>
                  </li>
                )}
                {typeof property.bedrooms !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Quartos</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </li>
                )}
                {typeof property.bathrooms !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Banheiros</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </li>
                )}
                {typeof property.garagens !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Garagens</span>
                    <span className="font-medium">{property.garagens}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h4>
              <ul className="space-y-2 text-gray-600">
                {property.anoconstrucao && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Ano de Construção</span>
                    <span className="font-medium">{property.anoconstrucao}</span>
                  </li>
                )}
                {property.propertyid && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>ID do Imóvel</span>
                    <span className="font-medium">{property.propertyid}</span>
                  </li>
                )}
                {property.status && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Status</span>
                    <span className="font-medium capitalize px-3 py-1 rounded-lg text-white bg-gradient-to-r from-purple-700 to-orange-500 shadow-md">
                      {property.status}
                    </span>
                  </li>
                )}
                {property.price && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Preço</span>
                    <span className="font-medium text-orange-500">
                      {property.price.toLocaleString(
                        property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}{" "}
                      {property.unidade_preco === "kwanza"
                        ? "KZ"
                        : property.unidade_preco === "dolar"
                        ? "USD"
                        : property.unidade_preco}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {property.caracteristicas && Array.isArray(property.caracteristicas) && property.caracteristicas.length > 0 && (
            <div className="pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Características</h4>
              <div className="flex flex-wrap gap-2">
                {property.caracteristicas
                  .filter((c): c is string => typeof c === 'string')
                  .map((c, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100"
                    >
                      {c}
                    </span>
                  ))}
              </div>
            </div>
          )}
          
          {property.detalhesadicionais && Array.isArray(property.detalhesadicionais) && property.detalhesadicionais.length > 0 && (
            <div className="pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Mais Detalhes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.detalhesadicionais
                  .filter(
                    (d): d is { titulo: string; valor: string } =>
                      typeof d === 'object' &&
                      d !== null &&
                      'titulo' in d &&
                      'valor' in d
                  )
                  .map((d, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">{d.titulo}</span>
                      <span className="text-gray-800">{d.valor}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="video">
          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {/* {property.video_url ? (
              <iframe
                src={property.video_url}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title={`Vídeo do imóvel ${property.title}`}
              />
            ) : ( */}
              <p className="text-gray-500">Este imóvel não tem vídeo disponível.</p>
            {/* )} */}
          </div>
        </TabsContent>
        
        <TabsContent value="tour">
          <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
            {isPanolensLoaded ? (
              <SimpleVirtualTour property={property} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando passeio virtual...</p>
                <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== COMPONENTE SIMPLIFICADO DE TOUR VIRTUAL =====
function SimpleVirtualTour({ property }: { property: TPropertyResponseSchema }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [viewerReady, setViewerReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  
  // Cenas do passeio virtual
  const virtualTourScenes = [
    {
      id: 'living-room',
      name: 'Sala de Estar',
      image: '/360/360-images.jpg',
      description: 'Ampla sala de estar com iluminação natural'
    },
    {
      id: 'kitchen', 
      name: 'Cozinha',
      image: property.gallery?.[1] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      description: 'Cozinha moderna e equipada'
    },
    {
      id: 'bedroom',
      name: 'Quarto Principal', 
      image: property.gallery?.[2] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
      description: 'Suíte master com closet'
    }
  ];

  // Função para entrar/sair do fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Escutar mudanças no fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle auto-rotação
  const toggleAutoRotate = () => {
    if (viewerInstanceRef.current) {
      setAutoRotate(prev => !prev);
      // O PanoLens tem autoRotate habilitado na inicialização
      // Em uma implementação mais avançada, você poderia controlar isso
    }
  };

  // Inicializar PanoLens de forma simplificada
  useEffect(() => {
    if (!viewerRef.current || !window.PANOLENS) {
      console.log('Aguardando PanoLens...');
      return;
    }

    const initializeViewer = () => {
      try {
        const PANOLENS = window.PANOLENS;
        
        // Limpar instância anterior
        if (viewerInstanceRef.current) {
          try {
            viewerInstanceRef.current.dispose();
          } catch (e) {
            console.log('Erro ao limpar viewer anterior:', e);
          }
        }

        // Criar viewer com configuração mínima
        const viewer = new PANOLENS.Viewer({
          container: viewerRef.current,
          autoRotate: autoRotate,
          autoRotateSpeed: 0.3,
          controlBar: false,
        });

        // Adicionar panorama atual
        const panorama = new PANOLENS.ImagePanorama(virtualTourScenes[currentScene].image);
        
        panorama.addEventListener('enter', () => {
          console.log(`Entrou na cena: ${virtualTourScenes[currentScene].name}`);
        });

        panorama.addEventListener('load', () => {
          setViewerReady(true);
        });

        panorama.addEventListener('error', (error: any) => {
          console.error('Erro ao carregar panorama:', error);
          setViewerReady(true);
        });

        viewer.add(panorama);
        viewerInstanceRef.current = viewer;

        console.log('PanoLens inicializado com sucesso');

      } catch (error) {
        console.error('Erro crítico ao inicializar PanoLens:', error);
        setViewerReady(true);
      }
    };

    const timer = setTimeout(() => {
      initializeViewer();
      setTimeout(() => setViewerReady(true), 3000);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.dispose();
        } catch (e) {
          console.log('Erro na limpeza:', e);
        }
      }
    };
  }, [currentScene, autoRotate]);

  // Efeito para atualizar a cena quando currentScene mudar
  useEffect(() => {
    if (!viewerInstanceRef.current || !window.PANOLENS) return;

    const updateScene = () => {
      try {
        const PANOLENS = window.PANOLENS;
        const viewer = viewerInstanceRef.current;
        
        // Limpar cena atual
        viewer.dispose();
        
        // Criar novo panorama
        const panorama = new PANOLENS.ImagePanorama(virtualTourScenes[currentScene].image);
        
        panorama.addEventListener('enter', () => {
          console.log(`Entrou na cena: ${virtualTourScenes[currentScene].name}`);
        });

        panorama.addEventListener('load', () => {
          setViewerReady(true);
        });

        viewer.add(panorama);
        
      } catch (error) {
        console.error('Erro ao atualizar cena:', error);
      }
    };

    updateScene();
  }, [currentScene]);

  const nextScene = () => {
    setViewerReady(false);
    setCurrentScene((prev) => (prev + 1) % virtualTourScenes.length);
  };

  const prevScene = () => {
    setViewerReady(false);
    setCurrentScene((prev) => (prev - 1 + virtualTourScenes.length) % virtualTourScenes.length);
  };

  const goToScene = (index: number) => {
    if (index !== currentScene) {
      setViewerReady(false);
      setCurrentScene(index);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Header informativo */}
      <div className="absolute top-4 left-4 z-20 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="font-semibold">{virtualTourScenes[currentScene].name}</div>
        <div className="text-sm text-gray-300">{virtualTourScenes[currentScene].description}</div>
      </div>
      
      {/* Botões de navegação entre cenas */}
      <button
        onClick={prevScene}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Cômodo anterior"
        disabled={!viewerReady}
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextScene}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Próximo cômodo"
        disabled={!viewerReady}
      >
        <ChevronRight size={20} />
      </button>

      {/* Controles na parte superior direita */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {/* Botão Auto Rotate */}
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
            autoRotate 
              ? 'bg-orange-500 text-white' 
              : 'bg-black/70 text-white hover:bg-black/90'
          }`}
          title={autoRotate ? "Desativar rotação automática" : "Ativar rotação automática"}
        >
          <RotateCcw size={18} />
        </button>

        {/* Botão Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 transition-all"
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Indicador de cenas */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {virtualTourScenes.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => goToScene(index)}
            disabled={!viewerReady}
            className={`flex flex-col items-center transition-all ${
              index === currentScene ? 'scale-110' : 'scale-100 opacity-70'
            } ${!viewerReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${
              index === currentScene ? 'bg-orange-500' : 'bg-white'
            }`} />
            <span className={`text-xs mt-1 transition-all ${
              index === currentScene ? 'text-orange-500 font-semibold' : 'text-white'
            }`}>
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Container do PanoLens */}
      <div 
        ref={viewerRef} 
        className="w-full h-full"
      />

      {/* Overlay de carregamento durante transição */}
      {!viewerReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <div className="text-sm">Carregando cena...</div>
          </div>
        </div>
      )}

      {/* Instruções de uso */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/70 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm max-w-xs">
        <div className="font-semibold mb-1">Como navegar:</div>
        <div className="flex items-center gap-1 mb-1">
          <ChevronLeft size={12} />
          <ChevronRight size={12} />
          <span>Mudar cômodos</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <RotateCcw size={12} />
          <span>Rotacionar</span>
        </div>
        <div className="flex items-center gap-1">
          <Maximize2 size={12} />
          <span>Tela cheia</span>
        </div>
      </div>

      {/* Indicador de cena atual */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
        {currentScene + 1} / {virtualTourScenes.length}
      </div>
    </div>
  );
}