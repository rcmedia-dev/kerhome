'use client';

import { Home, Heart, BarChart3, Settings, Store, MessageCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanSeeIt } from '@/components/can';
import { useChatStore } from '@/lib/store/chat-store';
import { motion } from 'framer-motion';

interface DashboardSidebarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    propertyCount: number;
    favoriteCount: number;
    invoiceCount: number;
    viewCount: number;
    visitCount?: number;
    isAgent?: boolean;
    userAgency?: any;
    isCollapsed?: boolean;
}

export function DashboardSidebar({
    activeTab,
    setActiveTab,
    propertyCount,
    favoriteCount,
    invoiceCount,
    viewCount,
    visitCount = 0,
    isAgent = false,
    userAgency,
    isCollapsed = false
}: DashboardSidebarProps) {
    const { totalUnreadCount } = useChatStore();

    const menuItems = [
        { id: 'properties', label: 'Propriedades', icon: Home, badge: propertyCount },
        { id: 'favorites', label: 'Favoritas', icon: Heart, badge: favoriteCount },
        { id: 'messages', label: 'Mensagens', icon: MessageCircle, badge: !isAgent && totalUnreadCount > 0 ? totalUnreadCount : undefined },
        { id: 'visits', label: 'Visitas', icon: Calendar, badge: visitCount > 0 ? visitCount : undefined },
        { id: 'invoices', label: 'Faturas', icon: BarChart3, badge: invoiceCount },
        { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
        { id: 'settings', label: 'Definições', icon: Settings },
    ];

    if (userAgency && userAgency.status === 'approved') {
        menuItems.splice(menuItems.findIndex(i => i.id === 'settings'), 0, {
            id: 'agency',
            label: 'Agência',
            icon: Store
        });
    }

    return (
        <aside className={cn(
            "bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0 lg:h-full lg:sticky lg:top-0 z-40 transition-all duration-300 relative",
            isCollapsed ? "w-full lg:w-20" : "w-full lg:w-32"
        )}>
            <nav
                aria-label="Menu do painel"
                className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar bg-white shadow-sm rounded-3xl m-2"
            >
                {menuItems.map((item, index) => {
                    const isActive = activeTab === item.id;
                    const menuItem = (
                        <motion.button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * index, duration: 0.25 }}
                            whileTap={{ scale: 0.97 }}
                            aria-current={isActive ? 'page' : undefined}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "relative w-full min-h-[44px] flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl cursor-pointer select-none transition-all duration-200 border",
                                isActive
                                    ? "bg-purple-50/80 text-purple-700 border-purple-100"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                            )}
                        >
                            <span
                                className={cn(
                                    "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
                                    isActive
                                        ? "bg-gradient-to-br from-purple-600 to-orange-500 text-white shadow-md shadow-purple-200"
                                        : "bg-gray-100 text-gray-400"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full ring-2 ring-white">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </span>
                            {!isCollapsed && (
                                <span className={cn(
                                    "text-[10px] font-bold leading-tight text-center w-full break-words",
                                    isActive ? "text-purple-700" : "text-gray-500"
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </motion.button>
                    );

                    const isProtected = item.id === 'invoices' || item.id === 'views';
                    if (isProtected) return <CanSeeIt key={item.id}>{menuItem}</CanSeeIt>;
                    return menuItem;
                })}
            </nav>
        </aside>
    );
}
