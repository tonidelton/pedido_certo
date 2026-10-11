import { Produto, Categoria } from './types';

const STORAGE_KEY = 'pedido-certo-produtos';

const produtosExemplo: Produto[] = [
  // Entradas (3)
  {
    id: '1',
    nome: 'Bruschetta Italiana',
    codigo: 'E001',
    categoria: 'Entradas',
    preco: 28.90,
    observacoes: 'Pão italiano, tomate, manjericão e azeite',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Bolinho de Bacalhau',
    codigo: 'E002',
    categoria: 'Entradas',
    preco: 32.00,
    observacoes: '6 unidades com molho tártaro',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '3',
    nome: 'Carpaccio de Carne',
    codigo: 'E003',
    categoria: 'Entradas',
    preco: 38.50,
    observacoes: 'Finas fatias de filé mignon com rúcula e parmesão',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  // Bebidas (3)
  {
    id: '4',
    nome: 'Refrigerante Lata',
    codigo: 'B001',
    categoria: 'Bebidas',
    preco: 7.50,
    observacoes: 'Coca-Cola, Guaraná ou Fanta',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '5',
    nome: 'Suco Natural',
    codigo: 'B002',
    categoria: 'Bebidas',
    preco: 12.00,
    observacoes: 'Laranja, limão, maracujá ou abacaxi',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '6',
    nome: 'Água Mineral',
    codigo: 'B003',
    categoria: 'Bebidas',
    preco: 5.00,
    observacoes: 'Com ou sem gás - 500ml',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  // Pratos Principais (3)
  {
    id: '7',
    nome: 'Filé Mignon ao Molho Madeira',
    codigo: 'P001',
    categoria: 'Pratos Principais',
    preco: 68.90,
    observacoes: 'Acompanha arroz, fritas e salada',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '8',
    nome: 'Salmão Grelhado',
    codigo: 'P002',
    categoria: 'Pratos Principais',
    preco: 72.00,
    observacoes: 'Com legumes salteados e purê',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '9',
    nome: 'Risoto de Camarão',
    codigo: 'P003',
    categoria: 'Pratos Principais',
    preco: 64.50,
    observacoes: 'Risoto cremoso com camarões e catupiry',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  // Sobremesas (3)
  {
    id: '10',
    nome: 'Petit Gâteau',
    codigo: 'S001',
    categoria: 'Sobremesas',
    preco: 26.00,
    observacoes: 'Com sorvete de baunilha e calda de chocolate',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '11',
    nome: 'Pudim de Leite',
    codigo: 'S002',
    categoria: 'Sobremesas',
    preco: 18.00,
    observacoes: 'Pudim clássico com calda de caramelo',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '12',
    nome: 'Cheesecake de Frutas Vermelhas',
    codigo: 'S003',
    categoria: 'Sobremesas',
    preco: 24.00,
    observacoes: 'Cheesecake cremoso com calda de frutas vermelhas',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

export function getProdutos(): Produto[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtosExemplo));
    return produtosExemplo;
  }
  return JSON.parse(data);
}

export function saveProdutos(produtos: Produto[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
}

export function addProduto(produto: Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'>): Produto {
  const produtos = getProdutos();
  const novo: Produto = {
    ...produto,
    id: Date.now().toString(),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  produtos.push(novo);
  saveProdutos(produtos);
  return novo;
}

export function updateProduto(id: string, dados: Partial<Omit<Produto, 'id' | 'criadoEm'>>): Produto | null {
  const produtos = getProdutos();
  const index = produtos.findIndex(p => p.id === id);
  if (index === -1) return null;
  produtos[index] = {
    ...produtos[index],
    ...dados,
    atualizadoEm: new Date().toISOString(),
  };
  saveProdutos(produtos);
  return produtos[index];
}

export function toggleAtivo(id: string): Produto | null {
  const produtos = getProdutos();
  const index = produtos.findIndex(p => p.id === id);
  if (index === -1) return null;
  produtos[index].ativo = !produtos[index].ativo;
  produtos[index].atualizadoEm = new Date().toISOString();
  saveProdutos(produtos);
  return produtos[index];
}

export function gerarCodigoSugerido(categoria: Categoria): string {
  const prefixos: Record<Categoria, string> = {
    'Entradas': 'E',
    'Bebidas': 'B',
    'Pratos Principais': 'P',
    'Sobremesas': 'S',
  };
  const prefixo = prefixos[categoria];
  const produtos = getProdutos();
  const codigosCategoria = produtos
    .filter(p => p.codigo.startsWith(prefixo))
    .map(p => parseInt(p.codigo.slice(1)) || 0);
  const max = codigosCategoria.length > 0 ? Math.max(...codigosCategoria) : 0;
  return `${prefixo}${String(max + 1).padStart(2, '0')}`;
}

export function codigoExiste(codigo: string, excluirId?: string): boolean {
  const produtos = getProdutos();
  return produtos.some(p => p.codigo.toLowerCase() === codigo.toLowerCase() && p.id !== excluirId);
}
