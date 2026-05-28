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
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as Easing } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25 } }
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
    const personalProperties = userProperties;
    const agencyProperties = userProperties ? userProperties.filter(p => p.imobiliaria_id === userAgency?.id) : null;

    return (
        // On mobile: full width, natural height (scrolled by parent).
        // On lg: col-span-9 or 12, fixed height with inner scroll.
        <div className={cn(
            isFullWidth ? 'lg:col-span-12' : 'lg:col-span-9',
            activeTab === 'messages' ? 'h-full lg:h-full' : 'flex-1 lg:h-full',
            'flex flex-col min-h-0'
        )}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={cn(
                        'w-full flex flex-col flex-1',
                        isFullWidth
                            ? 'bg-transparent border-none p-0 min-h-0'
                            : 'bg-white rounded-card-lg p-3 sm:p-5 lg:p-6 shadow-card border border-border lg:h-full lg:overflow-y-auto custom-scrollbar'
                    )}
                >
                    {activeTab === 'properties' && <MinhasPropriedades userProperties={personalProperties} />}
                    {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties} />}
                    {activeTab === 'invoices' && <Faturas invoices={userInvoices} />}
                    {activeTab === 'stats' && <StatsTab user={user} ownerId={user?.id} mostViewedProperties={mostViewed} />}
                    {activeTab === 'agency' && <AgencyManagement agency={userAgency} agencyProperties={agencyProperties} />}
                    {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
                    {activeTab === 'messages' && <MessagesTab />}
                    {activeTab === 'visits' && <VisitasAgendadas userId={user?.id} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
