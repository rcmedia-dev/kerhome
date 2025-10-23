'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { CompactPropertyCardProps } from '@/lib/types/defaults';

export const CompactPropertyCard: React.FC<CompactPropertyCardProps> = ({ 
  property, 
  isSelected, 
  onToggle 
}) => (
  <div
    className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 ${
      isSelected
        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-white shadow-lg'
        : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={property.image ?? '/house.jpg'} alt={property.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{property.title}</h4>
        <p className="text-orange-500 font-bold text-sm">{property.price?.toLocaleString('pt-AO')} Kz</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  </div>
);