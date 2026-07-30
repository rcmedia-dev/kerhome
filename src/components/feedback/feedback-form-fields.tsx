'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { inputBase, type FormData, type CategoriaValue } from './categories'
import { type UserProfile } from '@/components/auth-context'

interface FeedbackFormFieldsProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  isSubmitting: boolean
  uploadingImage: boolean
  selected: CategoriaValue
  user: UserProfile | null
  imagePreview: string | null
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

const placeholders: Partial<Record<CategoriaValue, string>> = {
  bug: 'Descreve o problema: o que esperavas e o que aconteceu...',
  sugestao: 'Descreve a melhoria que sugeres e por que seria util...',
  duvida: 'Descreve a tua duvida para podermos ajudar...',
}

export function FeedbackFormFields({
  register,
  errors,
  isSubmitting,
  uploadingImage,
  selected,
  user,
  imagePreview,
  onImageSelect,
  onRemoveImage,
}: FeedbackFormFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="titulo" className="block text-xs font-medium text-gray-900 mb-1">
          Titulo <span className="text-red-500">*</span>
        </label>
        <input
          id="titulo"
          type="text"
          placeholder="Resumo curto do teu feedback"
          {...register('titulo')}
          className={`${inputBase} text-xs font-medium min-h-10`}
        />
        {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
      </div>

      {!user ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="user_name" className="block text-xs font-medium text-gray-900 mb-1">
              Nome <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input id="user_name" type="text" placeholder="O teu nome" {...register('user_name')} className={`${inputBase} text-xs font-medium min-h-10`} />
          </div>
          <div>
            <label htmlFor="user_email" className="block text-xs font-medium text-gray-900 mb-1">
              Email <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input id="user_email" type="email" placeholder="teu@email.com" {...register('user_email')} className={`${inputBase} text-xs font-medium min-h-10`} />
            {errors.user_email && <p className="text-xs text-red-500 mt-1">{errors.user_email.message}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-purple-50 rounded-xl border border-purple-100 p-2.5">
          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold text-[10px] shrink-0">
            {user.primeiro_nome?.[0]}{user.ultimo_nome?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user.primeiro_nome} {user.ultimo_nome}</p>
            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="mensagem" className="block text-xs font-medium text-gray-900 mb-1">
          Descricao <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mensagem"
          rows={3}
          placeholder={placeholders[selected] || 'Escreve o teu feedback aqui...'}
          {...register('mensagem')}
          className={`${inputBase} text-xs font-medium resize-none`}
        />
        {errors.mensagem && <p className="text-xs text-red-500 mt-1">{errors.mensagem.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-900 mb-1">
          Imagem <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-24 rounded-xl border border-gray-200 object-contain" />
            <button type="button" onClick={onRemoveImage} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors border-gray-300 hover:border-purple-400 p-3">
            <ImageIcon className="w-5 h-5 mb-1 text-gray-400" />
            <span className="text-[11px] font-medium text-gray-500">Clique para fazer upload</span>
            <span className="text-[10px] text-gray-400">PNG, JPG ou WEBP (max. 2MB)</span>
            <input type="file" accept="image/*" onChange={onImageSelect} className="hidden" />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploadingImage}
        className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 px-5 py-2.5 text-sm"
      >
        {uploadingImage ? (
          <><Loader2 className="w-4 h-4 animate-spin" />A enviar imagem...</>
        ) : isSubmitting ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />A enviar...</>
        ) : (
          <><Send className="w-4 h-4" />Enviar Feedback</>
        )}
      </button>
    </div>
  )
}
