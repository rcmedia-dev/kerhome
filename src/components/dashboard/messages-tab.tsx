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
  ClockIcon
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';

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
  const [isNoteOpen, setIsNoteOpen] = useState(false);
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

  const myMessagesCount = messages.filter(m => m.sender_id === user?.id).length;
  const showTemplates = view === 'chat' && activeConversationId && myMessagesCount === 0;

  // Update local note when conversation changes
  useEffect(() => {
    if (activeConversation) {
      const note = activeConversation.internal_notes || '';
      setLocalNote(note);
      setIsNoteOpen(!!note);
      
      // Auto-select property if available in conversation
      const prop = (activeConversation as any)?.property_details;
      if (prop) {
        setVisitForm(v => ({ ...v, propertyId: prop.id, propertyTitle: prop.title }));
      }
    } else {
      setIsNoteOpen(false);
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
    <>
      <div className="flex flex-col h-full -m-4 lg:m-0">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white lg:rounded-md lg:border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-80px)] lg:h-[calc(100vh-180px)] relative">

        {/* COL 1: Conversation List */}
        <div className={cn(
          "lg:col-span-3 border-r border-gray-200 flex flex-col overflow-hidden h-full",
          activeConversationId && "hidden lg:flex"
        )}>
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-100 bg-white space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar leads..."
                className="w-full pl-10 pr-4 py-2 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterButton>
              <FilterButton active={filter === 'hot'} onClick={() => setFilter('hot')} icon={<Flame className="w-3 h-3 text-red-500" />}>Quentes</FilterButton>
              <FilterButton active={filter === 'warm'} onClick={() => setFilter('warm')} icon={<Flame className="w-3 h-3 text-orange-400" />}>Mornos</FilterButton>
              <FilterButton active={filter === 'cold'} onClick={() => setFilter('cold')} icon={<Flame className="w-3 h-3 text-blue-400" />}>Frios</FilterButton>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {isLoading && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-6 h-6 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-2" />
                <p className="text-gray-400 text-xs font-bold">A carregar...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Inbox className="w-10 h-10 text-gray-100 mb-2" />
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                  {search || filter !== 'all' ? 'Nenhum lead' : 'Vazio'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => openChat(conv.id, conv.other_user)}
                      className={cn(
                        'flex items-center gap-4 px-4 py-4 cursor-pointer border-b border-gray-100 transition-all relative',
                        isActive
                          ? 'bg-purple-50 border-l-4 border-l-purple-600'
                          : 'hover:bg-gray-50',
                        hasUnread && !isActive && 'bg-orange-50/20'
                      )}
                    >
                      <div className="relative shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <UserCircle className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-600 border-2 border-white rounded-full" />
                        )}
                        {leadTemp !== 'none' && (
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white",
                            leadTemp === 'hot' ? "bg-red-500" : leadTemp === 'warm' ? "bg-orange-400" : "bg-blue-400"
                          )}>
                            <Flame className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1 mb-0.5">
                          <h3 className={cn('text-[11px] truncate', hasUnread ? 'font-black text-gray-900' : 'font-bold text-gray-800')}>
                            {name}
                          </h3>
                          <span className="text-[9px] text-gray-400 whitespace-nowrap shrink-0 font-bold">
                            {conv.last_message ? formatDate(conv.last_message.created_at) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className={cn('text-[10px] truncate', hasUnread ? 'text-gray-700 font-bold' : 'text-gray-500 font-medium')}>
                            {conv.last_message?.sender_id === user?.id && (
                              <CheckCheck className="w-3 h-3 inline mr-0.5 text-purple-400" />
                            )}
                            {conv.last_message?.content ?? 'Nova interação'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* COL 2: Chat Window */}
        <div className={cn(
          "lg:col-span-6 flex flex-col overflow-hidden border-r border-gray-200 h-full relative",
          !activeConversationId && "hidden lg:flex"
        )}>
          {view === 'chat' && activeConversationId ? (
            <>
              <div className="lg:hidden absolute top-4 left-4 z-[20]">
                <button 
                  onClick={backToList}
                  className="p-2 bg-white/80 backdrop-blur shadow-sm border border-gray-100 rounded-xl text-gray-400 hover:text-purple-600 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <ChatWindow onClose={backToList} />
              
              {/* Quick Replies */}
              {showTemplates && (
                <div className="absolute bottom-20 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/90 to-transparent z-10">
                  <div className="flex flex-wrap gap-2 justify-center">
                     {QUICK_REPLIES.map((text, i) => (
                       <button 
                         key={i} 
                         className="px-3 py-1.5 bg-white shadow-md border border-purple-200 rounded-full text-[10px] font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                       >
                         <Zap className="w-3 h-3" />
                         {text}
                       </button>
                     ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-gray-50/10">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-purple-200" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2 uppercase tracking-wide">Central de Negócios</h3>
              <p className="text-xs text-gray-400 max-w-xs font-medium">
                Selecione um lead para iniciar a qualificação e fechar o negócio.
              </p>
            </div>
          )}
        </div>

        {/* COL 3: CRM / Lead Management Panel */}
        <div className={cn(
          "lg:col-span-3 flex flex-col overflow-hidden bg-gray-50/30 h-full",
          isNoteOpen ? "fixed inset-0 z-[60] lg:relative lg:inset-auto lg:flex shadow-2xl" : "hidden lg:flex"
        )}>
          {isNoteOpen && (
            <div className="lg:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase">Gestão do Lead</h3>
              <button onClick={() => setIsNoteOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
          {view === 'chat' && activeConversationId ? (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
              
              {/* Profile Summary */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-5">
                  {contactAvatar ? (
                    <img src={contactAvatar} alt={contactName ?? ''} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <User className="w-7 h-7 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{contactName}</h3>
                    <p className="text-[10px] text-purple-600 font-bold truncate">{activeProfile?.email || 'Sem email registado'}</p>
                  </div>
                </div>

                {/* Lead Temperature Selector */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Temperatura do Lead</p>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'hot', label: 'Quente', color: 'bg-red-500', text: 'text-white', border: 'border-red-600', hover: 'hover:bg-red-50' },
                      { id: 'warm', label: 'Morno', color: 'bg-orange-400', text: 'text-white', border: 'border-orange-500', hover: 'hover:bg-orange-50' },
                      { id: 'cold', label: 'Frio', color: 'bg-blue-400', text: 'text-white', border: 'border-blue-500', hover: 'hover:bg-blue-50' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleTempChange(t.id as LeadTemperature)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border-2 transition-all text-[10px] font-black uppercase tracking-tighter cursor-pointer",
                          currentTemp === t.id 
                            ? `${t.color} ${t.text} ${t.border} shadow-md scale-[1.02]`
                            : `bg-white border-gray-100 text-gray-400 ${t.hover}`
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CRM Sections */}
              <div className="p-5 space-y-6">
                
                {/* Reminders / Follow-up */}
                <section className="space-y-3">
                  <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest border-l-2 border-orange-400 pl-2">Acção Pendente</p>
                  <div className="bg-orange-50/80 p-3 rounded-md border-2 border-orange-200 border-dashed flex items-center justify-between group cursor-pointer hover:bg-orange-100 transition-colors shadow-sm">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-orange-600" />
                      <span className="text-[10px] font-black text-orange-800 uppercase">Definir Follow-up</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                </section>

                {/* Interest Context - Now Dynamic */}
                <section className="space-y-3">
                  <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest border-l-2 border-purple-400 pl-2">Imóvel de Interesse</p>
                  {property ? (
                    <div className="bg-white p-3 rounded-md border-2 border-gray-100 shadow-md flex gap-3 group cursor-pointer hover:border-purple-300 transition-all active:scale-[0.98]">
                      <div className="w-14 h-14 rounded bg-gray-100 shrink-0 overflow-hidden relative border border-gray-200">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-full h-full p-3 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{property.title}</h4>
                        <p className="text-[10px] text-gray-600 font-bold mt-0.5 truncate">{property.cidade}, {property.provincia}</p>
                        <p className="text-[12px] font-black text-purple-700 mt-1.5">
                          {property.price?.toLocaleString('pt-PT')} Kz
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-bold">Sem imóvel associado</p>
                    </div>
                  )}
                </section>

                {/* Internal Notes - Collapsible */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest border-l-2 border-gray-400 pl-2">Notas Privadas</p>
                    {localNote && (
                      <button
                        onClick={() => setIsNoteOpen(v => !v)}
                        className="flex items-center gap-1 text-[9px] font-black text-gray-400 hover:text-purple-600 uppercase tracking-tighter cursor-pointer transition-colors"
                      >
                        <ChevronDown className={cn('w-3 h-3 transition-transform', isNoteOpen && 'rotate-180')} />
                        {isNoteOpen ? 'Recolher' : 'Editar'}
                      </button>
                    )}
                  </div>

                  {!isNoteOpen ? (
                    <button
                      onClick={() => setIsNoteOpen(true)}
                      className={cn(
                        'w-full flex items-start gap-2 p-3 rounded-md border-2 text-left transition-all cursor-pointer group',
                        localNote
                          ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
                          : 'bg-white border-dashed border-gray-200 hover:border-purple-300'
                      )}
                    >
                      <StickyNote className={cn('w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors', localNote ? 'text-yellow-500' : 'text-gray-300 group-hover:text-purple-400')} />
                      {localNote ? (
                        <span className="text-[10px] font-bold text-gray-700 line-clamp-3">{localNote}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-purple-500">Clique para adicionar nota privada...</span>
                      )}
                    </button>
                  ) : (
                    <div className="relative">
                      <textarea
                        value={localNote}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder="Anote detalhes da negociação..."
                        autoFocus
                        className="w-full h-28 p-3 text-[11px] font-bold bg-white border-2 border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none transition-all placeholder:text-gray-400 text-gray-800 shadow-sm"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          {saveTimeoutRef.current && (
                            <><div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                            <span className="text-[8px] text-orange-400 font-bold">A gravar...</span></>
                          )}
                          {!saveTimeoutRef.current && localNote && (
                            <><Check className="w-3 h-3 text-green-500" />
                            <span className="text-[8px] text-green-500 font-bold">Guardado</span></>
                          )}
                        </div>
                        <button onClick={() => setIsNoteOpen(false)} className="text-[9px] text-gray-400 hover:text-gray-600 font-bold uppercase cursor-pointer">Recolher</button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Conversion Actions */}
                <section className="space-y-3">
                  <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest border-l-2 border-green-400 pl-2">Ferramentas de Venda</p>
                  <div className="flex flex-col gap-2">
                    <ActionButton
                      icon={Calendar}
                      label="Agendar Visita com o Lead"
                      color="bg-orange-500 text-white border-orange-500 hover:bg-orange-600 w-full"
                      onClick={() => setIsVisitModalOpen(true)}
                    />
                  </div>
                </section>

                {/* Visits List */}
                {visits.length > 0 && (
                  <section className="space-y-2 pb-8">
                    <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest border-l-2 border-orange-400 pl-2">Visitas Agendadas</p>
                    <div className="flex flex-col gap-2">
                      {visits.map(visit => {
                        const statusMap = {
                          pending: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                          confirmed: { label: 'Confirmada', cls: 'bg-green-100 text-green-700 border-green-300' },
                          cancelled: { label: 'Cancelada', cls: 'bg-red-100 text-red-600 border-red-200' },
                          done: { label: 'Realizada', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
                        };
                        const s = statusMap[visit.status] || statusMap.pending;
                        let displayDate = visit.scheduled_date;
                        try { displayDate = format(parseISO(visit.scheduled_date), "dd/MM/yyyy", { locale: ptBR }); } catch {}
                        return (
                          <div key={visit.id} className="bg-white rounded-md border-2 border-gray-100 p-3 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <CalendarCheck className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-[10px] font-black text-gray-800">{displayDate}</span>
                                <span className="text-[10px] font-bold text-gray-500">às {visit.scheduled_time}</span>
                              </div>
                              <span className={cn('text-[8px] font-black uppercase px-1.5 py-0.5 rounded border', s.cls)}>{s.label}</span>
                            </div>
                            {visit.status === 'pending' && (
                              <div className="flex gap-1.5 pt-1">
                                <button onClick={() => handleUpdateVisitStatus(visit.id, 'confirmed')} className="flex-1 py-1 text-[8px] font-black uppercase bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer">✓ Confirmar</button>
                                <button onClick={() => handleUpdateVisitStatus(visit.id, 'cancelled')} className="flex-1 py-1 text-[8px] font-black uppercase bg-gray-100 text-gray-500 rounded hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">✕ Cancelar</button>
                              </div>
                            )}
                            {visit.status === 'confirmed' && (
                              <button onClick={() => handleUpdateVisitStatus(visit.id, 'done')} className="w-full py-1 text-[8px] font-black uppercase bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors cursor-pointer">✓ Marcar como Realizada</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-100 shadow-sm mb-4">
                <Info className="w-6 h-6 text-gray-200" />
              </div>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Painel CRM</p>
            </div>
          )}
        </div>

      </div>
    </div>

    {/* Visit Scheduler Modal */}
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
    </>
  );
}

function FilterButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border-2 shrink-0 uppercase tracking-tighter cursor-pointer",
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
        "flex flex-row items-center justify-center p-3 bg-white border-2 rounded-md transition-all gap-2.5 shadow-sm group font-black uppercase tracking-tighter text-[10px] cursor-pointer",
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
  if (!isOpen) return null;

  const HORARIOS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Agendar Visita</h3>
            <p className="text-[10px] text-purple-600 font-bold">{contactName || 'Lead'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Property selector */}
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Imóvel da Visita *</p>
            <select
              value={form.propertyId}
              onChange={(e) => {
                const p = agentProperties.find(x => x.id === e.target.value);
                setForm((f: any) => ({ ...f, propertyId: e.target.value, propertyTitle: p?.title || '' }));
              }}
              className="w-full p-3 text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-800"
            >
              <option value="">Selecione um imóvel...</option>
              {agentProperties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Data da Visita *</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm flex justify-center">
              <CalendarUI
                mode="single"
                selected={form.date}
                onSelect={(date) => setForm((f: any) => ({ ...f, date }))}
                disabled={(date) => { const today = new Date(); today.setHours(0,0,0,0); return date <= today || date.getDay() === 0; }}
                className="rounded-md border-0"
              />
            </div>
          </div>

          {/* Time */}
          {form.date && (
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Horário *</p>
              <div className="grid grid-cols-5 gap-1.5">
                {HORARIOS.map(h => (
                  <button
                    key={h}
                    onClick={() => setForm((f: any) => ({ ...f, time: h }))}
                    className={cn(
                      'py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer',
                      form.time === h ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Nota Interna (opcional)</p>
            <textarea
              value={form.notes}
              onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
              placeholder="Ex: Cliente prefere tarde..."
              className="w-full h-16 p-3 text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !form.date || !form.time || !form.propertyId}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-wide shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Send className="w-4 h-4" /> Confirmar Agendamento</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
