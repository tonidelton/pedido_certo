import { Mesa, Atendimento, Convidado, CORES_CONVIDADO, CorConvidado } from './types';

const STORAGE_KEY = 'pedido-certo-mesas';

function criarMesasExemplo(): Mesa[] {
  const agora = new Date();
  const minutosAtras = (min: number) => new Date(agora.getTime() - min * 60000).toISOString();

  // Criar 12 convidados para a mesa 3
  const convidadosMesa3: Convidado[] = Array.from({ length: 12 }, (_, i) => ({
    id: `c3-${i + 1}`,
    lugar: i + 1,
    cor: CORES_CONVIDADO[i % CORES_CONVIDADO.length],
    apelido: i === 0 ? 'Dona Maria' : i === 1 ? 'Seu João' : i === 2 ? 'Aniversariante' : '',
  }));

  const atendimentoMesa3: Atendimento = {
    id: 'at3',
    mesaId: '3',
    convidados: convidadosMesa3,
    abertoEm: minutosAtras(50),
    fechadoEm: null,
  };

  return [
    { id: '1', numero: '1', capacidade: 4, atendimentoAberto: null, criadoEm: new Date().toISOString() },
    { id: '2', numero: '2', capacidade: 2, atendimentoAberto: null, criadoEm: new Date().toISOString() },
    { id: '3', numero: '3', capacidade: 12, atendimentoAberto: atendimentoMesa3, criadoEm: new Date().toISOString() },
    { id: '4', numero: '4', capacidade: 4, atendimentoAberto: null, criadoEm: new Date().toISOString() },
    { id: '5', numero: '5', capacidade: 8, atendimentoAberto: null, criadoEm: new Date().toISOString() },
    { id: '6', numero: '6', capacidade: 2, atendimentoAberto: null, criadoEm: new Date().toISOString() },
  ];
}

export function getMesas(): Mesa[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const exemplos = criarMesasExemplo();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exemplos));
      return exemplos;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar mesas:', error);
    localStorage.removeItem(STORAGE_KEY);
    const exemplos = criarMesasExemplo();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exemplos));
    return exemplos;
  }
}

export function saveMesas(mesas: Mesa[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mesas));
}

export function getMesa(id: string): Mesa | undefined {
  return getMesas().find(m => m.id === id);
}

export function numeroMesaExiste(numero: string, excluirId?: string): boolean {
  const mesas = getMesas();
  return mesas.some(m => m.numero.toLowerCase() === numero.toLowerCase() && m.id !== excluirId);
}

export function criarMesa(numero: string, capacidade: number | null): Mesa {
  const mesas = getMesas();
  const nova: Mesa = {
    id: Date.now().toString(),
    numero: numero.trim(),
    capacidade,
    atendimentoAberto: null,
    criadoEm: new Date().toISOString(),
  };
  mesas.push(nova);
  saveMesas(mesas);
  return nova;
}

export function excluirMesa(id: string): void {
  const mesas = getMesas().filter(m => m.id !== id);
  saveMesas(mesas);
}

export function abrirAtendimento(mesaId: string, numConvidados: number, apelidos: string[]): Mesa | null {
  const mesas = getMesas();
  const index = mesas.findIndex(m => m.id === mesaId);
  if (index === -1) return null;

  const convidados: Convidado[] = [];
  for (let i = 0; i < numConvidados; i++) {
    convidados.push({
      id: `${Date.now()}-${i}`,
      lugar: i + 1,
      cor: CORES_CONVIDADO[i % CORES_CONVIDADO.length],
      apelido: apelidos[i] || '',
    });
  }

  const atendimento: Atendimento = {
    id: Date.now().toString(),
    mesaId,
    convidados,
    abertoEm: new Date().toISOString(),
    fechadoEm: null,
  };

  mesas[index].atendimentoAberto = atendimento;
  saveMesas(mesas);
  return mesas[index];
}

export function fecharAtendimento(mesaId: string): Mesa | null {
  const mesas = getMesas();
  const index = mesas.findIndex(m => m.id === mesaId);
  if (index === -1) return null;

  if (mesas[index].atendimentoAberto) {
    mesas[index].atendimentoAberto.fechadoEm = new Date().toISOString();
    mesas[index].atendimentoAberto = null;
  }
  saveMesas(mesas);
  return mesas[index];
}

export function atualizarApelido(mesaId: string, convidadoId: string, apelido: string): Mesa | null {
  const mesas = getMesas();
  const index = mesas.findIndex(m => m.id === mesaId);
  if (index === -1) return null;

  const atendimento = mesas[index].atendimentoAberto;
  if (!atendimento) return null;

  const convidado = atendimento.convidados.find(c => c.id === convidadoId);
  if (convidado) {
    convidado.apelido = apelido;
    saveMesas(mesas);
  }
  return mesas[index];
}

export function getCorConvidado(index: number): CorConvidado {
  return CORES_CONVIDADO[index % CORES_CONVIDADO.length];
}
