import { PacoteDestaque } from "@/lib/types/defaults";
import { Medal, Lock } from "lucide-react";
import { ProgressStep } from "@/app/dashboard/destacar/components/progress-step";

interface ProgressSidebarProps {
  selectedProperties: string[];
  selectedPacote: PacoteDestaque | null;
  total: number;
  isBoosted?: boolean;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  selectedProperties,
  selectedPacote,
  total,
  isBoosted = false,
}) => (
  <div className="lg:col-span-1">
    <div
      className={`bg-white rounded-2xl shadow-xl p-6 sticky top-6 transition ${
        isBoosted ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Medal className="w-5 h-5 text-purple-600" />
        {isBoosted ? "Impulsionamento Ativo" : "Seu Progresso"}
      </h3>

      <div className="space-y-4">
        <ProgressStep
          completed={selectedProperties.length > 0}
          label="Imóveis Selecionados"
          count={selectedProperties.length}
        />
        <ProgressStep completed={!!selectedPacote} label="Pacote Escolhido" />
        <ProgressStep
          completed={selectedProperties.length > 0 && !!selectedPacote}
          label="Pronto para Finalizar"
        />
      </div>

      {(selectedPacote || selectedProperties.length > 0) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl border border-purple-200">
          {isBoosted ? (
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <Lock className="w-4 h-4" />
              Impulsionamento ativo
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">Resumo Rápido:</div>
              {selectedPacote && (
                <div className="flex justify-between text-sm mb-1">
                  <span>Pacote {selectedPacote.nome}:</span>
                  <span className="font-semibold">
                    {selectedPacote.preco.toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              )}
              {selectedProperties.length > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span>Imóveis:</span>
                  <span className="font-semibold">
                    {selectedProperties.length}x
                  </span>
                </div>
              )}
              {selectedPacote && selectedProperties.length > 0 && (
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-orange-500">
                    {total.toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  </div>
);

export default ProgressSidebar;
