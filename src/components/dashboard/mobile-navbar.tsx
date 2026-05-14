'use client';

import { Home, Heart, MessageCircle, Calendar, Settings, Menu, X, Store, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavbarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    userAgency?: any;
}

export function MobileNavbar({ activeTab, setActiveTab, userAgency }: MobileNavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { id: 'properties', label: 'Propriedades', icon: Home },
        { id: 'favorites', label: 'Favoritas', icon: Heart },
        { id: 'messages', label: 'Mensagens', icon: MessageCircle },
        { id: 'visits', label: 'Visitas', icon: Calendar },
        { id: 'invoices', label: 'Faturas', icon: BarChart3 },
        { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];

    if (userAgency && userAgency.status === 'approved') {
        menuItems.splice(menuItems.findIndex(i => i.id === 'settings'), 0, {
            id: 'agency',
            label: 'Agência',
            icon: Store
        });
    }

    return (
        <div className="lg:hidden w-full bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-sm">K</span>
                </div>
                <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Dashboard</span>
            </div>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-gray-50 rounded-button text-gray-500 hover:bg-gray-100 transition-all"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-2"
                    >
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-button transition-all",
                                    activeTab === item.id ? "bg-purple-50 text-purple-700" : "text-gray-500 active:bg-gray-50"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-bold">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
