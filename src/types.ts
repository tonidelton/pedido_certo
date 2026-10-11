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
