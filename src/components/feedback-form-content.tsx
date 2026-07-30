'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-context'
import { categorias, colorIconBg, formSchema, type FormData, type CategoriaValue } from '@/components/feedback/categories'
import { CategoryPicker } from '@/components/feedback/category-picker'
import { FeedbackFormFields } from '@/components/feedback/feedback-form-fields'
import { SuccessStep } from '@/components/feedback/success-step'

interface FeedbackFormContentProps {
  onClose?: () => void
  showBackToSite?: boolean
  variant?: 'page' | 'modal'
}

export function FeedbackFormContent({ onClose, showBackToSite, variant = 'page' }: FeedbackFormContentProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'pick' | 'form' | 'done'>('pick')
  const [selected, setSelected] = useState<CategoriaValue | null>(null)
  const [pageUrl, setPageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { titulo: '', mensagem: '', user_name: '', user_email: '' },
  })

  useEffect(() => { setPageUrl(window.location.href) }, [])
  useEffect(() => {
    if (user) {
      setValue('user_name', `${user.primeiro_nome} ${user.ultimo_nome}`)
      setValue('user_email', user.email || '')
    }
  }, [user, setValue])

  const goBack = useCallback(() => {
    setStep('pick')
    setSelected(null)
    setImageFile(null)
    setImagePreview(null)
    reset()
  }, [reset])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande. Maximo 2MB.'); return }
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens sao permitidas.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const removeImage = useCallback(() => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }, [imagePreview])

  const selectedCat = selected ? categorias.find((c) => c.value === selected) : null

  const onSubmit = useCallback(async (data: FormData) => {
    if (!selected) return
    try {
      let image_url: string | null = null
      if (imageFile) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/feedback/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) { const err = await uploadRes.json(); throw new Error(err.error || 'Erro ao enviar imagem') }
        const { publicUrl } = await uploadRes.json()
        image_url = publicUrl
      }
      const supabase = createClient()
      const { error } = await supabase.from('feedbacks').insert({
        user_id: user?.id || null,
        user_name: data.user_name || null,
        user_email: data.user_email || null,
        categoria: selected,
        titulo: data.titulo,
        mensagem: data.mensagem,
        url: pageUrl || null,
        user_agent: navigator.userAgent,
        image_url,
      })
      if (error) throw error
      toast.success('Feedback enviado com sucesso!')
      setStep('done')
      removeImage()
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar feedback.')
    } finally {
      setUploadingImage(false)
    }
  }, [selected, imageFile, user, pageUrl, removeImage, reset])

  const isModal = variant === 'modal'

  return (
    <AnimatePresence mode="wait">
      {step === 'pick' && (
        <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <CategoryPicker isModal={isModal} onSelect={(v) => { setSelected(v); setStep('form') }} />
        </motion.div>
      )}

      {step === 'form' && selectedCat && (
        <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
          <div className={`flex items-center gap-3 ${isModal ? 'mb-3' : 'mb-6'}`}>
            <button type="button" onClick={goBack} className={`flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors ${isModal ? 'w-7 h-7 rounded-lg' : 'w-10 h-10 rounded-xl bg-gray-100'}`}>
              <ArrowLeft className={isModal ? 'w-4 h-4' : 'w-5 h-5'} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center ${colorIconBg[selectedCat.color]} ${isModal ? 'w-7 h-7 rounded-lg' : 'w-10 h-10 rounded-xl'}`}>
                <selectedCat.icon className={isModal ? 'w-4 h-4' : 'w-5 h-5'} />
              </div>
              <div>
                <h2 className={`font-bold text-gray-900 ${isModal ? 'text-xs' : 'text-xl'}`}>{selectedCat.label}</h2>
                {!isModal && <p className="text-sm text-gray-500">{selectedCat.desc}</p>}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FeedbackFormFields
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              uploadingImage={uploadingImage}
              selected={selected!}
              user={user}
              imagePreview={imagePreview}
              onImageSelect={handleImageSelect}
              onRemoveImage={removeImage}
            />
          </form>
        </motion.div>
      )}

      {step === 'done' && (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
          <SuccessStep isModal={isModal} onClose={onClose} onReset={() => { setStep('pick'); setSelected(null) }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
