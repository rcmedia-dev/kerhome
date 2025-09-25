'use client'

import { getAgents } from "@/lib/actions/supabase-actions/get-agents"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

export default function CorretoresEmDestaque() {
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => await getAgents(),
  })

  if (isLoading) {
    return (
      <div className="bg-white border shadow-md rounded-xl p-5">
        <p className="text-gray-500 text-sm">Carregando corretores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border shadow-md rounded-xl p-5">
        <p className="text-red-500 text-sm">Erro ao carregar corretores.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border shadow-md rounded-xl p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Corretores em Destaque
      </h3>
      <div className="space-y-4">
        {agents?.data?.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
              <Image
                src={agent.avatar_url}
                alt={agent.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {agent.primeiro_nome} {agent.ultimo_nome}
              </p>

              <p className="text-xs text-gray-500">
                Agente Verificado
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
