'use client';

import React, { useState } from 'react';
import { Home, ArrowLeft, FileText, Shield, Users, AlertCircle, CheckCircle2, Scale, Globe } from 'lucide-react';

export default function KerHomeTerms() {
  const [activeSection, setActiveSection] = useState('geral');

  const sections = [
    { id: 'geral', title: 'Disposições Gerais', icon: <FileText className="w-5 h-5" /> },
    { id: 'usuario', title: 'Conta do Usuário', icon: <Users className="w-5 h-5" /> },
    { id: 'servicos', title: 'Serviços', icon: <Home className="w-5 h-5" /> },
    { id: 'privacidade', title: 'Privacidade', icon: <Shield className="w-5 h-5" /> },
    { id: 'responsabilidades', title: 'Responsabilidades', icon: <Scale className="w-5 h-5" /> },
    { id: 'pagamentos', title: 'Pagamentos', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'restricoes', title: 'Restrições', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'jurisdicao', title: 'Jurisdição', icon: <Globe className="w-5 h-5" /> }
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
                  Termos e Condições de Uso
                </h1>
                <p className="text-lg text-gray-600">
                  Bem-vindo ao KerHome. Ao usar nossa plataforma, você concorda com os seguintes termos e condições.
                </p>
              </div>

              {/* Disposições Gerais */}
              <section id="geral" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-700" />
                  1. Disposições Gerais
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>1.1</strong> O KerHome é uma plataforma digital que conecta compradores, vendedores e agentes imobiliários em Angola e internacionalmente.
                  </p>
                  <p>
                    <strong>1.2</strong> Estes termos constituem um acordo legal entre você e a KerHome, Lda., empresa registrada em Angola.
                  </p>
                  <p>
                    <strong>1.3</strong> Ao acessar ou usar nossos serviços, você confirma que tem pelo menos 18 anos e capacidade legal para celebrar contratos.
                  </p>
                  <p>
                    <strong>1.4</strong> Reservamos o direito de modificar estes termos a qualquer momento, com notificação prévia de 30 dias.
                  </p>
                </div>
              </section>

              {/* Conta do Usuário */}
              <section id="usuario" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-500" />
                  2. Conta do Usuário
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>2.1</strong> Para usar determinados recursos, você deve criar uma conta fornecendo informações precisas e atualizadas.
                  </p>
                  <p>
                    <strong>2.2</strong> Você é responsável por manter a confidencialidade das suas credenciais de acesso.
                  </p>
                  <p>
                    <strong>2.3</strong> Agentes imobiliários devem fornecer documentação válida de licenciamento profissional.
                  </p>
                  <p>
                    <strong>2.4</strong> Contas inativas por mais de 12 meses podem ser suspensas ou removidas.
                  </p>
                  <p>
                    <strong>2.5</strong> É proibido criar múltiplas contas para o mesmo usuário ou empresa.
                  </p>
                </div>
              </section>

              {/* Serviços */}
              <section id="servicos" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Home className="w-6 h-6 text-purple-700" />
                  3. Serviços da Plataforma
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>3.1</strong> O KerHome oferece uma plataforma para listar, pesquisar e facilitar transações imobiliárias.
                  </p>
                  <p>
                    <strong>3.2</strong> Fornecemos ferramentas para agentes imobiliários, incluindo gestão de clientes e análise de mercado.
                  </p>
                  <p>
                    <strong>3.3</strong> Não somos parte das transações entre usuários, atuando apenas como intermediários tecnológicos.
                  </p>
                  <p>
                    <strong>3.4</strong> Todos os imóveis listados passam por verificação básica, mas não garantimos a veracidade de todas as informações.
                  </p>
                  <p>
                    <strong>3.5</strong> Serviços premium podem estar sujeitos a taxas adicionais conforme tabela de preços.
                  </p>
                </div>
              </section>

              {/* Privacidade */}
              <section id="privacidade" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-500" />
                  4. Privacidade e Proteção de Dados
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>4.1</strong> Coletamos e processamos dados pessoais conforme nossa Política de Privacidade.
                  </p>
                  <p>
                    <strong>4.2</strong> Dados são protegidos por medidas de segurança técnicas e organizacionais adequadas.
                  </p>
                  <p>
                    <strong>4.3</strong> Não vendemos dados pessoais a terceiros sem consentimento explícito.
                  </p>
                  <p>
                    <strong>4.4</strong> Usuários têm direito de acessar, corrigir ou excluir seus dados pessoais.
                  </p>
                  <p>
                    <strong>4.5</strong> Cumprimos as leis angolanas e internacionais aplicáveis de proteção de dados.
                  </p>
                </div>
              </section>

              {/* Responsabilidades */}
              <section id="responsabilidades" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Scale className="w-6 h-6 text-purple-700" />
                  5. Responsabilidades
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>5.1</strong> Usuários são responsáveis pela veracidade das informações fornecidas.
                  </p>
                  <p>
                    <strong>5.2</strong> Agentes devem cumprir todas as regulamentações profissionais aplicáveis.
                  </p>
                  <p>
                    <strong>5.3</strong> O KerHome não se responsabiliza por disputas entre usuários.
                  </p>
                  <p>
                    <strong>5.4</strong> Não garantimos a disponibilidade ininterrupta dos serviços.
                  </p>
                  <p>
                    <strong>5.5</strong> Usuários devem reportar imediatamente qualquer uso não autorizado de suas contas.
                  </p>
                </div>
              </section>

              {/* Pagamentos */}
              <section id="pagamentos" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-500" />
                  6. Pagamentos e Taxas
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>6.1</strong> Serviços básicos da plataforma são gratuitos para usuários finais.
                  </p>
                  <p>
                    <strong>6.2</strong> Agentes podem estar sujeitos a taxas de comissão conforme acordo comercial.
                  </p>
                  <p>
                    <strong>6.3</strong> Pagamentos são processados através de parceiros seguros e certificados.
                  </p>
                  <p>
                    <strong>6.4</strong> Reembolsos são processados conforme política específica de cada serviço.
                  </p>
                  <p>
                    <strong>6.5</strong> Todas as taxas são apresentadas claramente antes da contratação.
                  </p>
                </div>
              </section>

              {/* Restrições */}
              <section id="restricoes" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-purple-700" />
                  7. Restrições e Uso Proibido
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>7.1</strong> É proibido usar a plataforma para atividades ilegais ou fraudulentas.
                  </p>
                  <p>
                    <strong>7.2</strong> Não é permitido spam, assédio ou comportamento abusivo.
                  </p>
                  <p>
                    <strong>7.3</strong> Proibido tentar contornar medidas de segurança da plataforma.
                  </p>
                  <p>
                    <strong>7.4</strong> Não é permitido copiar, modificar ou distribuir conteúdo da plataforma sem autorização.
                  </p>
                  <p>
                    <strong>7.5</strong> Violações podem resultar em suspensão ou encerramento da conta.
                  </p>
                </div>
              </section>

              {/* Jurisdição */}
              <section id="jurisdicao" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-orange-500" />
                  8. Jurisdição e Lei Aplicável
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>8.1</strong> Estes termos são regidos pelas leis da República de Angola.
                  </p>
                  <p>
                    <strong>8.2</strong> Disputas serão resolvidas preferencialmente através de mediação.
                  </p>
                  <p>
                    <strong>8.3</strong> Foro competente: Comarca de Luanda, Angola.
                  </p>
                  <p>
                    <strong>8.4</strong> Para usuários internacionais, aplicam-se também as leis locais relevantes.
                  </p>
                  <p>
                    <strong>8.5</strong> Alterações nos termos entram em vigor após período de notificação.
                  </p>
                </div>
              </section>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato para Questões Legais</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> legal@kerhome.ao</p>
                  <p><strong>Telefone:</strong> +244 900 000 000</p>
                  <p><strong>Endereço:</strong> Luanda, Angola</p>
                  <p><strong>Horário:</strong> Segunda a Sexta, 8h às 17h</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
                <p>© 2025 KerHome, Lda. Todos os direitos reservados.</p>
                <p className="text-sm mt-2">Documento válido a partir de Janeiro de 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}