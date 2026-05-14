'use client'

import React from 'react';
import { Mail } from 'lucide-react';

interface MessagesSectionProps {
  darkMode: boolean;
}

export const MessagesSection = ({ darkMode }: MessagesSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Centro de Mensagens</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Mail className="w-4 h-4 mr-2" />
          Nova Mensagem
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Caixa de Entrada</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`p-3 rounded-lg border cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>João Silva</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dúvida sobre imóvel...</p>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`border-b pb-4 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversa com João Silva</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última mensagem há 2 horas</p>
          </div>
          
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Olá! Tenho interesse no apartamento T3 em Luanda Sul. Podem agendar uma visita?</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>14:30</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="max-w-xs p-3 rounded-lg bg-purple-600 text-white">
                <p className="text-sm">Claro! Vamos verificar a disponibilidade do agente responsável e entramos em contacto consigo.</p>
                <p className="text-xs mt-1 text-purple-200">14:35</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
