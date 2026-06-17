'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, ThumbsDown, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification, deleteAllNotifications, type Notification } from '@/lib/functions/supabase-actions/notifications-actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  agent_rejected: <ThumbsDown className="w-4 h-4 text-red-500" />,
  property_rejected: <XCircle className="w-4 h-4 text-red-500" />,
  agent_approved: <CheckCheck className="w-4 h-4 text-green-500" />,
  property_approved: <CheckCheck className="w-4 h-4 text-green-500" />,
  ai_agent_approved: <CheckCheck className="w-4 h-4 text-green-500" />,
  ai_agent_rejected: <ThumbsDown className="w-4 h-4 text-red-500" />,
  ai_property_approved: <CheckCheck className="w-4 h-4 text-green-500" />,
  ai_property_rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

export function NotificationsPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(userId),
        fetchUnreadCount(userId),
      ]);

      if (isFirstLoadRef.current) {
        seenIdsRef.current = new Set(notifs.map(n => n.id));
        isFirstLoadRef.current = false;
      } else {
        const newUnread = notifs.filter(n => !n.is_read && !seenIdsRef.current.has(n.id));
        newUnread.forEach(n => {
          toast(n.title, {
            description: n.message.split('\n')[0] || n.message,
            duration: 8000,
            action: {
              label: 'Ver',
              onClick: () => {
                setIsOpen(true);
                setExpandedIds(prev => {
                  const next = new Set(prev);
                  next.add(n.id);
                  return next;
                });
              }
            }
          });
          seenIdsRef.current.add(n.id);
        });
        notifs.forEach(n => seenIdsRef.current.add(n.id));
      }

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Erro ao recarregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  // Atualizar quando houver um evento personalizado de nova notificação
  useEffect(() => {
    if (!userId) return;
    const handleNewNotification = () => {
      load(true);
    };
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, [userId]);

  // Poll a cada 30s para notificações novas
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleToggleExpand = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success('Todas as notificações foram marcadas como lidas');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isRead = notifications.find(n => n.id === id)?.is_read;
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    toast.success('Notificação eliminada');
  };

  const handleClearAll = async () => {
    if (confirm('Desejas eliminar todas as notificações?')) {
      await deleteAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Todas as notificações foram eliminadas');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('pt-AO', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Notificações</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Lidas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Eliminar tudo
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 text-center text-gray-400 text-sm">A carregar...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isExpanded = expandedIds.has(notif.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleToggleExpand(notif.id, notif.is_read)}
                      className={`group relative w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notif.is_read ? 'bg-purple-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 pr-8">
                        <div className="mt-0.5 shrink-0">
                          {typeIcons[notif.type] || <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-[11px] text-gray-500 mt-0.5 ${isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {formatTime(notif.created_at)}
                          </span>
                        </div>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      {/* Trash Button */}
                      <button
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="absolute right-3 top-3 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar notificação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
