import { z } from 'zod'
import { Bug, Lightbulb, Heart, Flag, HelpCircle, MessageSquare } from 'lucide-react'

export const categorias = [
  { value: 'bug', label: 'Reportar Bug', icon: Bug, desc: 'Algo nao esta a funcionar como esperado', color: 'red' },
  { value: 'sugestao', label: 'Melhoria', icon: Lightbulb, desc: 'Uma ideia para melhorar algo existente', color: 'amber' },
  { value: 'elogio', label: 'Elogio', icon: Heart, desc: 'Algo que esta a funcionar muito bem', color: 'pink' },
  { value: 'reportar_conteudo', label: 'Reportar Conteudo', icon: Flag, desc: 'Conteudo inadequado, spam ou falsificado', color: 'blue' },
  { value: 'duvida', label: 'Duvida', icon: HelpCircle, desc: 'Precisas de ajuda com algo', color: 'teal' },
  { value: 'outro', label: 'Outro', icon: MessageSquare, desc: 'Nao se enquadra nas opcoes acima', color: 'gray' },
] as const

export type CategoriaValue = typeof categorias[number]['value']

export const colorIconBg: Record<string, string> = {
  red: 'bg-red-100 text-red-500',
  amber: 'bg-amber-100 text-amber-500',
  pink: 'bg-pink-100 text-pink-500',
  blue: 'bg-blue-100 text-blue-500',
  teal: 'bg-teal-100 text-teal-500',
  gray: 'bg-gray-100 text-gray-500',
}

export const formSchema = z.object({
  titulo: z.string().min(3, 'Titulo deve ter pelo menos 3 caracteres').max(100, 'Titulo muito longo'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000, 'Mensagem muito longa'),
  user_name: z.string().optional(),
  user_email: z.string().email('Email invalido').optional().or(z.literal('')),
})

export type FormData = z.infer<typeof formSchema>

export const inputBase = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200'
