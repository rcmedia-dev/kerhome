export interface Neighborhood {
    id: string;
    nome: string;
    classificacao: 'premium' | 'medio' | 'popular';
    modeloNome?: string; // Optional if different from 'nome'
}

export const BAIRROS: Neighborhood[] = [
    // --- Premium ---
    { id: 'alvalade', nome: 'Alvalade', classificacao: 'premium' },
    { id: 'miramar', nome: 'Miramar', classificacao: 'premium' },
    { id: 'talatona', nome: 'Talatona', classificacao: 'premium' },
    { id: 'ilha', nome: 'Ilha do Cabo', classificacao: 'premium', modeloNome: 'Ilha Do Cabo' },
    { id: 'maculusso', nome: 'Maculusso', classificacao: 'premium' },
    { id: 'kinaxixi', nome: 'Kinaxixi', classificacao: 'premium' },
    { id: 'ingombota', nome: 'Ingombota', classificacao: 'premium' },
    { id: 'cruzeiro', nome: 'Cruzeiro', classificacao: 'premium' },
    { id: 'mussulo', nome: 'Mussulo', classificacao: 'premium' },
    { id: 'futungo', nome: 'Futungo de Belas', classificacao: 'premium', modeloNome: 'Futungo De Belas' },
    { id: 'corimba', nome: 'Corimba', classificacao: 'premium' },

    // --- Médio ---
    { id: 'benfica', nome: 'Benfica / Patriota', classificacao: 'medio', modeloNome: 'Benfica (Inclui Lar Do Patriota)' },
    { id: 'novavida', nome: 'Nova Vida', classificacao: 'medio', modeloNome: 'Nova Vida - Golfe' },
    { id: 'camama', nome: 'Camama', classificacao: 'medio' },
    { id: 'kilamba', nome: 'Kilamba', classificacao: 'medio' },
    { id: 'maianga', nome: 'Maianga', classificacao: 'medio' },
    { id: 'morrobento', nome: 'Morro Bento', classificacao: 'medio' },
    { id: 'samba', nome: 'Samba', classificacao: 'medio' },
    { id: 'vilaalice', nome: 'Vila Alice', classificacao: 'medio', modeloNome: 'Vila Alice (Nelito Soares)' },
    { id: 'valodia', nome: 'Comandante Valódia', classificacao: 'medio', modeloNome: 'Comandante Valódia (Combatentes)' },
    { id: 'bairroazul', nome: 'Bairro Azul', classificacao: 'medio' },
    { id: 'cassenda', nome: 'Cassenda', classificacao: 'medio' },

    // --- Popular ---
    { id: 'viana', nome: 'Viana', classificacao: 'popular' },
    { id: 'zango', nome: 'Zango', classificacao: 'popular' },
    { id: 'cacuaco', nome: 'Cacuaco', classificacao: 'popular' },
    { id: 'cazenga', nome: 'Cazenga', classificacao: 'popular' },
    { id: 'palanca', nome: 'Palanca', classificacao: 'popular' },
    { id: 'bairropopular', nome: 'Bairro Popular', classificacao: 'popular' },
    { id: 'rangel', nome: 'Rangel', classificacao: 'popular' },
    { id: 'saopaulo', nome: 'São Paulo', classificacao: 'popular' },
    { id: 'martires', nome: 'Mártires do Kifangondo', classificacao: 'popular', modeloNome: 'Mártires Do Kifangondo' },
    { id: 'pango', nome: 'Pango Aluquém', classificacao: 'popular' },
    { id: 'ramiro', nome: 'Ramiro', classificacao: 'popular' },
    { id: 'icolo', nome: 'Ícolo e Bengo', classificacao: 'popular', modeloNome: 'Ícolo E Bengo' },

    // --- Outras Províncias ---
    { id: 'benguela', nome: 'Benguela', classificacao: 'medio' },
    { id: 'lubango', nome: 'Lubango', classificacao: 'medio' },
];

export const PRECOS_M2: Record<string, { venda: number; arrendamento: number }> = {
    premium: { venda: 1200000, arrendamento: 8000 },
    medio: { venda: 700000, arrendamento: 4500 },
    popular: { venda: 400000, arrendamento: 2500 },
};

