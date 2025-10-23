import { TPropertyResponseSchema } from '@/lib/types/property';

export interface PacoteDestaque {
  id: string;
  nome: string;
  dias: number;
  preco: number;
  popular?: boolean;
  corDestaque: 'purple' | 'orange';
  icone: React.ReactNode;
  beneficios: string[];
}

export type TabType = 'imoveis' | 'pacotes' | 'resumo';

export interface PropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: TPropertyResponseSchema[];
  selectedProperties: string[];
  onToggleProperty: (id: string) => void;
  onAddSelected: () => void;
}

export interface CompactPropertyCardProps {
  property: TPropertyResponseSchema;
  isSelected: boolean;
  onToggle: () => void;
}

export interface CompactPacoteCardProps {
  pacote: PacoteDestaque;
  isSelected: boolean;
  onSelect: () => void;
}

export interface ProgressStepProps {
  completed: boolean;
  label: string;
  count?: number;
}