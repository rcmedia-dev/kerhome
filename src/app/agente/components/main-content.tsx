import { Card } from "@/components/ui/card";
import { PropertiesTab } from "@/app/agente/components/properties-tab";
import { AboutTab } from "@/app/agente/components/about-tabs";
import type { MainContentProps, AgentProperty, AgentProfile } from "@/types/agent";

export function MainContent({
  activeTab,
  setActiveTab,
  profile,
  agentProperties,
  agentStats,
  onOpenMessageBox
}: MainContentProps) {
  return (
    <div className="pt-5 lg:w-2/3">
      {/* Abas */}
      <Card className="p-2 mb-8 shadow-lg border-0 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm">
        <div className="flex gap-2">
          <button 
            className={`flex-1 py-3 px-4 rounded-xl text-center transition-all duration-300 ${
              activeTab === 'properties' 
                ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
            onClick={() => setActiveTab('properties')}
          >
              <div className="font-semibold">Portfólio de Imóveis</div>
              <div className="text-sm opacity-80">({agentProperties?.length || 0} disponíveis)</div>
          </button>
          <button 
            className={`flex-1 py-3 px-4 rounded-xl text-center transition-all duration-300 ${
              activeTab === 'about' 
                ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
            onClick={() => setActiveTab('about')}
          >
            <div className="font-semibold">Minha História</div>
            <div className="text-sm opacity-80">Conheça meu trabalho</div>
          </button>
        </div>
      </Card>

      {/* Conteúdo das abas */}
      {activeTab === 'properties' && (
        <PropertiesTab 
          agentProperties={agentProperties}
          onOpenMessageBox={onOpenMessageBox}
        />
      )}

      {activeTab === 'about' && (
        <AboutTab 
          profile={profile}
          agentStats={agentStats}
        />
      )}
    </div>
  );
}