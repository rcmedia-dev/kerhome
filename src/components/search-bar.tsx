'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from './ui/select'

export default function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (estado) params.append('status', estado)
    if (cidade) params.append('cidade', cidade)

    router.push(`/results?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl gap-3 shadow-2xl"
      >
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="O que procura? Ex: T3 em Luanda"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-800 placeholder-gray-500 transition-all font-medium"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:w-auto">
          <div className="w-full sm:w-48">
            <Select onValueChange={setEstado}>
              <SelectTrigger className="w-full bg-white/90 border-0 rounded-xl py-6 font-medium text-gray-800 focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="Finalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="para alugar">Alugar</SelectItem>
                <SelectItem value="para comprar">Comprar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select onValueChange={setCidade}>
              <SelectTrigger className="w-full bg-white/90 border-0 rounded-xl py-6 font-medium text-gray-800 focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Luanda">Luanda</SelectItem>
                <SelectItem value="Huambo">Huambo</SelectItem>
                <SelectItem value="Benguela">Benguela</SelectItem>
                <SelectItem value="Lubango">Lubango</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2"
        >
          Buscar
        </button>
      </form>
    </div>
  )
}
