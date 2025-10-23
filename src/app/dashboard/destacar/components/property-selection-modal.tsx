'use client';

import React, { useState } from 'react';
import { X, Search, Home, Check } from 'lucide-react';
import Image from 'next/image';
import { PropertySelectionModalProps } from '@/lib/types/defaults';
import { TPropertyResponseSchema } from '@/lib/types/property';

export const PropertySelectionModal: React.FC<PropertySelectionModalProps> = ({
  isOpen,
  onClose,
  properties,
  selectedProperties,
  onToggleProperty,
  onAddSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Selecionar Imóveis</h2>
            <p className="text-sm text-gray-600">Escolha os imóveis que deseja destacar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Imóveis */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredProperties.map((property) => (
              <PropertyModalCard
                key={property.id}
                property={property}
                isSelected={selectedProperties.includes(property.id)}
                onToggle={() => onToggleProperty(property.id)}
              />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum imóvel encontrado</p>
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProperties.length} imóvel(s) selecionado(s)
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAddSelected}
                disabled={selectedProperties.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Adicionar ({selectedProperties.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyModalCard: React.FC<{
  property: TPropertyResponseSchema;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ property, isSelected, onToggle }) => (
  <div
    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300 bg-white'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-start gap-3">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={property.image ?? '/house.jpg'}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {property.title}
        </h4>
        <p className="text-orange-500 font-bold text-sm mb-1">
          {property.price?.toLocaleString('pt-AO')} Kz
        </p>
        <p className="text-gray-600 text-xs line-clamp-2">
          {property.description}
        </p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        isSelected
          ? 'bg-purple-600 border-purple-600'
          : 'border-gray-300'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  </div>
);