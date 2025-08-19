'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileText, Video, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Property } from '../../actions/get-properties';

export default function PropertyDetailClient({ property }: { property: Property }) {
  const router = useRouter();
  const [mainImage, setMainImage] = useState<string>(property.gallery?.[0] || '');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const allImages = property.gallery || [];

  const handleThumbnailClick = (img: string, index: number) => {
    setMainImage(img);
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    } else {
      newIndex = (currentImageIndex + 1) % allImages.length;
    }
    setMainImage(allImages[newIndex]);
    setCurrentImageIndex(newIndex);
  };

  const handleApprove = () => {
    // Lógica para aprovar o imóvel
    router.push('/properties');
  };

  const handleReject = () => {
    // Lógica para rejeitar o imóvel
    router.push('/properties');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botão de voltar */}
      <button 
        onClick={() => router.back()}
        className="flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Voltar para a lista
      </button>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
          <div className="flex items-center mt-2">
            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-300">{property.endereco}</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
          property.aprovement_status === 'aprovado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
          property.aprovement_status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
        }`}>
          {property.aprovement_status === 'aprovado' ? 'Aprovado' : property.aprovement_status === 'pending' ? 'Pendente' : 'Rejeitado'}
        </span>
      </div>

      {/* Galeria de Imagens */}
      <div className="mb-12">
        <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video mb-4">
          {mainImage && (
            <Image 
              src={mainImage} 
              alt={`Imagem ${currentImageIndex + 1} de ${property.title}`}
              fill
              className="w-full h-full object-cover"
              priority
            />
          )}
          
          {allImages.length > 1 && (
            <>
              <button 
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(img, index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-blue-500 scale-105' 
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img} 
                  alt={`Thumbnail ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seção esquerda - Detalhes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sobre o imóvel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sobre o imóvel</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{property.description || 'Descrição não disponível'}</p>
            
            {property.caracteristicas && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Características</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.caracteristicas.map((feature, index) => (
                    <div key={index} className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Vídeo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-900 dark:text-white mb-4">
              <Video className="w-6 h-6 mr-2 text-blue-500" />
              Vídeo do Imóvel
            </h2>
            {property.video_url ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={property.video_url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Property video"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-6">
                <Video className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400 font-medium">Vídeo não disponível</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Este imóvel não possui vídeo cadastrado
                </p>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 mr-2 text-blue-500" />
              Documentos da Propriedade
            </h2>
            {property.documents && property.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.documents.map((doc, index) => (
                  <a 
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <span className="block font-medium text-gray-900 dark:text-white">Documento {index + 1}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">PDF • {Math.round(Math.random() * 2) + 1}MB</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400 font-medium">Documentos não disponíveis</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Este imóvel não possui documentos cadastrados
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Seção direita - Informações e ações */}
        <div className="space-y-6">
          {/* Card de preço */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Valor do Imóvel</h2>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{property.price}</span>
              <span className="text-xl text-gray-500 dark:text-gray-400 ml-1 mb-1">Kz</span>
            </div>
          </div>

          {/* Card do agente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Agente Responsável
            </h2>

            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {property?.owner_id ? (
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {property.owner_id.primeiro_nome?.charAt(0)}
                    {property.owner_id.ultimo_nome?.charAt(0)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">?</span>
                )}

                {/* Status */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>

              {/* Informações do agente */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {property?.owner_id
                    ? `${property.owner_id.primeiro_nome} ${property.owner_id.ultimo_nome}`
                    : 'Agente não especificado'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Agente Certificado</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          {property.status && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aprovar Imóvel</h2>
              <p className="text-gray-600 dark:text-gray-300">Analise todos os detalhes antes de tomar uma decisão.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprovar
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Rejeitar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}