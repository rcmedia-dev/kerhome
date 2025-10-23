'use client';

import { ProgressStepProps } from '@/lib/types/defaults';
import { Check } from 'lucide-react';

export const ProgressStep: React.FC<ProgressStepProps> = ({ 
  completed, 
  label, 
  count 
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
    }`}>
      <Check className="w-4 h-4" />
    </div>
    <span className={`text-sm ${completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
      {label} {count !== undefined && `(${count})`}
    </span>
  </div>
);