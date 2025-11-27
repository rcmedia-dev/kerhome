import { PacoteDestaque } from "@/lib/types/defaults"
import { Rocket } from "lucide-react"
import { CompactPacoteCard } from "@/app/dashboard/destacar/components/compact-pacote-card"

interface PacotesTabProps {
  pacotes: PacoteDestaque[]
  selectedPacote: PacoteDestaque | null
  onSelectPacote: (pacote: PacoteDestaque) => void
}

const PacotesTab: React.FC<PacotesTabProps> = ({
  pacotes,
  selectedPacote,
  onSelectPacote
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Pacotes de Destaque</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pacotes.map((pacote) => (
          <CompactPacoteCard
            key={pacote.id}
            pacote={pacote}
            isSelected={selectedPacote?.id === pacote.id}
            onSelect={() => onSelectPacote(pacote)}
          />
        ))}
      </div>
    </div>
  )
}

export default PacotesTab