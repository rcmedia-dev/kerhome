'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare } from 'lucide-react'
import { FeedbackFormContent } from './feedback-form-content'

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed md:bottom-24 bottom-32 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-160px)] z-[9999] bg-white rounded-card shadow-floating flex flex-col overflow-hidden border border-border"
        >
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Central de Feedback</h3>
                <span className="text-[10px] text-purple-200">Compartilhe a sua opiniao</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <FeedbackFormContent onClose={onClose} variant="modal" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
