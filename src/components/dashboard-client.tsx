// components/dashboard-client.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Variants, Easing } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  MinhasPropriedades,
  Favoritas,
  PropriedadesMaisVisualizadas,
  Faturas,
} from '@/components/dashboard-tabs-content';
import { ConfiguracoesConta } from '@/components/account-setting';
import { PlanoCard } from '@/components/plano-card';
import { CanSeeIt } from '@/components/can';
import { UserCard } from '@/components/user-card';
import { UserAction } from '@/components/user-action';
import PropriedadesImpulsionadasDashboard from '@/components/boosted-properties';
import SoftCard from '@/components/soft-card';
import SoftMenuItem from '@/components/soft-menu-item';
import SoftBackground from '@/components/soft-background';
import { Star, User } from 'lucide-react';





interface DashboardClientProps {
  initialData: {
    user: any;
    userProperties: any[];
    userFavoriteProperties: any[];
    userInvoices: any[];
    mostViewed: any;
    userPlan: any;
    stats: any[];
    displayName: string;
    menuItems: any[];
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState('properties');

  const {
    user,
    userProperties,
    userFavoriteProperties,
    userInvoices,
    mostViewed,
    userPlan,
    stats,
    displayName,
    menuItems
  } = initialData;

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as Easing } 
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 relative">
      <SoftBackground />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <SoftCard delay={0.1} className="mb-8">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                Olá, {displayName} 👋
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm sm:text-base mt-2">
                Gerencie suas propriedades com facilidade
              </CardDescription>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <UserAction 
                isLoading={false}
                isError={false}
                profile={user}
                user={user}
                displayName={displayName}
                queryClient={null} // Remover ou ajustar conforme necessário
                housesRemaining={userPlan?.restante ?? 0}
              />
            </motion.div>
          </CardHeader>
        </SoftCard>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-1">
            {/* User Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <UserCard user={user} displayName={displayName} stats={stats} />
            </motion.div>

            {/* Navigation Menu */}
            <SoftCard className='py-4'>
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-">
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

                  if (isProtected) {
                    return (
                      <CanSeeIt key={item.id}>
                        {menuItem}
                      </CanSeeIt>
                    );
                  }

                  return menuItem;
                })}
              </CardContent>
            </SoftCard>

            {/* Mobile Content */}
            <div className="block lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties} />}
                  {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties} />}
                  {activeTab === 'invoices' && <Faturas invoices={userInvoices} />}
                  {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed} />}
                  {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                  {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Upgrade Section */}
            <CanSeeIt>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <PlanoCard plan={userPlan} userProperties={userProperties.length} />
              </motion.div>

              <SoftCard className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 py-4 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-700 text-lg font-bold flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-2 bg-orange-100 rounded-lg"
                    >
                      <Star className="w-5 h-5 text-orange-500" />
                    </motion.div>
                    Por que fazer upgrade?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.ul 
                    className="space-y-3 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {[
                      "Publique mais imóveis e alcance mais clientes",
                      "Tenha seus anúncios em destaque",
                      "Suporte prioritário e atendimento exclusivo"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-gray-600 text-sm leading-relaxed"
                  >
                    Aproveite todo o potencial da plataforma, aumente sua
                    visibilidade e conquiste mais resultados.
                  </motion.p>
                </CardContent>
              </SoftCard>
            </CanSeeIt>
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:block lg:col-span-8 order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties} />}
                {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties} />}
                {activeTab === 'invoices' && <Faturas invoices={userInvoices} />}
                {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed} />}
                {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}