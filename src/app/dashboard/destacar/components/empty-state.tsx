import { TPropertyResponseSchema } from "@/lib/types/property"
import { Home, Plus } from "lucide-react"


interface EmptyStateProps {
  specificProperty: TPropertyResponseSchema | null
  onOpenModal: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ specificProperty, onOpenModal }) => {
  return (
    <div className="text-center py-12">
      <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {specificProperty ? 'Imóvel não encontrado' : 'Nenhum imóvel selecionado'}
      </h3>
      <p className="text-gray-500 mb-6">
        {specificProperty
          ? 'O imóvel solicitado não está disponível para destaque'
          : 'Adicione imóveis para começar a impulsionar'}
      </p>

      {!specificProperty && (
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" /> Selecionar Imóveis
        </button>
      )}
    </div>
  )
}

export default EmptyState
