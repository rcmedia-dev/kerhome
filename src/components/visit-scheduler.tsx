'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Calendar, Phone, Mail, User, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisitSchedulerProps {
  children?: React.ReactNode;
  property: {
    id: string;
    title: string;
    image?: string | null;
  };
  ownerData: {
    id: string;
    name: string;
    imobiliaria_id?: string;
  };
  userId?: string;
}

const HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function VisitScheduler({ children, property, ownerData, userId }: VisitSchedulerProps) {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        nome: prev.nome || `${user.primeiro_nome || ''} ${user.ultimo_nome || ''}`.trim(),
        telefone: prev.telefone || user.telefone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [isOpen, user]);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data: undefined as Date | undefined,
    horario: '',
  });

  const [error, setError] = useState('');

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.telefone || !formData.data || !formData.horario) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send message to owner's chat
      const targetId = ownerData.id;
      const targetType = ownerData.imobiliaria_id ? 'agency' : 'agent';
      
      const messageContent = `📅 *Nova Solicitação de Visita*

*Imóvel:* ${property.title}
*Data:* ${formData.data ? format(formData.data, "PPP", { locale: ptBR }) : ''} às ${formData.horario}
*Nome:* ${formData.nome}
*Telefone:* ${formData.telefone || 'Não informado'}
${formData.email ? `*Email:* ${formData.email}` : ''}`;

      // Create or get conversation
      let conversationId = null;

      const checkRes = await fetch('/api/conversations/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myId: userId,
          targetId: targetId,
          targetType: targetType,
          imobiliariaId: ownerData.imobiliaria_id
        })
      });

      if (checkRes.ok) {
        const data = await checkRes.json();
        conversationId = data.conversationId || data.conversation_id;
      }

      // If no conversation, create one
      if (!conversationId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            myId: userId,
            targetId: targetId,
            targetType: targetType,
            propertyId: property.id,
            imobiliariaId: ownerData.imobiliaria_id
          })
        });

        if (createRes.ok) {
          const data = await createRes.json();
          conversationId = data.conversation?.id;
        }
      }

      // Send message if we have conversation
      if (conversationId) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            sender_id: userId,
            content: messageContent,
            attachment_url: property.image,
            attachment_type: 'image'
          })
        });
      }

      setStep('success');
      toast.success('Pedido de visita enviado ao corretor!');
    } catch (e) {
      console.error('Error scheduling visit:', e);
      setError('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setStep('form');
    setFormData({ nome: '', telefone: '', email: '', data: undefined, horario: '' });
    setError('');
  };

  const modalContent = (
    <>
      {isOpen && step === 'form' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetAndClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-gray-900">Agendar Visita</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{property.title}</p>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Property Preview */}
            <div className="px-5 py-3 bg-gray-50 flex items-center gap-3">
              {property.image && (
                <div className="w-16 h-12 rounded-lg overflow-hidden relative">
                  <Image src={property.image} alt={property.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 line-clamp-2">{property.title}</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Nome */}
              <div>
                <Label className="text-sm text-gray-600">Nome *</Label>
                <Input
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>

              {/* Telefone */}
              <div>
                <Label className="text-sm text-gray-600">Telefone *</Label>
                <Input
                  value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+244 999 999 999"
                  className="mt-1"
                />
              </div>

              {/* Email (optional) */}
              <div>
                <Label className="text-sm text-gray-600">Email (opcional)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-1"
                />
              </div>

              {/* Calendar */}
              <div className="flex flex-col items-center">
                <Label className="text-sm text-gray-600 mb-2 w-full">Data da Visita *</Label>
                <div className="bg-white border rounded-xl p-1 shadow-sm w-full flex justify-center">
                  <CalendarUI
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => setFormData({ ...formData, data: date })}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      // Disable past dates, today, and Sundays
                      return date <= today || date.getDay() === 0;
                    }}
                    className="rounded-md border-0"
                  />
                </div>
              </div>

              {/* Horário */}
              {formData.data && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Horário *</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {HORARIOS.map(hora => (
                      <button
                        key={hora}
                        onClick={() => setFormData({ ...formData, horario: hora })}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          formData.horario === hora
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                        }`}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.data || !formData.horario}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    <Send size={18} />
                    Confirmar Agendamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && step === 'success' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Visita Agendada!</h3>
            <p className="text-gray-600 mb-4">
              O corretor {ownerData.name} recebeu o seu pedido de visita para o dia {formData.data ? format(formData.data, "dd 'de' MMMM", { locale: ptBR }) : ''} às {formData.horario}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Em breve será contactado para confirmar.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (!user) return null;

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {/* Modal rendered at document.body level via portal to escape CSS transforms */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}