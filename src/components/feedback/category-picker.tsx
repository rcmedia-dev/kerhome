'use client'

import { MessageSquare, ChevronRight } from 'lucide-react'
import { categorias, colorIconBg, type CategoriaValue } from './categories'

interface CategoryPickerProps {
  isModal: boolean
  onSelect: (value: CategoriaValue) => void
}

export function CategoryPicker({ isModal, onSelect }: CategoryPickerProps) {
  return (
    <div>
      {isModal ? (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">O que descreve o teu feedback?</p>
          <p className="text-xs text-gray-500 mt-0.5">Escolhe uma categoria para comecar</p>
        </div>
      ) : (
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Central de Feedback</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Como podemos ajudar? Escolhe a opcao que melhor descreve o teu feedback.
          </p>
        </div>
      )}

      <div className={`grid ${isModal ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
        {categorias.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelect(cat.value)}
              className={`group bg-white border text-left transition-all duration-200 cursor-pointer ${
                isModal
                  ? 'border-gray-200 rounded-xl px-3 py-4 hover:shadow-sm hover:border-gray-300'
                  : 'border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300'
              }`}
            >
              {isModal ? (
                <div className="min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`flex items-center justify-center rounded-lg shrink-0 ${colorIconBg[cat.color]} w-5 h-5`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-gray-800 truncate">{cat.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">{cat.desc}</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorIconBg[cat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                    {cat.label}
                    <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
