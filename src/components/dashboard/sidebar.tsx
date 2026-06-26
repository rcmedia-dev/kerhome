'use client';

import { Home, Heart, BarChart3, Eye, Settings, Store, MessageCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import SoftMenuItem from '@/components/soft-menu-item';
import { CanSeeIt } from '@/components/can';
import { useChatStore } from '@/lib/store/chat-store';

interface DashboardSidebarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    propertyCount: number;
    favoriteCount: number;
    invoiceCount: number;
    viewCount: number;
    userAgency?: any;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function DashboardSidebar({
    activeTab,
    setActiveTab,
    propertyCount,
    favoriteCount,
    invoiceCount,
    viewCount,
    userAgency,
    isCollapsed,
    onToggleCollapse
}: DashboardSidebarProps) {
    const { totalUnreadCount } = useChatStore();

    const menuItems = [
        { id: 'properties', label: 'Minhas Propriedades', icon: Home, badge: propertyCount },
        { id: 'favorites', label: 'Favoritas', icon: Heart, badge: favoriteCount },
        { id: 'messages', label: 'Mensagens', icon: MessageCircle, badge: totalUnreadCount > 0 ? totalUnreadCount : undefined },
        { id: 'visits', label: 'Visitas', icon: Calendar },
        { id: 'invoices', label: 'Faturas', icon: BarChart3, badge: invoiceCount },
        { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    // Adicionar Aba de Gestão da Agência se estiver aprovada
    if (userAgency && userAgency.status === 'approved') {
        menuItems.splice(menuItems.findIndex(i => i.id === 'settings'), 0, {
            id: 'agency',
            label: 'Minha Agência',
            icon: Store
        });
    }

    return (
        <aside className={cn(
            "bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0 lg:h-full lg:sticky lg:top-0 z-40 transition-all duration-300 relative",
            isCollapsed ? "w-full lg:w-20" : "w-full lg:w-72"
        )}>
            {/* Toggle Button */}
            <button
                onClick={onToggleCollapse}
                className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-orange-500 text-white rounded-full items-center justify-center shadow-lg hover:bg-orange-600 hover:scale-110 transition-all z-50 cursor-pointer border-2 border-white"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar bg-white shadow-sm rounded-3xl m-2">
                {menuItems.map((item, index) => {
                    const isProtected = item.id === 'invoices' || item.id === 'views';
                    const menuItem = (
                        <SoftMenuItem
                            key={item.id}
                            item={item}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            index={index}
                            isCollapsed={isCollapsed}
                        />
                    );
                    if (isProtected) return <CanSeeIt key={item.id}>{menuItem}</CanSeeIt>;
                    return menuItem;
                })}

                {!isCollapsed && (
                    <>
                        <div className="pt-4 space-y-3">
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-4 text-white shadow-lg">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Publicidade</p>
                                <h4 className="text-sm font-bold mt-1">Destaque seu imóvel</h4>
                                <p className="text-[11px] opacity-90 mt-1">Aumente suas visualizações com o impulsionamento da Kercasa.</p>
                                <button className="mt-3 px-3 py-1.5 bg-white text-purple-700 rounded-lg text-[11px] font-bold hover:bg-purple-50 transition-all">
                                    Saber Mais
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl p-4 text-white shadow-lg">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Publicidade</p>
                                <h4 className="text-sm font-bold mt-1">Torne-se Agente</h4>
                                <p className="text-[11px] opacity-90 mt-1">Cadastre imóveis e gerencie suas vendas na Kercasa.</p>
                                <button className="mt-3 px-3 py-1.5 bg-white text-orange-600 rounded-lg text-[11px] font-bold hover:bg-orange-50 transition-all">
                                    Ativar Agora
                                </button>
                            </div>
                        </div>
                    </>
                )}

            </nav>
        </aside>
    );
}

