'use client'

import { MessageSquare, CheckCircle2 } from 'lucide-react'

interface SuccessStepProps {
  isModal: boolean
  onClose?: () => void
  onReset: () => void
}

export function SuccessStep({ isModal, onClose, onReset }: SuccessStepProps) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-7 h-7" style={{ color: '#16a34a' }} />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Obrigado pelo feedback!</h2>
      <p className="text-sm text-gray-500 mb-6">
        A tua contribuicao ajuda-nos a construir um Kercasa melhor para todos.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={onReset}
          className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors px-4 py-2.5 text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Enviar outro feedback
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors px-4 py-2.5 text-sm"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  )
}
