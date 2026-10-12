import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { Mesa, AtendimentoFechado } from '../types';
import { 
  getMesas as getMesasLocal, 
  getMesa as getMesaLocal,
  criarMesa as criarMesaLocal,
  excluirMesa as excluirMesaLocal,
  abrirAtendimento as abrirAtendimentoLocal,
  fecharAtendimento as fecharAtendimentoLocal,
  atualizarApelido as atualizarApelidoLocal,
  reordenarMesas as reordenarMesasLocal,
  getAtendimentosFechados as getAtendimentosFechadosLocal,
  ordenarMesas
} from '../mesasStore';

// ===== MESAS =====

export async function getMesas(): Promise<Mesa[]> {
  if (!isFirebaseConfigured() || !db) {
    return getMesasLocal();
  }

  try {
    const mesasRef = collection(db, 'mesas');
    const snapshot = await getDocs(mesasRef);
    
    if (snapshot.empty) {
      return getMesasLocal();
    }
    
    const mesas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mesa[];
    return ordenarMesas(mesas);
  } catch (error) {
    console.error('Erro ao buscar mesas do Firebase:', error);
    return getMesasLocal();
  }
}

export async function getMesa(id: string): Promise<Mesa | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return getMesaLocal(id);
  }

  try {
    const mesaDoc = await getDoc(doc(db, 'mesas', id));
    if (!mesaDoc.exists()) return getMesaLocal(id);
    
    return {
      id: mesaDoc.id,
      ...mesaDoc.data()
    } as Mesa;
  } catch (error) {
    console.error('Erro ao buscar mesa do Firebase:', error);
    return getMesaLocal(id);
  }
}

export async function criarMesa(numero: string, capacidade: number | null): Promise<Mesa> {
  if (!isFirebaseConfigured() || !db) {
    return criarMesaLocal(numero, capacidade);
  }

  try {
    const mesas = await getMesas();
    const proximaOrdem = mesas.reduce((max, m) => Math.max(max, m.ordem ?? 0), -1) + 1;
    const novaMesa = {
      numero: numero.trim(),
      capacidade,
      atendimentoAberto: null,
      ordem: proximaOrdem,
      criadoEm: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'mesas'), novaMesa);
    
    return {
      id: docRef.id,
      ...novaMesa
    };
  } catch (error) {
    console.error('Erro ao criar mesa no Firebase:', error);
    return criarMesaLocal(numero, capacidade);
  }
}

export async function excluirMesa(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    return excluirMesaLocal(id);
  }

  try {
    await deleteDoc(doc(db, 'mesas', id));
  } catch (error) {
    console.error('Erro ao excluir mesa no Firebase:', error);
    return excluirMesaLocal(id);
  }
}

export async function abrirAtendimento(
  mesaId: string, 
  numConvidados: number, 
  apelidos: string[]
): Promise<Mesa | null> {
  if (!isFirebaseConfigured() || !db) {
    return abrirAtendimentoLocal(mesaId, numConvidados, apelidos);
  }

  try {
    const mesa = await getMesa(mesaId);
    if (!mesa) return null;

    const CORES_CONVIDADO = ['vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'laranja', 'rosa', 'ciano'] as const;
    
    const convidados = Array.from({ length: numConvidados }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      lugar: i + 1,
      cor: CORES_CONVIDADO[i % CORES_CONVIDADO.length],
      apelido: apelidos[i] || ''
    }));

    const atendimento = {
      id: Date.now().toString(),
      mesaId,
      convidados,
      abertoEm: new Date().toISOString(),
      fechadoEm: null
    };

    await updateDoc(doc(db, 'mesas', mesaId), {
      atendimentoAberto: atendimento
    });

    const mesaAtualizada = await getMesa(mesaId);
    return mesaAtualizada || null;
  } catch (error) {
    console.error('Erro ao abrir atendimento no Firebase:', error);
    return abrirAtendimentoLocal(mesaId, numConvidados, apelidos);
  }
}

