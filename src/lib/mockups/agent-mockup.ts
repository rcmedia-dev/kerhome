import { mockProperties } from "./properties-mockup";

export const mockAgents = [
  {
    id: 'agent-1',
    nome: 'Carlos Mateus',
    email: 'carlos@imobiliaria.ao',
    telefone: '923456789',
    pacote_agente: 'Premium',
    avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=400&q=80',
    propriedades: [mockProperties[0]],
  },
  {
    id: 'agent-2',
    nome: 'Sandra Mário',
    email: 'sandra@casas.ao',
    telefone: '923111222',
    pacote_agente: 'Padrão',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80',
    propriedades: [mockProperties[1]],
  },
  {
    id: 'agent-3',
    nome: 'Eduardo Pedro',
    email: 'eduardo@vendas.ao',
    telefone: '924999888',
    pacote_agente: 'Básico',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    propriedades: [mockProperties[2]],
  },
];
