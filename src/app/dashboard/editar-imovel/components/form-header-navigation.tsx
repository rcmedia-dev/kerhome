'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, MapPin, Home, DollarSign, Image, FileText, Settings } from 'lucide-react';

interface FormHeaderProps {
  isDirty: boolean;
  isSubmitting: boolean;
  handleSubmit: () => void;
}

export const FormHeader = ({ isDirty, isSubmitting, handleSubmit }: FormHeaderProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl px-4 py-4 mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Editar Propriedade</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isDirty || isSubmitting}
          className={`flex items-center px-4 py-2 font-medium rounded-lg ${
            isDirty 
              ? 'bg-purple-700 text-white hover:bg-purple-800'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </header>
  );
};

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  const tabs = [
    { id: 'info', label: 'Informações', icon: Home },
    { id: 'local', label: 'Localização', icon: MapPin },
    { id: 'preco', label: 'Preço', icon: DollarSign },
    { id: 'detalhes', label: 'Detalhes', icon: Settings },
    { id: 'midia', label: 'Mídia', icon: Image },
    { id: 'notas', label: 'Notas', icon: FileText }
  ];

  return (
    <nav className="space-y-2 lg:w-64">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
