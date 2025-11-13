'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Store & Actions
import { useUserStore } from '@/lib/store/user-store';
import { getPropertyById, getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { fetchPacotesFromSupabase, addPropertiesToBoost, createFatura } from '@/lib/functions/supabase-actions/boost-functions';
import { PacoteDestaque, TabType } from '@/lib/types/defaults';
import { NavigationTabs } from '../components/navigation-tabs';
import { PropertySelectionModal } from '../components/property-selection-modal';
import { getDefaultPacotes, mapPacotesFromSupabase } from '@/lib/types/utils';
import PageHeader from '../components/page-header';
import ImoveisTab from '../components/imoveis-tab';
import PacotesTab from '../components/pacotes-tab';
import ResumoTab from '../components/resumo-tab';
import ProgressSidebar from '../components/progress-sidebar';





export default function CompactPacotesDestaquePage() {
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<TPropertyResponseSchema[]>([]);
  const [pacotes, setPacotes] = useState<PacoteDestaque[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedPacote, setSelectedPacote] = useState<PacoteDestaque | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('imoveis');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedProperties, setModalSelectedProperties] = useState<string[]>([]);

  const propertyId = searchParams.get('id');

  useEffect(() => {
    if (user) {
      loadUserProperties();
      loadPacotes();
    }
  }, [user]);

  useEffect(() => {
    if (propertyId && properties.length > 0) {
      const propertyExists = properties.find(p => p.id === propertyId);
      if (propertyExists && !selectedProperties.includes(propertyId)) {
        setSelectedProperties([propertyId]);
        toast.success('Imóvel selecionado automaticamente');
        setTimeout(() => setActiveTab('pacotes'), 1000);
      }
    }
  }, [propertyId, properties, selectedProperties]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await getSupabaseUserProperties(user!.id);
      setProperties(userProperties);

      if (propertyId) {
        const specificProperty = await getPropertyById(propertyId);
        if (specificProperty) {
          const userOwnsProperty = userProperties.some(p => p.id === propertyId);
          if (!userOwnsProperty) {
            toast.error('Este imóvel não pertence ao seu usuário');
          }
        } else {
          toast.error('Imóvel não encontrado ou não está aprovado');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar seus imóveis');
    }
  };

  const loadPacotes = async () => {
    try {
      const pacotesData = await fetchPacotesFromSupabase();
      
      if (pacotesData) {
        const mappedPacotes = mapPacotesFromSupabase(pacotesData);
        setPacotes(mappedPacotes);
      } else {
        setPacotes(getDefaultPacotes());
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast.error('Erro ao carregar pacotes de destaque');
      setPacotes(getDefaultPacotes());
    } finally {
      setLoading(false);
    }
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => prev.includes(propertyId) 
      ? prev.filter(id => id !== propertyId) 
      : [...prev, propertyId]
    );
  };

  const toggleModalPropertySelection = (propertyId: string) => {
    setModalSelectedProperties(prev => prev.includes(propertyId) 
      ? prev.filter(id => id !== propertyId) 
      : [...prev, propertyId]
    );
  };

  const openModal = () => {
    setModalSelectedProperties([...selectedProperties]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalSelectedProperties([]);
  };

  const addSelectedProperties = () => {
    setSelectedProperties([...modalSelectedProperties]);
    toast.success(`${modalSelectedProperties.length} imóvel(s) adicionado(s) para destaque`);
    closeModal();
  };

  const handleCheckout = async () => {
    if (!selectedPacote) return toast.error('Selecione um pacote de destaque');
    if (selectedProperties.length === 0) return toast.error('Selecione pelo menos um imóvel');
    
    setProcessing(true);

    try {
      const planoValido = pacotes.some(pacote => pacote.id === selectedPacote.id);
      
      if (!planoValido) {
        toast.error('Plano selecionado não é válido');
        return;
      }

      await addPropertiesToBoost(selectedProperties, selectedPacote.id);
      
      const total = selectedPacote.preco * selectedProperties.length;
      const servico = `Destaque - ${selectedPacote.nome} (${selectedPacote.dias} dias) para ${selectedProperties.length} imóvel(is)`;
      
      await createFatura(user!.id, total, servico);

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">✅ Destaque ativado com sucesso!</span>
          <span>{selectedProperties.length} imóvel(es) destacado(s)</span>
          <span>Plano: {selectedPacote.nome} - {selectedPacote.dias} dias</span>
          <span>Total: {total.toLocaleString('pt-AO')} Kz</span>
        </div>
      );

      setSelectedProperties([]);
      setSelectedPacote(null);
      setActiveTab('imoveis');

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Erro ao processar destaque:', error);
      toast.error('Erro ao ativar destaque. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const total = selectedPacote ? selectedPacote.preco * selectedProperties.length : 0;
  const specificProperty = propertyId ? properties.find(p => p.id === propertyId) : null;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <PageHeader specificProperty={specificProperty ?? null} />

          {/* Navigation Tabs */}
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedPropertiesCount={selectedProperties.length}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'imoveis' && (
                <ImoveisTab
                  specificProperty={specificProperty ?? null}
                  properties={properties}
                  selectedProperties={selectedProperties}
                  onToggleProperty={togglePropertySelection}
                  onOpenModal={openModal}
                  onClearAll={() => setSelectedProperties([])}
                />
              )}

              {activeTab === 'pacotes' && (
                <PacotesTab
                  pacotes={pacotes}
                  selectedPacote={selectedPacote}
                  onSelectPacote={setSelectedPacote}
                />
              )}

              {activeTab === 'resumo' && (
                <ResumoTab
                  selectedPacote={selectedPacote}
                  selectedProperties={selectedProperties}
                  total={total}
                  processing={processing}
                  onCheckout={handleCheckout}
                />
              )}
            </div>

            {/* Sidebar */}
            <ProgressSidebar
              selectedProperties={selectedProperties}
              selectedPacote={selectedPacote}
              total={total}
            />
          </div>
        </div>
      </div>

      {/* Property Selection Modal */}
      <PropertySelectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        properties={properties}
        selectedProperties={modalSelectedProperties}
        onToggleProperty={toggleModalPropertySelection}
        onAddSelected={addSelectedProperties}
      />
    </>
  );
}


