import { TPropertyResponseSchema } from "@/lib/types/property"
import { Home, Plus } from "lucide-react"
import { CompactPropertyCard } from "./compact-property-card"
import EmptyState from "./empty-state"


interface ImoveisTabProps {
  specificProperty: TPropertyResponseSchema | null
  properties: TPropertyResponseSchema[]
  selectedProperties: string[]
  onToggleProperty: (id: string) => void
  onOpenModal: () => void
  onClearAll: () => void
}

const ImoveisTab: React.FC<ImoveisTabProps> = ({
  specificProperty,
  properties,
  selectedProperties,
  onToggleProperty,
  onOpenModal,
  onClearAll
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {specificProperty ? 'Imóvel Selecionado' : 'Seus Imóveis Selecionados'}
          </h2>
        </div>
        <span className="text-sm text-gray-600">
          {selectedProperties.length} selecionado(s)
        </span>
      </div>

      {selectedProperties.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {properties
              .filter(property => selectedProperties.includes(property.id))
              .map(property => (
                <CompactPropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperties.includes(property.id)}
                  onToggle={() => onToggleProperty(property.id)}
                />
              ))}
          </div>

          {!specificProperty && (
            <div className="flex gap-3">
              <button
                onClick={onOpenModal}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-600 hover:border-purple-500 hover:text-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar Mais Imóveis
              </button>

              {selectedProperties.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Limpar Todos
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState specificProperty={specificProperty} onOpenModal={onOpenModal} />
      )}
    </div>
  )
}

export default ImoveisTab
