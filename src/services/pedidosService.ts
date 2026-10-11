import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Pedido, ItemPedido, StatusPedido } from '../types';
import { 
  getPedidos as getPedidosLocal,
  getPedido as getPedidoLocal,
  getPedidoByCodigo as getPedidoByCodigoLocal,
  getPedidosByAtendimento as getPedidosByAtendimentoLocal,
  getPedidosByConvidado as getPedidosByConvidadoLocal,
  getPedidosByMesa as getPedidosByMesaLocal,
  criarPedido as criarPedidoLocal,
  atualizarStatusPedido as atualizarStatusPedidoLocal,
  marcarItemEntregue as marcarItemEntregueLocal,
  desmarcarItemEntregue as desmarcarItemEntregueLocal
} from '../pedidosStore';

// ===== PEDIDOS =====

export async function getPedidos(): Promise<Pedido[]> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidosLocal();
  }

  try {
    const pedidosRef = collection(db, 'pedidos');
    const snapshot = await getDocs(pedidosRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pedido[];
  } catch (error) {
    console.error('Erro ao buscar pedidos do Firebase:', error);
    return getPedidosLocal();
  }
}

export async function getPedido(id: string): Promise<Pedido | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidoLocal(id);
  }

  try {
    const pedidoDoc = await getDoc(doc(db, 'pedidos', id));
    if (!pedidoDoc.exists()) return undefined;
    
    return {
      id: pedidoDoc.id,
      ...pedidoDoc.data()
    } as Pedido;
  } catch (error) {
    console.error('Erro ao buscar pedido do Firebase:', error);
    return getPedidoLocal(id);
  }
}

export async function getPedidoByCodigo(codigo: string): Promise<Pedido | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidoByCodigoLocal(codigo);
  }

  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('codigo', '==', codigo));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Pedido;
  } catch (error) {
    console.error('Erro ao buscar pedido por código no Firebase:', error);
    return getPedidoByCodigoLocal(codigo);
  }
}

export async function getPedidosByAtendimento(atendimentoId: string): Promise<Pedido[]> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidosByAtendimentoLocal(atendimentoId);
  }

  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('atendimentoId', '==', atendimentoId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pedido[];
  } catch (error) {
    console.error('Erro ao buscar pedidos por atendimento no Firebase:', error);
    return getPedidosByAtendimentoLocal(atendimentoId);
  }
}

export async function getPedidosByConvidado(convidadoId: string): Promise<Pedido[]> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidosByConvidadoLocal(convidadoId);
  }

  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('convidadoId', '==', convidadoId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pedido[];
  } catch (error) {
    console.error('Erro ao buscar pedidos por convidado no Firebase:', error);
    return getPedidosByConvidadoLocal(convidadoId);
  }
}

export async function getPedidosByMesa(mesaId: string): Promise<Pedido[]> {
  if (!isFirebaseConfigured() || !db) {
    return getPedidosByMesaLocal(mesaId);
  }

  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('mesaId', '==', mesaId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pedido[];
  } catch (error) {
    console.error('Erro ao buscar pedidos por mesa no Firebase:', error);
    return getPedidosByMesaLocal(mesaId);
  }
}

export async function criarPedido(
  mesaId: string,
  mesaNumero: string,
  atendimentoId: string,
  convidadoId: string,
  convidadoLugar: number,
  convidadoApelido: string,
  itens: ItemPedido[],
  anotadoPor: string
): Promise<Pedido> {
  if (!isFirebaseConfigured() || !db) {
    return criarPedidoLocal(mesaId, mesaNumero, atendimentoId, convidadoId, convidadoLugar, convidadoApelido, itens, anotadoPor);
  }

  try {
    const todosPedidos = await getPedidosByAtendimento(atendimentoId);
    const sequencia = todosPedidos.length + 1;
    const codigo = `M${mesaNumero}-P${String(sequencia).padStart(2, '0')}`;
    const agora = new Date().toISOString();

    const novoPedido = {
      codigo,
      mesaId,
      atendimentoId,
      convidadoId,
      convidadoLugar,
      convidadoApelido,
      itens,
      status: 'pendente' as StatusPedido,
      historicoStatus: [{ status: 'pendente' as StatusPedido, timestamp: agora }],
      anotadoPor,
      criadoEm: agora,
      atualizadoEm: agora
    };

    const docRef = await addDoc(collection(db, 'pedidos'), novoPedido);
    
    return {
      id: docRef.id,
      ...novoPedido
    };
  } catch (error) {
    console.error('Erro ao criar pedido no Firebase:', error);
    return criarPedidoLocal(mesaId, mesaNumero, atendimentoId, convidadoId, convidadoLugar, convidadoApelido, itens, anotadoPor);
  }
}

