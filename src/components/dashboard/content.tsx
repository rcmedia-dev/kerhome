'use client';

import { motion, AnimatePresence, Variants, Easing } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MinhasPropriedades, Favoritas, Faturas, PropriedadesMaisVisualizadas, VisitasAgendadas } from '@/components/dashboard-tabs-content';
import { AgencyManagement } from './agency-management';
import { StatsTab } from './stats-tab';
import { MessagesTab } from './messages-tab';
import PropriedadesImpulsionadasDashboard from '@/components/boosted-properties';
import { ConfiguracoesConta } from '@/components/account-setting';
import type { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import type { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/property-views-actions';

interface DashboardContentProps {
    activeTab: string;
    user: any;
    userProperties: TPropertyResponseSchema[] | null;
    userFavoriteProperties: TPropertyResponseSchema[] | null;
    userInvoices: Fatura[] | null;
    mostViewed: TMyPropertiesWithViews | null;
    userAgency: any;
    isLoading?: boolean;
    isFullWidth?: boolean;
}

const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as Easing } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

export function DashboardContent({
    activeTab,
    user,
    userProperties,
    userFavoriteProperties,
    userInvoices,
    mostViewed,
    userAgency,
    isLoading,
    isFullWidth,
}: DashboardContentProps) {
    const personalProperties = userProperties?.filter(p => !p.imobiliaria_id) || [];
    const agencyProperties = userProperties?.filter(p => p.imobiliaria_id === userAgency?.id) || [];

    return (
        <div className={cn(
            isFullWidth ? "md:col-span-12 h-full flex flex-col min-h-0" : "md:col-span-9 h-full flex flex-col min-h-0",
            "order-2 md:order-1"
        )}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={cn(
                        "w-full h-full flex flex-col min-h-0",
                        isFullWidth ? "bg-transparent border-none p-0" : "bg-white rounded-card-lg p-4 lg:p-8 shadow-card border border-border overflow-y-auto custom-scrollbar"
                    )}
                >
                    {activeTab === 'properties' && <MinhasPropriedades userProperties={isLoading ? null : personalProperties} />}
                    {activeTab === 'favorites' && <Favoritas userFavoriteProperties={isLoading ? null : userFavoriteProperties} />}
                    {activeTab === 'invoices' && <Faturas invoices={isLoading ? null : userInvoices} />}
                    { activeTab === 'stats' && <StatsTab user={user} ownerId={user?.id} mostViewedProperties={isLoading ? null : mostViewed} /> }
                    { activeTab === 'agency' && <AgencyManagement agency={userAgency} agencyProperties={isLoading ? null : agencyProperties} /> }
                    { activeTab === 'settings' && <ConfiguracoesConta profile={user} /> }
                    { activeTab === 'messages' && <MessagesTab /> }
                    { activeTab === 'visits' && <VisitasAgendadas userId={user?.id} /> }
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
