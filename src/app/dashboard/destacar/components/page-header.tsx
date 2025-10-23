import { TPropertyResponseSchema } from "@/lib/types/property"
import { Sparkles } from "lucide-react"

interface PageHeaderProps {
  specificProperty: TPropertyResponseSchema | null
}

const PageHeader: React.FC<PageHeaderProps> = ({ specificProperty }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-lg mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {specificProperty ? 'DESTAQUE ESTE IMÓVEL' : 'DESTAQUE SEUS IMÓVEIS'}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {specificProperty ? (
          <>
            Destacar{' '}
            <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              {specificProperty.title}
            </span>
          </>
        ) : (
          <>
            Escolha seus{' '}
            <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Imóveis
            </span>{' '}
            e{' '}
            <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Pacote
            </span>
          </>
        )}
      </h1>

      {specificProperty && (
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecione um pacote de destaque para este imóvel e aumente sua visibilidade
        </p>
      )}
    </div>
  )
}

export default PageHeader