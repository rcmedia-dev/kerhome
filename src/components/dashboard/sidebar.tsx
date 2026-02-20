import { Home, Heart, BarChart3, Eye, Rocket, Settings, LayoutGrid } from 'lucide-react';
import SoftMenuItem from '@/components/soft-menu-item';
import { CanSeeIt } from '@/components/can';

interface DashboardSidebarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    propertyCount: number;
    favoriteCount: number;
    invoiceCount: number;
    viewCount: number;
}

export function DashboardSidebar({
    activeTab,
    setActiveTab,
    propertyCount,
    favoriteCount,
    invoiceCount,
    viewCount,
}: DashboardSidebarProps) {
    const menuItems = [
        { id: 'properties', label: 'Minhas Propriedades', icon: Home, badge: propertyCount },
        { id: 'favorites', label: 'Favoritas', icon: Heart, badge: favoriteCount },
        { id: 'invoices', label: 'Faturas', icon: BarChart3, badge: invoiceCount },
        { id: 'views', label: 'Visualizações', icon: Eye, badge: viewCount },
        { id: 'boost', label: 'Impulsionadas', icon: Rocket },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className="w-full lg:w-72 bg-white/80 backdrop-blur-md border-r border-gray-100 flex flex-col shrink-0 lg:h-screen lg:sticky lg:top-0 z-40">
            <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, index) => {
                    const isProtected = item.id === 'invoices' || item.id === 'views';
                    const menuItem = (
                        <SoftMenuItem
                            key={item.id}
                            item={item}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            index={index}
                        />
                    );
                    if (isProtected) return <CanSeeIt key={item.id}>{menuItem}</CanSeeIt>;
                    return menuItem;
                })}

                <div className="mt-auto pt-4 space-y-4">
                    {/* Ad Block 1 - Premium Plan */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative overflow-hidden group cursor-pointer shadow-lg">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Rocket className="w-16 h-16" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-1">Seja Premium</h3>
                            <p className="text-[10px] text-purple-100 leading-tight mb-2">
                                Destaque seus imóveis e venda 3x mais rápido.
                            </p>
                            <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-medium w-fit backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                Ver Planos
                            </div>
                        </div>
                    </div>

                    {/* Ad Block 2 - Mobile App */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-orange-50 to-red-500 text-white relative overflow-hidden group cursor-pointer shadow-lg">
                        <div className="absolute -bottom-2 -right-2 p-2 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                            <LayoutGrid className="w-16 h-16" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-1">Baixe o App</h3>
                            <p className="text-[10px] text-orange-100 leading-tight mb-2">
                                Gerencie seus negócios em qualquer lugar.
                            </p>
                            <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-medium w-fit backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                Download
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
