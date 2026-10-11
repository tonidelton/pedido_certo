import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
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
