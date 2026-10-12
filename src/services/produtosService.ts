import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Produto, Categoria } from '../types';
import { 
  getProdutos as getProdutosLocal, 
  addProduto as addProdutoLocal,
  updateProduto as updateProdutoLocal,
  toggleAtivo as toggleAtivoLocal
} from '../store';

// ===== PRODUTOS =====

export async function getProdutos(): Promise<Produto[]> {
  if (!isFirebaseConfigured() || !db) {
    return getProdutosLocal();
  }

  try {
    const produtosRef = collection(db, 'produtos');
    const q = query(produtosRef, orderBy('categoria'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return getProdutosLocal();
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Produto[];
  } catch (error) {
    console.error('Erro ao buscar produtos do Firebase:', error);
    return getProdutosLocal();
  }
}

export async function addProduto(produto: Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Produto> {
  if (!isFirebaseConfigured() || !db) {
    return addProdutoLocal(produto);
  }

  try {
    const agora = new Date().toISOString();
    const novoProduto = {
      ...produto,
      criadoEm: agora,
      atualizadoEm: agora
    };

    const docRef = await addDoc(collection(db, 'produtos'), novoProduto);
    
    return {
      id: docRef.id,
      ...novoProduto
    };
  } catch (error) {
    console.error('Erro ao adicionar produto no Firebase:', error);
    return addProdutoLocal(produto);
  }
}

export async function updateProduto(id: string, dados: Partial<Omit<Produto, 'id' | 'criadoEm'>>): Promise<Produto | null> {
  if (!isFirebaseConfigured() || !db) {
    return updateProdutoLocal(id, dados);
  }

  try {
    const produtoRef = doc(db, 'produtos', id);
    await updateDoc(produtoRef, {
      ...dados,
      atualizadoEm: new Date().toISOString()
    });

    const produtos = await getProdutos();
    return produtos.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Erro ao atualizar produto no Firebase:', error);
    return updateProdutoLocal(id, dados);
  }
}

export async function toggleAtivo(id: string): Promise<Produto | null> {
  if (!isFirebaseConfigured() || !db) {
    return toggleAtivoLocal(id);
  }

  try {
    const produtos = await getProdutos();
    const produto = produtos.find(p => p.id === id);
    
    if (!produto) return null;

    await updateProduto(id, { ativo: !produto.ativo });
    
    const produtosAtualizados = await getProdutos();
    return produtosAtualizados.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Erro ao toggle ativo no Firebase:', error);
    return toggleAtivoLocal(id);
  }
}

export async function gerarCodigoSugerido(categoria: Categoria): Promise<string> {
  const prefixos: Record<Categoria, string> = {
    'Entradas': 'E',
    'Bebidas': 'B',
    'Pratos Principais': 'P',
    'Sobremesas': 'S',
  };
  
  const prefixo = prefixos[categoria];
  const produtos = await getProdutos();
  const codigosCategoria = produtos
    .filter(p => p.codigo.startsWith(prefixo))
    .map(p => parseInt(p.codigo.slice(1)) || 0);
  const max = codigosCategoria.length > 0 ? Math.max(...codigosCategoria) : 0;
  
  return `${prefixo}${String(max + 1).padStart(2, '0')}`;
}

export async function codigoExiste(codigo: string, excluirId?: string): Promise<boolean> {
  const produtos = await getProdutos();
  return produtos.some(p => p.codigo.toLowerCase() === codigo.toLowerCase() && p.id !== excluirId);
}
