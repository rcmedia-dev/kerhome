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
    <section className="flex justify-center items-center py-5 bg-purple-700 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row bg-white w-full max-w-7xl px-4 py-4 lg:px-6 lg:py-3 rounded-2xl gap-4 items-center"
      >
        <input
          type="text"
          placeholder="O que deseja procurar?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full lg:w-[50%] border-none focus:outline-none text-sm px-3"
        />

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[50%]">
          <Select onValueChange={setEstado}>
            <SelectTrigger className="w-full border border-gray-300 rounded-md focus:outline-none">
              <SelectValue placeholder="Estado do Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="para alugar">Para Alugar</SelectItem>
              <SelectItem value="para comprar">Para Comprar</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setCidade}>
            <SelectTrigger className="w-full border border-gray-300 rounded-md focus:outline-none">
              <SelectValue placeholder="Cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Luanda">Luanda</SelectItem>
              <SelectItem value="Huambo">Huambo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto cursor-pointer bg-orange-500 px-4 py-3 rounded-lg text-white font-semibold hover:bg-orange-600 transition"
        >
          Procurar
        </button>
      </form>
    </section>
  )
}
