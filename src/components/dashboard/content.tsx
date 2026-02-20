import { motion, AnimatePresence, Variants, Easing } from 'framer-motion';
import { MinhasPropriedades, Favoritas, Faturas, PropriedadesMaisVisualizadas } from '@/components/dashboard-tabs-content';
import PropriedadesImpulsionadasDashboard from '@/components/boosted-properties';
import { ConfiguracoesConta } from '@/components/account-setting';
import type { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import type { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import type { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';

interface DashboardContentProps {
    activeTab: string;
    user: any;
    userProperties: TPropertyResponseSchema[] | null;
    userFavoriteProperties: TFavoritedPropertyResponseSchema[] | null;
    userInvoices: Fatura[] | null;
    mostViewed: TMyPropertiesWithViews | null;
    isLoading?: boolean;
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
    isLoading,
}: DashboardContentProps) {
    return (
        <div className="lg:col-span-9 order-2 lg:order-1 h-full">
            <div className="h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-md p-6 lg:p-8 shadow-sm border border-gray-200 h-full min-h-[calc(100vh-3rem)]"
                    >
                        {activeTab === 'properties' && <MinhasPropriedades userProperties={isLoading ? null : userProperties} />}
                        {activeTab === 'favorites' && <Favoritas userFavoriteProperties={isLoading ? null : userFavoriteProperties} />}
                        {activeTab === 'invoices' && <Faturas invoices={isLoading ? null : userInvoices} />}
                        {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={isLoading ? null : mostViewed} />}
                        {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                        {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
