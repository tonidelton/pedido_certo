export type Categoria = 'Entradas' | 'Bebidas' | 'Pratos Principais' | 'Sobremesas';

export const CATEGORIAS: Categoria[] = ['Entradas', 'Bebidas', 'Pratos Principais', 'Sobremesas'];

export interface Produto {
  id: string;
  nome: string;
  codigo: string;
  categoria: Categoria;
  preco: number | null;
  observacoes: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ===== Mesas e Atendimentos =====

export type CorConvidado = 'vermelho' | 'azul' | 'verde' | 'amarelo' | 'roxo' | 'laranja' | 'rosa' | 'ciano';

export const CORES_CONVIDADO: CorConvidado[] = ['vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'laranja', 'rosa', 'ciano'];

export const corParaClasses: Record<CorConvidado, { bg: string; text: string; border: string; dot: string }> = {
  vermelho: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  azul: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  verde: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  amarelo: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  roxo: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  laranja: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  rosa: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dot: 'bg-pink-500' },
  ciano: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-500' },
};

export interface Convidado {
  id: string;
  lugar: number;
  cor: CorConvidado;
  apelido: string;
}

export interface Atendimento {
  id: string;
  mesaId: string;
  convidados: Convidado[];
  abertoEm: string;
  fechadoEm: string | null;
}

export interface Mesa {
  id: string;
  numero: string;
  capacidade: number | null;
  atendimentoAberto: Atendimento | null;
  criadoEm: string;
}
