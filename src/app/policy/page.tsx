'use client';

import React, { useState } from 'react';
import { Home, ArrowLeft, Shield, Eye, Database, Users, Cookie, Globe, Lock, Settings, AlertTriangle, FileText } from 'lucide-react';

export default function KerHomePrivacy() {
  const [activeSection, setActiveSection] = useState('introducao');

  const sections = [
    { id: 'introducao', title: 'Introdução', icon: <Shield className="w-5 h-5" /> },
    { id: 'dados-coletados', title: 'Dados Coletados', icon: <Database className="w-5 h-5" /> },
    { id: 'como-usamos', title: 'Como Usamos', icon: <Eye className="w-5 h-5" /> },
    { id: 'compartilhamento', title: 'Compartilhamento', icon: <Users className="w-5 h-5" /> },
    { id: 'cookies', title: 'Cookies', icon: <Cookie className="w-5 h-5" /> },
    { id: 'seguranca', title: 'Segurança', icon: <Lock className="w-5 h-5" /> },
    { id: 'seus-direitos', title: 'Seus Direitos', icon: <Settings className="w-5 h-5" /> },
    { id: 'menores', title: 'Menores de Idade', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'internacional', title: 'Transferências', icon: <Globe className="w-5 h-5" /> },
    { id: 'alteracoes', title: 'Alterações', icon: <FileText className="w-5 h-5" /> }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-700 to-orange-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
                KerHome
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Última atualização: Janeiro 2025</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegação</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-purple-700 to-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Política de Privacidade
                </h1>
                <p className="text-lg text-gray-600">
                  Esta política descreve como o KerHome coleta, usa e protege suas informações pessoais.
                </p>
              </div>

              {/* Introdução */}
              <section id="introducao" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-700" />
                  1. Introdução
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    O KerHome valoriza sua privacidade e está comprometido em proteger suas informações pessoais. 
                    Esta política explica como coletamos, usamos, compartilhamos e protegemos seus dados quando você 
                    utiliza nossa plataforma de marketplace imobiliário.
                  </p>
                  <p>
                    Esta política se aplica a todos os usuários da plataforma KerHome, incluindo compradores, 
                    vendedores, locadores, locatários e agentes imobiliários.
                  </p>
                  <div className="bg-purple-50 border-l-4 border-purple-700 p-4 rounded-r-lg">
                    <p className="text-purple-800">
                      <strong>Importante:</strong> Ao usar nossos serviços, você concorda com esta política de privacidade. 
                      Se não concordar, não utilize nossa plataforma.
                    </p>
                  </div>
                </div>
              </section>

              {/* Dados Coletados */}
              <section id="dados-coletados" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Database className="w-6 h-6 text-orange-500" />
                  2. Dados Que Coletamos
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Informações Fornecidas por Você</h3>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• <strong>Dados de registro:</strong> nome, email, telefone, endereço</li>
                      <li>• <strong>Informações profissionais:</strong> licenças de agentes, certificações</li>
                      <li>• <strong>Dados de imóveis:</strong> descrições, fotos, localização, preços</li>
                      <li>• <strong>Preferências:</strong> critérios de busca, favoritos, alertas</li>
                      <li>• <strong>Comunicações:</strong> mensagens, comentários, avaliações</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.2 Informações Coletadas Automaticamente</h3>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• <strong>Dados de navegação:</strong> páginas visitadas, tempo de sessão</li>
                      <li>• <strong>Informações técnicas:</strong> endereço IP, tipo de dispositivo, navegador</li>
                      <li>• <strong>Localização:</strong> localização aproximada baseada em IP</li>
                      <li>• <strong>Cookies:</strong> preferências, sessões, análises</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2.3 Dados de Terceiros</h3>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• <strong>Redes sociais:</strong> informações de perfis conectados</li>
                      <li>• <strong>Parceiros:</strong> dados de verificação e validação</li>
                      <li>• <strong>Fontes públicas:</strong> informações de registros públicos</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Como Usamos */}
              <section id="como-usamos" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-purple-700" />
                  3. Como Usamos Seus Dados
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Finalidades Principais</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Criar e gerenciar sua conta na plataforma</li>
                      <li>• Processar e facilitar transações imobiliárias</li>
                      <li>• Conectar compradores, vendedores e agentes</li>
                      <li>• Personalizar sua experiência na plataforma</li>
                      <li>• Enviar notificações sobre imóveis de interesse</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 Comunicação e Marketing</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Enviar atualizações sobre novos imóveis</li>
                      <li>• Comunicar alterações nos serviços</li>
                      <li>• Enviar newsletters e conteúdo promocional</li>
                      <li>• Realizar pesquisas de satisfação</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3.3 Melhorias e Análises</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Analisar uso da plataforma para melhorias</li>
                      <li>• Desenvolver novos recursos e serviços</li>
                      <li>• Gerar relatórios de mercado imobiliário</li>
                      <li>• Detectar e prevenir fraudes</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Compartilhamento */}
              <section id="compartilhamento" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-500" />
                  4. Compartilhamento de Dados
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1 Compartilhamento Autorizado</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Agentes imobiliários:</strong> dados de contato para facilitar transações</li>
                      <li>• <strong>Outros usuários:</strong> informações de perfil público conforme configurações</li>
                      <li>• <strong>Parceiros comerciais:</strong> dados necessários para serviços específicos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Fornecedores de Serviços</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Processadores de pagamento</li>
                      <li>• Serviços de verificação de identidade</li>
                      <li>• Provedores de hospedagem e tecnologia</li>
                      <li>• Serviços de marketing e análise</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4.3 Exigências Legais</h3>
                    <p>
                      Podemos compartilhar dados quando exigido por lei, ordem judicial ou para proteger 
                      direitos, propriedade ou segurança do KerHome e seus usuários.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <p className="text-orange-800">
                      <strong>Garantia:</strong> Nunca vendemos seus dados pessoais a terceiros para fins comerciais.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section id="cookies" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-purple-700" />
                  5. Cookies e Tecnologias Similares
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma.
                  </p>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1 Tipos de Cookies</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Essenciais:</strong> necessários para funcionamento básico</li>
                      <li>• <strong>Funcionais:</strong> lembram preferências e configurações</li>
                      <li>• <strong>Analíticos:</strong> medem desempenho e uso da plataforma</li>
                      <li>• <strong>Marketing:</strong> personalizam anúncios e conteúdo</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2 Gerenciamento de Cookies</h3>
                    <p>
                      Você pode gerenciar cookies através das configurações do seu navegador ou 
                      do nosso painel de preferências de privacidade.
                    </p>
                  </div>
                </div>
              </section>

              {/* Segurança */}
              <section id="seguranca" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-orange-500" />
                  6. Segurança dos Dados
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6.1 Medidas de Proteção</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Criptografia SSL/TLS para transmissão de dados</li>
                      <li>• Criptografia de dados sensíveis em repouso</li>
                      <li>• Controles de acesso rigorosos</li>
                      <li>• Monitoramento contínuo de segurança</li>
                      <li>• Auditorias regulares de segurança</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6.2 Suas Responsabilidades</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Manter credenciais seguras</li>
                      <li>• Usar senhas fortes e únicas</li>
                      <li>• Reportar atividades suspeitas</li>
                      <li>• Fazer logout em dispositivos compartilhados</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-800">
                      <strong>Importante:</strong> Nenhum sistema é 100% seguro. Notificaremos você sobre 
                      qualquer violação de dados que possa afetar suas informações.
                    </p>
                  </div>
                </div>
              </section>

              {/* Seus Direitos */}
              <section id="seus-direitos" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-700" />
                  7. Seus Direitos de Privacidade
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7.1 Direitos Fundamentais</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Acesso:</strong> solicitar cópia dos seus dados</li>
                      <li>• <strong>Correção:</strong> corrigir dados incorretos ou incompletos</li>
                      <li>• <strong>Exclusão:</strong> solicitar remoção dos seus dados</li>
                      <li>• <strong>Portabilidade:</strong> receber dados em formato estruturado</li>
                      <li>• <strong>Restrição:</strong> limitar o processamento dos seus dados</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7.2 Como Exercer Seus Direitos</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Acesse suas configurações de conta</li>
                      <li>• Entre em contato através do email: privacy@kerhome.ao</li>
                      <li>• Ligue para: +244 900 000 000</li>
                      <li>• Responderemos em até 30 dias</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7.3 Opt-out de Marketing</h3>
                    <p>
                      Você pode cancelar o recebimento de comunicações de marketing a qualquer momento 
                      através do link "descadastrar" nos emails ou nas configurações da conta.
                    </p>
                  </div>
                </div>
              </section>

              {/* Menores */}
              <section id="menores" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  8. Menores de Idade
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    O KerHome não coleta intencionalmente dados de menores de 18 anos. 
                    Nossos serviços são destinados apenas a adultos com capacidade legal para contratar.
                  </p>
                  <p>
                    Se descobrirmos que coletamos dados de um menor, tomaremos medidas para 
                    excluir essas informações imediatamente.
                  </p>
                  <p>
                    Pais ou responsáveis que acreditam que um menor forneceu informações 
                    devem entrar em contato conosco imediatamente.
                  </p>
                </div>
              </section>

              {/* Internacional */}
              <section id="internacional" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-purple-700" />
                  9. Transferências Internacionais
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    Seus dados podem ser transferidos e processados fora de Angola quando 
                    necessário para fornecer nossos serviços ou cumprir obrigações legais.
                  </p>
                  <p>
                    Garantimos que todas as transferências internacionais cumprem com as 
                    leis de proteção de dados aplicáveis e usam salvaguardas adequadas.
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">9.1 Países de Destino</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• Estados Unidos (serviços de hospedagem)</li>
                      <li>• União Europeia (processamento de pagamentos)</li>
                      <li>• Outros países conforme expansão de serviços</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Alterações */}
              <section id="alteracoes" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-500" />
                  10. Alterações nesta Política
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    Esta política pode ser atualizada periodicamente para refletir mudanças 
                    em nossos serviços ou requisitos legais.
                  </p>
                  <p>
                    <strong>Notificação de mudanças:</strong> Alterações significativas serão 
                    comunicadas com pelo menos 30 dias de antecedência via email ou notificação na plataforma.
                  </p>
                  <p>
                    <strong>Histórico de versões:</strong> Mantemos um registro de todas as 
                    versões anteriores desta política para sua referência.
                  </p>
                  <p>
                    <strong>Aceitação:</strong> O uso continuado da plataforma após as 
                    alterações constitui aceitação da nova política.
                  </p>
                </div>
              </section>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entre em Contato</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Para questões sobre privacidade ou para exercer seus direitos:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@kerhome.ao</p>
                    <p><strong>Telefone:</strong> +244 900 000 000</p>
                    <p><strong>Endereço:</strong> Luanda, Angola</p>
                    <p><strong>Horário:</strong> Segunda a Sexta, 8h às 17h</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
                <p>© 2025 KerHome, Lda. Todos os direitos reservados.</p>
                <p className="text-sm mt-2">Política válida a partir de Janeiro de 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}