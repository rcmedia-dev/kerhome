import { PacoteDestaque } from "@/lib/types/defaults"
import { BadgeCheck, Sparkles, Calendar, Shield, ArrowRight, X, MessageCircle, Copy, Building } from "lucide-react"
import { useState } from "react"

interface ResumoTabProps {
  selectedPacote: PacoteDestaque | null
  selectedProperties: string[]
  total: number
  processing: boolean
  onCheckout: () => void
}

const ResumoTab: React.FC<ResumoTabProps> = ({
  selectedPacote,
  selectedProperties,
  total,
  processing,
  onCheckout
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCheckoutClick = () => {
    setShowConfirmation(true)
  }

  const handleWhatsAppConfirmation = () => {
    if (!selectedPacote) return
    
    const phoneNumber = "955324708"
    const message = `Olá! Gostaria de confirmar o pagamento para o destaque dos imóveis:\n\n*Pacote:* ${selectedPacote.nome}\n*Duração:* ${selectedPacote.dias} dias\n*Imóveis selecionados:* ${selectedProperties.length}\n*Valor total:* ${total.toLocaleString('pt-AO')} Kz\n\nAnexo do comprovativo de pagamento.`
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    // Fecha o popup e prossegue com o fluxo normal
    setShowConfirmation(false)
    onCheckout()
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Informações bancárias
  const bankInfo = {
    bankName: "STANDARD BANK",
    accountHolder: "Rogério Daniel Comércio SU Lda",
    iban: "0060.0140.0100.5214.0931.9",
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BadgeCheck className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Resumo do Pedido</h2>
        </div>

        {/* Estado vazio */}
        {!selectedPacote || selectedProperties.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Complete as etapas anteriores</p>
            <p className="text-sm text-gray-400">
              Selecione imóveis e escolha um pacote para continuar
            </p>
          </div>
        ) : (
          /* Conteúdo principal */
          <div className="space-y-6">
            {/* Pacote selecionado */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPacote.nome}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" /> {selectedPacote.dias} dias de destaque
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-700 text-lg">
                    {selectedPacote.preco.toLocaleString('pt-AO')} Kz
                  </div>
                  <div className="text-sm text-gray-600">por imóvel</div>
                </div>
              </div>
            </div>

            {/* Imóveis selecionados */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-900">Imóveis Selecionados</span>
                <span className="bg-purple-600 text-white text-sm rounded-full px-3 py-1">
                  {selectedProperties.length}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedProperties.length === 1
                  ? '1 imóvel será destacado'
                  : `${selectedProperties.length} imóveis serão destacados`}
              </div>
            </div>

            {/* Total e checkout */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total a pagar:</span>
                <span className="text-orange-500 text-xl">
                  {total.toLocaleString('pt-AO')} Kz
                </span>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold">Garantia de 7 dias</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={processing}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Destacar Imóveis Agora
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popup de Confirmação */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Confirmar Pagamento</h3>
              <button
                onClick={handleCloseConfirmation}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              <div>
                <p className="text-gray-600 mb-4">
                  Para finalizar o destaque dos seus imóveis, faça a transferência para a conta abaixo e envie o comprovativo via WhatsApp.
                </p>

                {/* Informações Bancárias */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-blue-900">Dados Bancários</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Banco:</span>
                      <span className="font-semibold text-blue-900">{bankInfo.bankName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Titular:</span>
                      <span className="font-semibold text-blue-900">{bankInfo.accountHolder}</span>
                    </div>
                    
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Nº da Conta:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900">{bankInfo.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div> */}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">IBAN:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900 text-sm">{bankInfo.iban}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.iban, 'iban')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {/* <span className="text-sm text-blue-700">NIB:</span> */}
                      {/* <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900">{bankInfo.nib}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.nib, 'nib')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div> */}
                    </div>
                  </div>
                  
                  {copiedField && (
                    <div className="mt-3 text-xs text-green-600 text-center">
                      {copiedField === 'account' && 'Número da conta copiado!'}
                      {copiedField === 'iban' && 'IBAN copiado!'}
                      {copiedField === 'nib' && 'NIB copiado!'}
                    </div>
                  )}
                </div>

                {/* Resumo do Pedido */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2">Resumo do Pedido</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pacote:</span>
                    <span className="font-semibold">{selectedPacote?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-semibold">{selectedPacote?.dias} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imóveis:</span>
                    <span className="font-semibold">{selectedProperties.length} imóveis</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-semibold">Total:</span>
                    <span className="font-bold text-orange-500 text-lg">
                      {total.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    <strong>Importante:</strong> Após a transferência, clique em "Enviar Comprovativo" para abrir o WhatsApp e enviar o comprovativo de pagamento.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={handleCloseConfirmation}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleWhatsAppConfirmation}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar Comprovativo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ResumoTab