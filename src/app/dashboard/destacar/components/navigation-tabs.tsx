'use client';

import { TabType } from '@/lib/types/defaults';
import { Home, Rocket, BadgeCheck } from 'lucide-react';

const tabs = [
  { id: 'imoveis' as TabType, label: 'Imóveis', icon: Home },
  { id: 'pacotes' as TabType, label: 'Pacotes', icon: Rocket },
  { id: 'resumo' as TabType, label: 'Resumo', icon: BadgeCheck },
];

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedPropertiesCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  selectedPropertiesCount
}) => (
  <div className="bg-white rounded-2xl shadow-xl mb-6">
    <div className="grid grid-cols-3 gap-1 p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
              : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="font-semibold">{tab.label}</span>
          {tab.id === 'imoveis' && selectedPropertiesCount > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {selectedPropertiesCount}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);