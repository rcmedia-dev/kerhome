'use client';

import { CompactPacoteCardProps } from '@/lib/types/defaults';
import { Crown, Calendar, Check } from 'lucide-react';

export const CompactPacoteCard: React.FC<CompactPacoteCardProps> = ({ 
  pacote, 
  isSelected, 
  onSelect 
}) => (
  <div
    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
      isSelected
        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-105'
        : 'border-gray-200 hover:border-purple-300 hover:shadow-lg bg-white'
    } ${pacote.popular ? 'ring-2 ring-purple-300' : ''}`}
    onClick={onSelect}
  >
    {pacote.popular && (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" /> POPULAR
        </div>
      </div>
    )}

    <div className="text-center mb-4">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ${
        pacote.corDestaque === 'purple' 
          ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
          : 'bg-gradient-to-br from-orange-500 to-orange-600'
      }`}>
        {pacote.icone}
      </div>
      <h3 className="font-bold text-gray-900 text-lg">{pacote.nome}</h3>
      <div className="flex items-center justify-center gap-1 text-gray-600 text-sm mt-1">
        <Calendar className="w-4 h-4" /> <span>{pacote.dias} dias</span>
      </div>
    </div>

    <div className="text-center mb-4">
      <div className="text-2xl font-bold text-gray-900">{pacote.preco.toLocaleString('pt-AO')} Kz</div>
    </div>

    <div className="space-y-2 mb-4">
      {pacote.beneficios.slice(0, 3).map((beneficio, index) => (
        <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
            pacote.corDestaque === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
          }`}>
            <Check className={`w-2 h-2 ${pacote.corDestaque === 'purple' ? 'text-purple-700' : 'text-orange-500'}`} />
          </div>
          <span className="line-clamp-1">{beneficio}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
      isSelected
        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}>
      {isSelected ? 'Selecionado ✓' : 'Selecionar'}
    </button>
  </div>
);