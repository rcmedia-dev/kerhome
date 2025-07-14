export type Fatura = {
  id: string;
  userId: string;
  valor: number;
  status: string; // ex: "pendente", "pago", "cancelado"
  servico: string; // nome do plano ou serviço
  criadoEm: Date;
};
