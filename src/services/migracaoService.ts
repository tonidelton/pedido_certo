import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { getProdutos as getProdutosLocal } from '../store';
import { getMesas as getMesasFromStore } from '../mesasStore';
import { getPedidos as getPedidosFromStore } from '../pedidosStore';

export interface MigracaoResultado {
  sucesso: boolean;
  produtos: number;
  mesas: number;
  pedidos: number;
  erros: string[];
}

export async function migrarDadosParaFirebase(): Promise<MigracaoResultado> {
  const resultado: MigracaoResultado = {
    sucesso: true,
    produtos: 0,
    mesas: 0,
    pedidos: 0,
    erros: []
  };

  if (!isFirebaseConfigured() || !db) {
    resultado.sucesso = false;
    resultado.erros.push('Firebase não configurado');
    return resultado;
  }

  try {
    // Primeiro, limpar o Firebase para evitar duplicação
    console.log('Limpando Firebase antes da migração...');
    await limparFirebase();

    // Migrar Produtos
    console.log('Migrando produtos...');
    const produtos = getProdutosLocal();
    for (const produto of produtos) {
      try {
        await setDoc(doc(db, 'produtos', produto.id), produto);
        resultado.produtos++;
      } catch (error) {
        resultado.erros.push(`Erro ao migrar produto ${produto.nome}: ${error}`);
      }
    }
    console.log(`${resultado.produtos} produtos migrados`);

    // Migrar Mesas
    console.log('Migrando mesas...');
    const mesas = getMesasFromStore();
    for (const mesa of mesas) {
      try {
        await setDoc(doc(db, 'mesas', mesa.id), mesa);
        resultado.mesas++;
      } catch (error) {
        resultado.erros.push(`Erro ao migrar mesa ${mesa.numero}: ${error}`);
      }
    }
    console.log(`${resultado.mesas} mesas migradas`);

    // Migrar Pedidos
    console.log('Migrando pedidos...');
    const pedidos = getPedidosFromStore();
    for (const pedido of pedidos) {
      try {
        await setDoc(doc(db, 'pedidos', pedido.id), pedido);
        resultado.pedidos++;
      } catch (error) {
        resultado.erros.push(`Erro ao migrar pedido ${pedido.codigo}: ${error}`);
      }
    }
    console.log(`${resultado.pedidos} pedidos migrados`);

    resultado.sucesso = resultado.erros.length === 0;
  } catch (error) {
    resultado.sucesso = false;
    resultado.erros.push(`Erro geral na migração: ${error}`);
  }

  return resultado;
}

export function limparLocalStorage() {
  localStorage.removeItem('pedido-certo-produtos');
  localStorage.removeItem('pedido-certo-mesas');
  localStorage.removeItem('pedido-certo-pedidos');
  console.log('LocalStorage limpo');
}

export function verificarDadosLocais(): { produtos: number; mesas: number; pedidos: number } {
  return {
    produtos: getProdutosLocal().length,
    mesas: getMesasFromStore().length,
    pedidos: getPedidosFromStore().length
  };
}

export interface LimpezaResultado {
  sucesso: boolean;
  produtosRemovidos: number;
  mesasRemovidas: number;
  pedidosRemovidos: number;
  erros: string[];
}

export async function limparFirebase(): Promise<LimpezaResultado> {
  const resultado: LimpezaResultado = {
    sucesso: true,
    produtosRemovidos: 0,
    mesasRemovidas: 0,
    pedidosRemovidos: 0,
    erros: []
  };

  if (!isFirebaseConfigured() || !db) {
    resultado.sucesso = false;
    resultado.erros.push('Firebase não configurado');
    return resultado;
  }

  try {
    // Limpar Produtos
    console.log('Limpando produtos...');
    const produtosSnapshot = await getDocs(collection(db, 'produtos'));
    for (const docSnap of produtosSnapshot.docs) {
      try {
        await deleteDoc(docSnap.ref);
        resultado.produtosRemovidos++;
      } catch (error) {
        resultado.erros.push(`Erro ao remover produto ${docSnap.id}: ${error}`);
      }
    }
    console.log(`${resultado.produtosRemovidos} produtos removidos`);

    // Limpar Mesas
    console.log('Limpando mesas...');
    const mesasSnapshot = await getDocs(collection(db, 'mesas'));
    for (const docSnap of mesasSnapshot.docs) {
      try {
        await deleteDoc(docSnap.ref);
        resultado.mesasRemovidas++;
      } catch (error) {
        resultado.erros.push(`Erro ao remover mesa ${docSnap.id}: ${error}`);
      }
    }
    console.log(`${resultado.mesasRemovidas} mesas removidas`);

    // Limpar Pedidos
    console.log('Limpando pedidos...');
    const pedidosSnapshot = await getDocs(collection(db, 'pedidos'));
    for (const docSnap of pedidosSnapshot.docs) {
      try {
        await deleteDoc(docSnap.ref);
        resultado.pedidosRemovidos++;
      } catch (error) {
        resultado.erros.push(`Erro ao remover pedido ${docSnap.id}: ${error}`);
      }
    }
    console.log(`${resultado.pedidosRemovidos} pedidos removidos`);

    resultado.sucesso = resultado.erros.length === 0;
  } catch (error) {
    resultado.sucesso = false;
    resultado.erros.push(`Erro geral na limpeza: ${error}`);
  }

  return resultado;
}