export async function fecharAtendimento(mesaId: string): Promise<Mesa | null> {
  if (!isFirebaseConfigured() || !db) {
    return fecharAtendimentoLocal(mesaId);
  }

  try {
    const mesa = await getMesa(mesaId);
    if (!mesa || !mesa.atendimentoAberto) return null;

    const atendimentoFechado: AtendimentoFechado = {
      ...mesa.atendimentoAberto,
      mesaNumero: mesa.numero,
      fechadoEm: new Date().toISOString()
    };

    await updateDoc(doc(db, 'mesas', mesaId), {
      atendimentoAberto: null
    });
    await setDoc(doc(db, 'atendimentos', atendimentoFechado.id), atendimentoFechado);

    return { ...mesa, atendimentoAberto: null };
  } catch (error) {
    console.error('Erro ao fechar atendimento no Firebase:', error);
    return fecharAtendimentoLocal(mesaId);
  }
}

export async function reordenarMesas(mesasOrdenadas: Mesa[]): Promise<Mesa[]> {
  if (!isFirebaseConfigured() || !db) {
    return reordenarMesasLocal(mesasOrdenadas);
  }

  const firestore = db;

  try {
    const mesas = mesasOrdenadas.map((m, i) => ({ ...m, ordem: i }));
    await Promise.all(
      mesas.map(m => updateDoc(doc(firestore, 'mesas', m.id), { ordem: m.ordem }))
    );
    return mesas;
  } catch (error) {
    console.error('Erro ao reordenar mesas no Firebase:', error);
    return reordenarMesasLocal(mesasOrdenadas);
  }
}

export async function getAtendimentosFechados(): Promise<AtendimentoFechado[]> {
  if (!isFirebaseConfigured() || !db) {
    return getAtendimentosFechadosLocal();
  }

  try {
    const ref = collection(db, 'atendimentos');
    const snapshot = await getDocs(ref);

    if (snapshot.empty) {
      return getAtendimentosFechadosLocal();
    }

    const lista = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })) as AtendimentoFechado[];
    return lista.sort((a, b) =>
      new Date(b.fechadoEm || 0).getTime() - new Date(a.fechadoEm || 0).getTime()
    );
  } catch (error) {
    console.error('Erro ao buscar histórico de atendimentos:', error);
    return getAtendimentosFechadosLocal();
  }
}

export async function atualizarApelido(
  mesaId: string, 
  convidadoId: string, 
  apelido: string
): Promise<Mesa | null> {
  if (!isFirebaseConfigured() || !db) {
    return atualizarApelidoLocal(mesaId, convidadoId, apelido);
  }

  try {
    const mesa = await getMesa(mesaId);
    if (!mesa || !mesa.atendimentoAberto) return null;

    const convidado = mesa.atendimentoAberto.convidados.find(c => c.id === convidadoId);
    if (!convidado) return null;

    convidado.apelido = apelido;

    await updateDoc(doc(db, 'mesas', mesaId), {
      atendimentoAberto: mesa.atendimentoAberto
    });

    return mesa;
  } catch (error) {
    console.error('Erro ao atualizar apelido no Firebase:', error);
    return atualizarApelidoLocal(mesaId, convidadoId, apelido);
  }
}

export async function numeroMesaExiste(numero: string, excluirId?: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    const mesas = getMesasLocal();
    return mesas.some(m => m.numero.toLowerCase() === numero.toLowerCase() && m.id !== excluirId);
  }

  try {
    const mesasRef = collection(db, 'mesas');
    const snapshot = await getDocs(mesasRef);
    const mesas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mesa[];
    
    return mesas.some(m => m.numero.toLowerCase() === numero.toLowerCase() && m.id !== excluirId);
  } catch (error) {
    console.error('Erro ao verificar se mesa existe no Firebase:', error);
    const mesas = getMesasLocal();
    return mesas.some(m => m.numero.toLowerCase() === numero.toLowerCase() && m.id !== excluirId);
  }
}
