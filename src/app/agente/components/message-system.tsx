import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";

interface MessageSystemProps {
  showMessageBox: boolean;
  message: string;
  setMessage: (message: string) => void;
  isSending: boolean;
  profile: any;
  onSendMessage: () => void;
  onCloseMessageBox: () => void;
}

export function MessageSystem({
  showMessageBox,
  message,
  setMessage,
  isSending,
  profile,
  onSendMessage,
  onCloseMessageBox
}: MessageSystemProps) {
  return (
    <>
      {/* Caixa de Mensagem - Desliza para baixo */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          showMessageBox ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-white shadow-2xl border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Enviar mensagem para {profile?.primeiro_nome}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCloseMessageBox}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Sua mensagem
                  </label>
                  <textarea
                    id="message-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Olá ${profile?.primeiro_nome}, gostaria de saber mais sobre os seus serviços imobiliários...`}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                    disabled={isSending}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={onSendMessage}
                    disabled={!message.trim() || isSending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onCloseMessageBox}
                    disabled={isSending}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  O agente será notificado e entrará em contacto consigo brevemente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay quando a caixa de mensagem está aberta */}
      {showMessageBox && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onCloseMessageBox}
        />
      )}
    </>
  );
}