export const tiposPropriedade = ['Apartamento', 'Casa', 'Prédio', 'Vivenda'];
export const statusOptions = ['arrendar', 'comprar'];
export const caracteristicasOptions = [
  'Piscina', 'Academia', 'Garagem', 'Elevador', 'Portaria 24h', 
  'Churrasqueira', 'Salão de Festas', 'Quadra Esportiva', 'Varanda',
  'Jardim', 'Mobiliado', 'Ar Condicionado', 'Aquecimento', 'Cozinha Equipada'
];
export const unidadesPreco = ['Kwanza', 'Dólar', 'Euro'];
export const opcoesPrecoChamada = ['Preço Fixo', 'Preço Negociável', 'Sob Consulta'];

// Função para formatar o preço com separadores de milhar
export const formatarPreco = (valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined || valor === '') return '';
  const valorString = typeof valor === 'number' ? valor.toString() : String(valor);
  const apenasNumeros = valorString.replace(/\D/g, '');
  if (apenasNumeros.length === 0) return '';
  return Number(apenasNumeros).toLocaleString('pt-BR');
};
