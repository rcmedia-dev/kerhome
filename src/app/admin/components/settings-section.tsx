'use client'

import React from 'react';

interface SettingsSectionProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const SettingsSection = ({ darkMode, setDarkMode }: SettingsSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Configurações</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preferências Gerais</h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Idioma</label>
              <select className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Moeda</label>
              <select className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="aoa">Kwanza (Kz)</option>
                <option value="usd">Dólar ($)</option>
                <option value="eur">Euro (€)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modo Escuro</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notificações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Novos imóveis</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mensagens</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Denúncias</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Relatórios semanais</span>
              <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Permissões</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Ana Costa', role: 'Super Admin', email: 'ana@kerhome.com', status: 'active' },
              { name: 'Carlos Silva', role: 'Moderador', email: 'carlos@kerhome.com', status: 'active' },
              { name: 'Sofia Lima', role: 'Suporte', email: 'sofia@kerhome.com', status: 'inactive' }
            ].map((admin, index) => (
              <div key={index} className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{admin.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {admin.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{admin.email}</p>
                <p className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{admin.role}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