export async function atualizarStatusPedido(pedidoId: string, novoStatus: StatusPedido): Promise<Pedido | null> {
  if (!isFirebaseConfigured() || !db) {
    return atualizarStatusPedidoLocal(pedidoId, novoStatus);
  }

  try {
    const pedido = await getPedido(pedidoId);
    if (!pedido) return null;

    const agora = new Date().toISOString();
    pedido.status = novoStatus;
    pedido.historicoStatus.push({ status: novoStatus, timestamp: agora });
    pedido.atualizadoEm = agora;

    await updateDoc(doc(db, 'pedidos', pedidoId), {
      status: pedido.status,
      historicoStatus: pedido.historicoStatus,
      atualizadoEm: pedido.atualizadoEm
    });

    return pedido;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido no Firebase:', error);
    return atualizarStatusPedidoLocal(pedidoId, novoStatus);
  }
}

export async function marcarItemEntregue(pedidoId: string, itemId: string): Promise<Pedido | null> {
  if (!isFirebaseConfigured() || !db) {
    return marcarItemEntregueLocal(pedidoId, itemId);
  }

  try {
    const pedido = await getPedido(pedidoId);
    if (!pedido) return null;

    const item = pedido.itens.find(i => i.id === itemId);
    if (!item) return null;

    item.entregueEm = new Date().toISOString();
    pedido.atualizadoEm = new Date().toISOString();

    // Se todos os itens foram entregues, atualiza status do pedido
    const todosEntregues = pedido.itens.every(i => i.entregueEm !== null);
    if (todosEntregues && pedido.status !== 'entregue' && pedido.status !== 'cancelado') {
      const agora = new Date().toISOString();
      pedido.status = 'entregue';
      pedido.historicoStatus.push({ status: 'entregue', timestamp: agora });
    }

    await updateDoc(doc(db, 'pedidos', pedidoId), {
      itens: pedido.itens,
      status: pedido.status,
      historicoStatus: pedido.historicoStatus,
      atualizadoEm: pedido.atualizadoEm
    });

    return pedido;
  } catch (error) {
    console.error('Erro ao marcar item entregue no Firebase:', error);
    return marcarItemEntregueLocal(pedidoId, itemId);
  }
}

export async function desmarcarItemEntregue(pedidoId: string, itemId: string): Promise<Pedido | null> {
  if (!isFirebaseConfigured() || !db) {
    return desmarcarItemEntregueLocal(pedidoId, itemId);
  }

  try {
    const pedido = await getPedido(pedidoId);
    if (!pedido) return null;

    const item = pedido.itens.find(i => i.id === itemId);
    if (!item) return null;

    item.entregueEm = null;
    pedido.atualizadoEm = new Date().toISOString();

    // Se o pedido estava como entregue, volta para em_preparo
    if (pedido.status === 'entregue') {
      const agora = new Date().toISOString();
      pedido.status = 'em_preparo';
      pedido.historicoStatus.push({ status: 'em_preparo', timestamp: agora });
    }

    await updateDoc(doc(db, 'pedidos', pedidoId), {
      itens: pedido.itens,
      status: pedido.status,
      historicoStatus: pedido.historicoStatus,
      atualizadoEm: pedido.atualizadoEm
    });

    return pedido;
  } catch (error) {
    console.error('Erro ao desmarcar item entregue no Firebase:', error);
    return desmarcarItemEntregueLocal(pedidoId, itemId);
  }
}

export function gerarCodigoPedido(mesaNumero: string, atendimentoId: string): string {
  const pedidos = getPedidosByAtendimentoLocal(atendimentoId);
  const sequencia = pedidos.length + 1;
  return `M${mesaNumero}-P${String(sequencia).padStart(2, '0')}`;
}
