export enum Plano {
  Básico = "Básico",
  Professional = "Professional",
  Super = "Super Corretor"
}

export type PlanoAgente = {
  id: string;
  nome: Plano; // ou use enum se quiser
  limite: number;
  restante: number;
  destaques: boolean;
  destaquesPermitidos: number;
  criadoEm: string; // ou Date se estiver deserializando corretamente
  atualizadoEm: string;
};