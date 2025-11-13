// app/dashboard/subscricoes/page.tsx
'use client'

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock, UserCircle2, Mail, Phone, Crown, Zap, Check, ArrowRight, MoreVertical, Star, Loader2, Trash2, Edit } from "lucide-react"
import { approvePlanRequest, getPlanRequests, rejectPlanRequest, removeSubscription } from "../dashboard/actions/get-plan-requests"

type SubscriptionStatus = "Todos" | "Pendentes" | "Aprovados" | "Rejeitados"

type UserSubscription = Awaited<ReturnType<typeof getPlanRequests>>[number]

export const PLANS = {
  "Plano Básico": {
    badge: "BÁSICO",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    badgeBg: "bg-blue-100 text-blue-700",
    titleColor: "text-blue-700",
    border: "border-blue-100",
    button: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
    gradient: "from-blue-50 to-cyan-50",
    limite: 10,
    destaquesPermitidos: 1,
    price: 69000,
    benefits: [
      "Até 10 imóveis ativos",
      "1 anúncio nas redes sociais",
      "Suporte via WhatsApp",
      "Atendimento das 8h às 17h (Seg. a Sex.)",
    ],
  },
  "Plano Professional": {
    badge: "PROFESSIONAL",
    iconBg: "bg-gradient-to-br from-purple-600 to-pink-600",
    badgeBg: "bg-purple-100 text-purple-700",
    titleColor: "text-purple-700",
    border: "border-purple-100",
    button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    gradient: "from-purple-50 to-pink-50",
    limite: 50,
    destaquesPermitidos: 10,
    price: 118000,
    benefits: [
      "Até 50 imóveis ativos",
      "10 anúncios nas redes sociais",
      "Suporte via WhatsApp",
      "Atendimento das 8h às 17h (Seg. a Sex.)",
    ],
  },
  "Plano Super": {
    badge: "SUPER",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    badgeBg: "bg-orange-100 text-orange-700",
    titleColor: "text-orange-700",
    border: "border-orange-100",
    button: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    gradient: "from-orange-50 to-amber-50",
    limite: Infinity,
    destaquesPermitidos: 50,
    price: 250000,
    benefits: [
      "Imóveis ilimitados",
      "50 anúncios nas redes sociais",
      "Suporte VIP 24h",
    ],
  },
} as const;

export type PlanName = keyof typeof PLANS;


export default function SubscricoesPage() {
  const [activeTab, setActiveTab] = useState<SubscriptionStatus>("Todos")
  const [users, setUsers] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await getPlanRequests()
      setUsers(data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setMessage({ type: 'error', text: 'Erro ao carregar solicitações' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  
  const filteredUsers =
    activeTab === "Todos" ? users : users.filter((u) => u.status === activeTab)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleApprove = async (requestId: string, userId: string, planId: string) => {
    setProcessing(requestId)
    setMessage(null)
    
    try {
      const result = await approvePlanRequest(requestId, userId, planId)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await fetchData()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar solicitação' })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessing(requestId)
    setMessage(null)
    
    try {
      const result = await rejectPlanRequest(requestId)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await fetchData()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar solicitação' })
    } finally {
      setProcessing(null)
    }
  }

  const handleRemoveSubscription = async (requestId: string, userId: string) => {
    setProcessing(requestId)
    setMessage(null)
    setShowDeleteConfirm(null)
    
    try {
      const result = await removeSubscription(requestId, userId)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await fetchData()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao remover subscrição' })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Subscrições</h1>
          <p className="text-gray-600">Gerencie as subscrições dos usuários da plataforma</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["Todos", "Pendentes", "Aprovados", "Rejeitados"] as SubscriptionStatus[]).map(
              (tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab === "Pendentes" && <Clock size={16} />}
                    {tab === "Aprovados" && <CheckCircle size={16} />}
                    {tab === "Rejeitados" && <XCircle size={16} />}
                    {tab}
                    {tab !== "Todos" && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                      }`}>
                        {users.filter(u => u.status === tab).length}
                      </span>
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-2">Carregando solicitações...</p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                const plan = PLANS[user.plano as keyof typeof PLANS] || PLANS["Plano Básico"]
                return (
                  <div
                    key={user.id}
                    className={`bg-white rounded-2xl shadow-lg border ${plan.border} overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${plan.gradient} p-6 relative`}>
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.badgeBg}`}>
                          {plan.badge}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${plan.iconBg} text-white shadow-lg`}>
                          <Crown size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{user.nome}</h3>
                          <p className="text-sm text-gray-600">{user.plano}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Contact Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone size={16} className="text-gray-400" />
                          +244 {user.telefone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          Inscrito em {formatDate(user.dataInscricao)}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(plan.price)}
                        </div>
                        <div className="text-sm text-gray-500">por mês</div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap size={16} className="text-yellow-500" />
                            {plan.limite === 1000 ? "Ilimitado" : plan.limite} imóveis
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star size={16} className="text-amber-500" />
                            {plan.destaquesPermitidos} destaques
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {plan.benefits.slice(0, 3).map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <Check size={14} className="text-green-500 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                          {plan.benefits.length > 3 && (
                            <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                              +{plan.benefits.length - 3} benefícios <ArrowRight size={14} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="border-t pt-4">
                        {user.status === "Pendentes" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(user.id, user.user_id, user.plan_id)}
                              disabled={processing === user.id}
                              className={`flex-1 py-2 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:shadow-lg ${plan.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {processing === user.id ? (
                                <Loader2 size={16} className="animate-spin inline mr-1" />
                              ) : (
                                <CheckCircle size={16} className="inline mr-1" />
                              )}
                              Aprovar
                            </button>
                            <button 
                              onClick={() => handleReject(user.id)}
                              disabled={processing === user.id}
                              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processing === user.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <XCircle size={16} className="inline mr-1" />
                              )}
                              Rejeitar
                            </button>
                          </div>
                        )}
                        
                        {(user.status === "Aprovados" || user.status === "Rejeitados") && (
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 font-medium ${
                              user.status === "Aprovados" ? "text-green-600" : "text-red-500"
                            }`}>
                              {user.status === "Aprovados" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              <span>{user.status === "Aprovados" ? "Aprovado" : "Rejeitado"}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Botão de remover com confirmação */}
                              {showDeleteConfirm === user.id ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleRemoveSubscription(user.id, user.user_id)}
                                    disabled={processing === user.id}
                                    className="p-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                  >
                                    {processing === user.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      "Confirmar"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="p-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setShowDeleteConfirm(user.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remover subscrição"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCircle2 size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma subscrição encontrada
                </h3>
                <p className="text-gray-600">
                  Não há subscrições com o status "{activeTab}" no momento.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}