'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';
import { ChatWindow } from '@/components/chat/chat-window';
import { 
  MessageCircle, 
  UserCircle, 
  Search, 
  Inbox,
  CheckCheck,
  User,
  Building2,
  Info,
  Flame,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  Plus,
  StickyNote,
  Zap,
  BellRing,
  X,
  ChevronDown,
  ChevronLeft,
  Send,
  Check,
  CalendarCheck,
  ClockIcon,
  Trash2
} from 'lucide-react';
import { format, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { AiLeadCoach } from '@/components/ai-lead-coach';

type LeadTemperature = 'hot' | 'warm' | 'cold' | 'none';

interface Visit {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
  property_title?: string;
  lead_name?: string;
  notes?: string;
}

const HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const QUICK_REPLIES = [
  "Olá! O imóvel ainda está disponível. Gostaria de agendar uma visita?",
  "Sim, está disponível. Posso enviar a documentação por email?",
  "Olá! Fazemos simulações de crédito. Tem interesse?",
  "Obrigado pelo contacto! Um consultor ligará em breve."
];

export function MessagesTab() {
  const { user } = useUserStore();
  const {
    conversations,
    openChat,
    isLoading,
    view,
    messages,
    activeConversationId,
    activeProfile,
    initializeChat,
    backToList,
    setIsDashboardMessages,
    updateConversationCRM
  } = useChatStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LeadTemperature | 'all'>('all');
  const [localNote, setLocalNote] = useState('');
  const [isMobileCrmOpen, setIsMobileCrmOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    date: undefined as Date | undefined,
    time: '',
    notes: '',
    propertyId: '' as string,
    propertyTitle: '' as string
  });
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset states when conversation changes
  useEffect(() => {
    setIsEditingNote(false);
  }, [activeConversationId]);

  // Signal header to hide chat button while this tab is open
  useEffect(() => {
    setIsDashboardMessages(true);
    return () => setIsDashboardMessages(false);
  }, [setIsDashboardMessages]);

  useEffect(() => {
    if (user?.id) {
      initializeChat(user.id);
      fetchAgentProperties(user.id);
    }
  }, [user?.id, initializeChat]);

  const fetchAgentProperties = async (uid: string) => {
    try {
      const props = await getSupabaseUserProperties(uid);
      setAgentProperties(props || []);
    } catch (e) {
      console.error('Failed to fetch agent properties', e);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const contactName = activeConversation?.target_type === 'agency' && activeConversation?.agency_details?.nome
    ? activeConversation.agency_details.nome
    : activeProfile
      ? `${activeProfile.primeiro_nome ?? ''} ${activeProfile.ultimo_nome ?? ''}`.trim()
      : null;

  const contactAvatar = activeConversation?.target_type === 'agency' && activeConversation?.agency_details?.logo
    ? activeConversation.agency_details.logo
    : activeProfile?.avatar_url;

  const currentTemp = activeConversation?.lead_temperature || 'none';
  const property = (activeConversation as any)?.property_details;
  const hasMessageHistory = Boolean(
    activeConversation?.last_message?.content || 
    (activeConversation as any)?.messages_count > 0
  );
  const showTemplates = view === 'chat' && 
    Boolean(activeConversationId) && 
    !isLoading && 
    messages.length === 0 && 
    !hasMessageHistory;

  // Update local note when conversation changes
  useEffect(() => {
    if (activeConversation) {
      const note = activeConversation.internal_notes || '';
      setLocalNote(note);
      setIsMobileCrmOpen(false); // Close mobile CRM when switching chats
      
      // Auto-select property if available in conversation
      const prop = (activeConversation as any)?.property_details;
      if (prop) {
        setVisitForm(v => ({ ...v, propertyId: prop.id, propertyTitle: prop.title }));
      }
    } else {
      setIsMobileCrmOpen(false);
    }
  }, [activeConversationId, activeConversation?.internal_notes]);

  // Fetch visits when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchVisits(activeConversationId);
    } else {
      setVisits([]);
    }
  }, [activeConversationId]);

  // Lead classification
  useEffect(() => {
    if (!activeConversationId || messages.length < 2) return;
    if (activeConversation?.lead_temperature && activeConversation.lead_temperature !== 'none') return;

    const convMessages = messages.map(m => ({
      sender_id: m.sender_id === user?.id ? 'agent' : 'lead',
      content: m.content,
    }));

    const timer = setTimeout(() => {
      fetch('/api/mywai/classify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convMessages }),
      })
        .then(res => res.json())
        .then(json => {
          if (json.temperature && json.temperature !== 'none') {
            updateConversationCRM(activeConversationId, { lead_temperature: json.temperature });
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeConversationId, messages.length]);

  const fetchVisits = async (convId: string) => {
    setIsLoadingVisits(true);
    try {
      const res = await fetch(`/api/visits?conversation_id=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) {
      console.error('Failed to fetch visits', e);
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!visitForm.date || !visitForm.time || !activeConversationId) return;
    setIsSubmittingVisit(true);
    try {
      const formattedDate = format(visitForm.date, 'yyyy-MM-dd');
      const displayDate = format(visitForm.date, "EEEE, dd 'de' MMMM", { locale: ptBR });
      
      const payload = {
        conversation_id: activeConversationId,
        property_id: visitForm.propertyId || null,
        property_title: visitForm.propertyTitle || 'Imóvel sem título',
        lead_id: activeProfile?.id,
        lead_name: contactName,
        scheduled_date: formattedDate,
        scheduled_time: visitForm.time,
        notes: visitForm.notes
      };

      console.log("Scheduling visit with payload:", payload);

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setVisits(prev => [...prev, data.visit]);
        
        toast.success('Visita agendada com sucesso!');
        setIsVisitModalOpen(false);
        setVisitForm(v => ({ ...v, date: undefined, time: '', notes: '' }));
      } else {
        const errData = await res.json();
        toast.error(`Erro ao agendar: ${errData.error || 'Erro desconhecido'}`);
      }
    } catch (e: any) {
      console.error('Error scheduling visit:', e);
      toast.error('Erro de conexão ao agendar visita.');
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, status: Visit['status']) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, status })
      });
      if (res.ok) {
        setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status } : v));
        toast.success('Visita atualizada!');
      }
    } catch (e) {
      console.error('Error updating visit:', e);
    }
  };

  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  const handleDeleteVisit = (visitId: string) => {
    setDeletingVisitId(visitId);
  };

  const confirmDeleteVisit = async (visitId: string) => {
    try {
      const res = await fetch(`/api/visits?id=${visitId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setVisits(prev => prev.filter(v => v.id !== visitId));
        toast.success('Agendamento removido!');
      }
    } catch (e) {
      console.error('Error deleting visit:', e);
      toast.error('Erro ao remover visita.');
    } finally {
      setDeletingVisitId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR });
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const filtered = conversations.filter(conv => {
    const name = conv.target_type === 'agency' && conv.agency_details?.nome
      ? conv.agency_details.nome
      : `${conv.other_user?.primeiro_nome ?? ''} ${conv.other_user?.ultimo_nome ?? ''}`;
    
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (conv.lead_temperature || 'none') === filter;
    
    return matchesSearch && matchesFilter;
  });



  // Handles note change with debounce
  const handleNoteChange = (val: string) => {
    setLocalNote(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (activeConversationId) {
        updateConversationCRM(activeConversationId, { internal_notes: val });
      }
    }, 1000); // Wait 1 second after typing stops
  };

  const handleTempChange = (newTemp: LeadTemperature) => {
    if (activeConversationId) {
      updateConversationCRM(activeConversationId, { lead_temperature: newTemp });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-50/20">
      {/* The Master Grid - Absolute Inset forces it to stay within the Dashboard's viewport */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-white md:rounded-card md:border border-border shadow-card">
        
        {/* COLUMN 1: Conversation List (3/12) */}
        <div className={cn(
          "md:col-span-3 border-r border-gray-100 flex flex-col h-full overflow-hidden bg-white z-20",
          activeConversationId && "hidden md:flex"
        )}>
          {/* Header: Mobile - WhatsApp Style / Desktop - Original */}
          <div className="lg:hidden shrink-0">
            {/* Mobile Header */}
            <div className="px-5 pt-3 pb-3 flex items-center justify-between bg-white">
              <h1 className="text-xl font-black text-gray-900">Conversas</h1>
            </div>
            {/* Mobile Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar leads..."
                  className="conv-search-input w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            {/* Mobile Filter Chips */}
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
              {[
                { value: 'all' as const, label: 'Todos', count: conversations.length },
                { value: 'hot' as const, label: 'Quentes', count: conversations.filter(c => c.lead_temperature === 'hot').length, icon: <Flame className="w-3 h-3 text-red-500" /> },
                { value: 'warm' as const, label: 'Mornos', count: conversations.filter(c => c.lead_temperature === 'warm').length, icon: <Flame className="w-3 h-3 text-orange-400" /> },
                { value: 'cold' as const, label: 'Frios', count: conversations.filter(c => c.lead_temperature === 'cold').length, icon: <Flame className="w-3 h-3 text-blue-400" /> },
              ].map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setFilter(chip.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                    filter === chip.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                      : "bg-white text-gray-600 border-gray-200 active:bg-gray-50"
                  )}
                >
                  {chip.icon}
                  {chip.label}
                  <span className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black",
                    filter === chip.value ? "bg-white/20" : "bg-gray-100"
                  )}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Header - Original */}
          <div className="hidden lg:block p-4 border-b border-gray-50 bg-white/50 backdrop-blur-md shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar leads..."
                className="w-full pl-10 pr-4 py-2 text-[11px] bg-gray-50 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-bold"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterButton>
              <FilterButton active={filter === 'hot'} onClick={() => setFilter('hot')} icon={<Flame className="w-3 h-3 text-red-500" />}>Quentes</FilterButton>
              <FilterButton active={filter === 'warm'} onClick={() => setFilter('warm')} icon={<Flame className="w-3 h-3 text-orange-400" />}>Mornos</FilterButton>
              <FilterButton active={filter === 'cold'} onClick={() => setFilter('cold')} icon={<Flame className="w-3 h-3 text-blue-400" />}>Frios</FilterButton>
            </div>
          </div>

          {/* Body: Conversation Items */}
          <div className="mobile-scroll-container flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Sincronizando...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-40">
                <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Sem conversas encontradas</p>
              </div>
            ) : (
              <>
                {/* Mobile: Pinned Conversations */}
                {filtered.some(c => (c.unread_count ?? 0) > 0) && (
                  <div className="lg:hidden">
                    <div className="px-5 py-2 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m12 17 0 5M18.5 11.5l-12.5-.5 3.5-4-1-4 5 3 3.5-1.5"/></svg>
                      Não lidos
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {filtered.map((conv, idx) => {
                    const name = conv.target_type === 'agency' && conv.agency_details?.nome
                      ? conv.agency_details.nome
                      : `${conv.other_user?.primeiro_nome ?? ''} ${conv.other_user?.ultimo_nome ?? ''}`;
                    const avatar = conv.target_type === 'agency' && conv.agency_details?.logo
                      ? conv.agency_details.logo
                      : conv.other_user?.avatar_url;
                    const hasUnread = (conv.unread_count ?? 0) > 0;
                    const isActive = conv.id === activeConversationId;
                    const leadTemp = conv.lead_temperature || 'none';

                    return (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => openChat(conv.id, conv.other_user)}
                        className={cn(
                          'flex items-center gap-3 lg:gap-3 px-4 lg:px-4 py-3.5 lg:py-4 cursor-pointer border-b border-gray-50 transition-all relative group',
                          isActive ? 'lg:bg-purple-50/80 bg-purple-50/60' : 'active:bg-gray-50/80 lg:hover:bg-gray-50/50',
                          hasUnread && !isActive && 'bg-orange-50/20'
                        )}
                      >
                        {/* Desktop: Active indicator bar */}
                        {isActive && <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-purple-600" />}
                        
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="lg:w-11 lg:h-11 lg:rounded-badge w-[52px] h-[52px] rounded-2xl object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="lg:w-11 lg:h-11 lg:rounded-badge w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-purple-100 to-orange-50 flex items-center justify-center border border-gray-200">
                              <UserCircle className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          {/* Online dot */}
                          {conv.other_user?.online_status === 'online' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2.5 border-white shadow-sm" />
                          )}
                          {/* Unread dot */}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 border-2 border-white rounded-full shadow-md" />
                          )}
                          {/* Temperature badge */}
                          {leadTemp !== 'none' && (
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-sm border-2 border-white",
                              leadTemp === 'hot' ? "bg-red-500" : leadTemp === 'warm' ? "bg-orange-400" : "bg-blue-400"
                            )}>
                              <Flame className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <h3 className={cn(
                              'lg:text-[11px] lg:uppercase lg:tracking-tight text-[15px] truncate',
                              hasUnread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'
                            )}>
                              {name}
                            </h3>
                            <span className={cn(
                              "lg:text-[9px] text-xs shrink-0 font-semibold",
                              hasUnread ? "text-purple-600" : "text-gray-400"
                            )}>
                              {conv.last_message ? formatDate(conv.last_message.created_at) : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {conv.last_message?.sender_id === user?.id && (
                              <CheckCheck className="w-4 h-4 lg:w-3 lg:h-3 shrink-0 text-purple-400" />
                            )}
                            <p className={cn(
                              'lg:text-[10px] text-[13px] truncate flex-1 leading-relaxed',
                              hasUnread ? 'text-gray-700 font-semibold' : 'text-gray-500'
                            )}>
                              {conv.last_message?.content ?? 'Inicie a qualificação...'}
                            </p>
                            {hasUnread && (
                              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-white">{conv.unread_count}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {/* COLUMN 2: Chat Window (6/12) */}
        <div className={cn(
          "md:col-span-6 flex flex-col h-full min-h-0 overflow-hidden bg-white border-r border-gray-100 z-10",
          !activeConversationId && "hidden md:flex",
          activeConversationId && "fixed inset-0 z-50 md:relative md:inset-auto md:z-10 h-[100dvh] md:h-full w-full"
        )}>
          {activeConversationId ? (
            <div className="flex-1 flex flex-col min-h-0 relative h-full overflow-hidden">
              {/* Chat Core */}
              <ChatWindow onClose={backToList} onShowCRM={() => setIsMobileCrmOpen(true)} />
              
              {/* Contextual Quick Replies - Mobile: Above input form */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-20 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-20"
                  >
                    <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                       {QUICK_REPLIES.map((text, i) => (
                         <button 
                           key={i} 
                           onClick={() => {
                             const event = new CustomEvent('insert-ai-reply', { detail: text });
                             window.dispatchEvent(event);
                           }}
                           className="px-3 py-1.5 bg-white shadow-md border border-purple-100 rounded-full text-xs font-bold text-purple-700 active:bg-purple-600 active:text-white active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                         >
                           <Zap className="w-3.5 h-3.5 text-purple-600" />
                           {text}
                         </button>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State for Chat - Mobile: Clean minimal / Desktop: Original */
            <>
              {/* Mobile Empty State */}
              <div className="lg:hidden flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <MessageCircle className="w-10 h-10 text-purple-300" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Seu Hub de Vendas</h3>
                <p className="text-sm text-gray-400 max-w-[240px] font-medium leading-relaxed">
                  Selecione um lead para iniciar a qualificação estratégica.
                </p>
              </div>
              {/* Desktop Empty State */}
              <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-12 bg-gray-50/30">
                <div className="w-24 h-24 bg-white rounded-badge shadow-card flex items-center justify-center mb-6 border border-gray-100">
                  <MessageCircle className="w-12 h-12 text-purple-100" />
                </div>
                <h3 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-widest">Seu Hub de Vendas</h3>
                <p className="text-[11px] text-gray-400 max-w-60 font-bold leading-relaxed">
                  Selecione um lead para iniciar a qualificação estratégica e fechar mais negócios.
                </p>
              </div>
            </>
          )}
        </div>

        {/* COLUMN 3: CRM Dashboard (3/12) */}
        <div className={cn(
          "flex-col h-full overflow-hidden bg-white md:bg-gray-50/30",
          // Desktop: always show
          "md:flex md:col-span-3",
          // Mobile: show only if isMobileCrmOpen is true
          !isMobileCrmOpen ? "hidden" : "absolute inset-0 z-40 flex"
        )}>

          {activeConversationId ? (
            <div className="mobile-scroll-container flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* V4 — Sticky profile: row + temp pill + progress rail */}
              <div className="sticky top-0 z-10 shrink-0 relative bg-white px-4 pt-14 pb-4 lg:px-4 lg:pt-5 lg:pb-4 border-b border-gray-100 shadow-sm">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setIsMobileCrmOpen(false)}
                  className="lg:hidden absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-500 active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {contactAvatar ? (
                      <img src={contactAvatar} alt={contactName ?? ''} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-orange-50 flex items-center justify-center border-2 border-white shadow-sm">
                        <User className="w-6 h-6 text-purple-300" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-md" aria-label="Online" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight truncate">{contactName}</h3>
                    <p className="text-[11px] text-gray-400 font-semibold truncate">{activeProfile?.email || 'Lead Kercasa'}</p>
                  </div>
                  <span className={cn(
                    "shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                    currentTemp === 'hot' ? "bg-red-100 text-red-600" : currentTemp === 'warm' ? "bg-orange-100 text-orange-600" : currentTemp === 'cold' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {currentTemp === 'none' ? 'Sem def.' : currentTemp === 'hot' ? 'Quente' : currentTemp === 'warm' ? 'Morno' : 'Frio'}
                  </span>
                </div>
                <div
                  className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden flex"
                  role="progressbar"
                  aria-valuenow={currentTemp === 'hot' ? 75 : currentTemp === 'warm' ? 50 : currentTemp === 'cold' ? 25 : 10}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso do funil"
                >
                  <span
                    className="block h-full bg-gradient-to-r from-purple-600 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentTemp === 'hot' ? 75 : currentTemp === 'warm' ? 50 : currentTemp === 'cold' ? 25 : 10}%` }}
                  />
                </div>
              </div>

              {/* V4 — CRM body: stats + cards */}
              <div className="p-4 space-y-4 flex-1">
                {/* Stat grid */}
                <div className="grid grid-cols-3 gap-2" aria-label="Métricas do lead">
                  <div className="bg-purple-50 rounded-xl py-3 px-1 text-center">
                    <div className="text-base font-black text-purple-700 tabular-nums leading-none">{messages.length}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Msgs</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl py-3 px-1 text-center">
                    <div className="text-base font-black text-purple-700 tabular-nums leading-none">{visits.length}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Visitas</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl py-3 px-1 text-center">
                    <div className="text-base font-black text-purple-700 tabular-nums leading-none">{property ? 1 : 0}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Imóvel</div>
                  </div>
                </div>

                {/* Qualificação card */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Qualificação</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'hot', label: 'Quente', activeBg: 'bg-rose-500', activeText: 'text-white', inactiveBg: 'bg-rose-50 text-rose-400 border-rose-100' },
                      { id: 'warm', label: 'Morno', activeBg: 'bg-amber-500', activeText: 'text-white', inactiveBg: 'bg-amber-50 text-amber-400 border-amber-100' },
                      { id: 'cold', label: 'Frio', activeBg: 'bg-sky-500', activeText: 'text-white', inactiveBg: 'bg-sky-50 text-sky-400 border-sky-100' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleTempChange(t.id as LeadTemperature)}
                        className={cn(
                          "flex-1 min-h-[38px] rounded-lg border transition-all duration-200 text-xs font-bold cursor-pointer",
                          currentTemp === t.id
                            ? `${t.activeBg} ${t.activeText} border-transparent shadow-md`
                            : `${t.inactiveBg} active:scale-95`
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Imóvel de interesse card */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imóvel de interesse</p>
                  </div>
                  {property ? (
                    <div className="flex gap-3 p-4 pt-3 cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-full h-full p-4 text-gray-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate">{property.title}</h4>
                        <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                          <Search className="w-3 h-3" />
                          <span className="text-[11px] font-medium truncate">{property.cidade}</span>
                        </div>
                        <p className="text-sm font-black text-purple-600 mt-1">{property.price?.toLocaleString('pt-PT')} Kz</p>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 pt-3">
                      <div className="py-5 rounded-lg border border-dashed border-gray-200 text-center flex flex-col items-center gap-1.5">
                        <Inbox className="w-5 h-5 text-gray-300" />
                        <p className="text-[11px] text-gray-400 font-semibold">Nenhum imóvel vinculado</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nota estratégica card */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5 text-purple-600" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nota estratégica</p>
                    </div>
                    {localNote && !isEditingNote && (
                      <button
                        onClick={() => setIsEditingNote(true)}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {!localNote && !isEditingNote ? (
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="w-full py-5 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-purple-300 hover:bg-purple-50/30 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">Adicionar nota estratégica</span>
                    </button>
                  ) : isEditingNote ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="relative">
                        <textarea
                          autoFocus
                          value={localNote}
                          onChange={(e) => handleNoteChange(e.target.value)}
                          placeholder="Ex: Cliente prefere casas com quintal..."
                          className="w-full min-h-28 p-3 text-[12px] font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 resize-none transition-all text-gray-700 shadow-sm"
                        />
                        <div className="absolute bottom-2 right-2">
                          {saveTimeoutRef.current && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 rounded-md border border-orange-100">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                              <span className="text-[9px] text-orange-600 font-semibold">A gravar...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditingNote(false)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-200 active:scale-95 transition-all"
                      >
                        Concluir e Guardar
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingNote(true)}
                      className="group flex items-center gap-3 py-3 px-3.5 bg-orange-50 border border-orange-100 rounded-lg border-l-4 border-l-orange-400 hover:bg-orange-100 transition-all cursor-pointer min-h-12"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-orange-100">
                        <StickyNote className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-900 font-semibold leading-snug whitespace-pre-wrap">
                          {localNote.length > 80 ? `${localNote.substring(0, 80)}...` : localNote}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mt-2.5 text-[9px] text-gray-400 font-medium italic">
                    * Notas privadas visíveis apenas para a sua equipa.
                  </p>
                </div>

                {/* Visitas — só se existirem (mantém lógica) */}
                {visits.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitas no radar</p>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-md">{visits.length}</span>
                    </div>
                    <div className="space-y-2">
                      {visits.map(visit => {
                        const statusMap = {
                          pending: { label: 'Pendente', cls: 'bg-amber-500 text-white border-transparent' },
                          confirmed: { label: 'Confirmada', cls: 'bg-emerald-500 text-white border-transparent' },
                          cancelled: { label: 'Cancelada', cls: 'bg-rose-500 text-white border-transparent' },
                          done: { label: 'Realizada', cls: 'bg-gray-400 text-white border-transparent' },
                        };
                        const s = statusMap[visit.status] || statusMap.pending;
                        const getFriendlyDate = (dateStr: string) => {
                          try {
                            const date = parseISO(dateStr);
                            if (isToday(date)) return 'Hoje';
                            if (isTomorrow(date)) return 'Amanhã';
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            if (date < nextWeek) {
                              return format(date, "EEEE", { locale: ptBR }).replace('-feira', '');
                            }
                            return format(date, "dd 'de' MMMM", { locale: ptBR });
                          } catch {
                            return dateStr;
                          }
                        };
                        const friendlyDate = getFriendlyDate(visit.scheduled_date);

                        return (
                          <div key={visit.id} className="bg-white rounded-lg border border-gray-100 p-3 transition-all hover:shadow-md cursor-pointer group/visit relative overflow-hidden">
                            {deletingVisitId === visit.id ? (
                              <div className="flex flex-col items-center justify-center py-2 animate-in fade-in zoom-in-95 duration-200">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Eliminar agendamento?</p>
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); confirmDeleteVisit(visit.id); }}
                                    className="flex-1 py-2 bg-rose-500 text-white text-[9px] font-black uppercase rounded-md hover:bg-rose-600 transition-colors shadow-sm"
                                  >
                                    Apagar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingVisitId(null); }}
                                    className="flex-1 py-2 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVisit(visit.id);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 opacity-40 hover:opacity-100 transition-all hover:bg-rose-50 rounded-md group/trash"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover/trash:text-rose-600 transition-colors" />
                                </button>
                                <div className="flex-1 pr-6">
                                  <p className="text-[12px] text-gray-500 font-bold leading-snug">
                                    Visita agendada para <span className="text-gray-900 font-black capitalize">{friendlyDate}</span> às <span className="text-gray-900 font-black">{visit.scheduled_time.split(':').slice(0, 2).join(':')}</span>
                                  </p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className={cn('text-[8px] font-black uppercase px-2 py-0.5 rounded-md', s.cls)}>{s.label}</span>
                                    {visit.property_title && (
                                      <span className="text-[8px] text-gray-400 font-bold uppercase truncate max-w-30">
                                        • {visit.property_title}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {visit.status === 'pending' && (
                                  <div className="flex gap-2 mt-3">
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateVisitStatus(visit.id, 'confirmed'); }} className="flex-1 py-1.5 text-[9px] font-black uppercase bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm">Confirmar</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateVisitStatus(visit.id, 'cancelled'); }} className="flex-1 py-1.5 text-[9px] font-black uppercase bg-gray-50 text-gray-500 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors">Cancelar</button>
                                  </div>
                                )}
                                {visit.status === 'confirmed' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleUpdateVisitStatus(visit.id, 'done'); }} className="w-full mt-3 py-1.5 text-[9px] font-black uppercase bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"><Check className="w-3 h-3 inline mr-1" /> Concluir Visita</button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* V4 CTA — sempre no fim do body */}
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(true)}
                  className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[13px] font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Visita
                </button>
              </div>
            </div>
          ) : (
            /* CRM Empty State - Refined */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-md flex items-center justify-center mb-4">
                <LayoutDashboard className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Painel Estratégico</h3>
              <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">Selecione uma conversa</p>
              {user?.id && (
                <div className="mt-6 w-full max-w-xs">
                  <AiLeadCoach messages={messages} currentUserId={user.id} totalUnread={conversations.filter(c => (c as any).unread_count > 0).length} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scheduler Modal - Portaled automatically by being outside the absolute grid */}
      <VisitSchedulerModal
        isOpen={isVisitModalOpen}
        onClose={() => { setIsVisitModalOpen(false); setVisitForm(v => ({ ...v, date: undefined, time: '', notes: '' })); }}
        onSubmit={handleScheduleVisit}
        isSubmitting={isSubmittingVisit}
        form={visitForm}
        setForm={setVisitForm}
        contactName={contactName}
        agentProperties={agentProperties}
      />
    </div>
  );
}

function FilterButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border-2 shrink-0 uppercase tracking-tighter cursor-pointer",
        active 
          ? "bg-purple-700 text-white border-purple-700 shadow-md" 
          : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ActionButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-row items-center justify-center p-3 bg-white border-2 rounded-button transition-all gap-2.5 shadow-card group font-black uppercase tracking-tighter text-[10px] cursor-pointer",
        color
      )}
    >
      <Icon className="w-4 h-4 transition-colors shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function VisitSchedulerModal({
  isOpen, onClose, onSubmit, isSubmitting, form, setForm, contactName, agentProperties
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  contactName: string | null;
  agentProperties: any[];
}) {
  const HORARIOS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-100 h-full bg-white shadow-2xl flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Agendar Visita</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{contactName || 'Lead'}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="mobile-scroll-container flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Property selector */}
              <section className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Imóvel da Visita *</p>
                <select
                  value={form.propertyId}
                  onChange={(e) => {
                    const p = agentProperties.find(x => x.id === e.target.value);
                    setForm((f: any) => ({ ...f, propertyId: e.target.value, propertyTitle: p?.title || '' }));
                  }}
                  className="w-full p-4 text-[12px] font-bold bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 text-gray-800 transition-all appearance-none"
                >
                  <option value="">Selecione um imóvel...</option>
                  {agentProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </section>

              {/* Calendar */}
              <section className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Data da Visita *</p>
                <div className="border border-gray-100 rounded-md overflow-hidden bg-white shadow-sm flex justify-center">
                  <CalendarUI
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => setForm((f: any) => ({ ...f, date }))}
                    disabled={(date) => { 
                      const today = new Date(); 
                      today.setHours(0,0,0,0); 
                      return date <= today || date.getDay() === 0; 
                    }}
                    className="p-3"
                  />
                </div>
              </section>

              {/* Time Selection */}
              {form.date && (
                <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Horário Disponível *</p>
                  <div className="grid grid-cols-4 gap-2">
                    {HORARIOS.map(h => (
                      <button
                        key={h}
                        onClick={() => setForm((f: any) => ({ ...f, time: h }))}
                        className={cn(
                          'py-3 rounded-md text-[11px] font-black transition-all border-2',
                          form.time === h 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-md scale-105' 
                            : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              <section className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nota Interna (opcional)</p>
                <textarea
                  value={form.notes}
                  onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ex: Cliente tem pressa na mudança..."
                  className="w-full h-24 p-4 text-[12px] font-medium bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 resize-none text-gray-800 placeholder:text-gray-400 transition-all"
                />
              </section>
            </div>

            {/* Footer - Sticky Action */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !form.date || !form.time || !form.propertyId}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-md font-black text-[11px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:grayscale cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirmar Agendamento
                  </>
                )}
              </button>
              <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-4">
                O cliente receberá uma notificação automática.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
