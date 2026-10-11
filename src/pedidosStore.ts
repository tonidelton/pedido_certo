import { Pedido, ItemPedido, StatusPedido } from './types';

const STORAGE_KEY = 'pedido-certo-pedidos';

function criarPedidosExemplo(): Pedido[] {
  const agora = new Date();
  const minutosAtras = (min: number) => new Date(agora.getTime() - min * 60000).toISOString();

  return [
    // P01 - Suco entregue
    {
      id: 'p1',
      codigo: 'M3-P01',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-1',
      convidadoLugar: 1,
      convidadoApelido: 'Dona Maria',
      itens: [
        { id: 'i1', produtoId: '5', produtoNome: 'Suco Natural', produtoCodigo: 'B002', quantidade: 1, observacao: 'Laranja, sem açúcar', precoUnitario: 12.00, entregueEm: minutosAtras(35) },
      ],
      status: 'entregue',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(45) },
        { status: 'em_preparo', timestamp: minutosAtras(42) },
        { status: 'entregue', timestamp: minutosAtras(35) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(45),
      atualizadoEm: minutosAtras(35),
    },
    // P02 - Filé + Suco em preparo
    {
      id: 'p2',
      codigo: 'M3-P02',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-1',
      convidadoLugar: 1,
      convidadoApelido: 'Dona Maria',
      itens: [
        { id: 'i2', produtoId: '7', produtoNome: 'Filé Mignon ao Molho Madeira', produtoCodigo: 'P001', quantidade: 1, observacao: 'Bem passado', precoUnitario: 68.90, entregueEm: null },
        { id: 'i3', produtoId: '5', produtoNome: 'Suco Natural', produtoCodigo: 'B002', quantidade: 1, observacao: '', precoUnitario: 12.00, entregueEm: null },
      ],
      status: 'em_preparo',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(30) },
        { status: 'em_preparo', timestamp: minutosAtras(25) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(30),
      atualizadoEm: minutosAtras(25),
    },
    // P03 - Refrigerante + Bruschetta pendente
    {
      id: 'p3',
      codigo: 'M3-P03',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-2',
      convidadoLugar: 2,
      convidadoApelido: 'Seu João',
      itens: [
        { id: 'i4', produtoId: '4', produtoNome: 'Refrigerante Lata', produtoCodigo: 'B001', quantidade: 2, observacao: 'Com gelo', precoUnitario: 7.50, entregueEm: null },
        { id: 'i5', produtoId: '1', produtoNome: 'Bruschetta Italiana', produtoCodigo: 'E001', quantidade: 1, observacao: '', precoUnitario: 28.90, entregueEm: null },
      ],
      status: 'pendente',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(15) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(15),
      atualizadoEm: minutosAtras(15),
    },
    // P04 - Água + Salmão entregue
    {
      id: 'p4',
      codigo: 'M3-P04',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-3',
      convidadoLugar: 3,
      convidadoApelido: 'Aniversariante',
      itens: [
        { id: 'i6', produtoId: '6', produtoNome: 'Água Mineral', produtoCodigo: 'B003', quantidade: 1, observacao: 'Sem gás', precoUnitario: 5.00, entregueEm: minutosAtras(22) },
        { id: 'i7', produtoId: '8', produtoNome: 'Salmão Grelhado', produtoCodigo: 'P002', quantidade: 1, observacao: '', precoUnitario: 72.00, entregueEm: minutosAtras(20) },
      ],
      status: 'entregue',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(40) },
        { status: 'em_preparo', timestamp: minutosAtras(37) },
        { status: 'entregue', timestamp: minutosAtras(20) },
      ],
      anotadoPor: 'Ana',
      criadoEm: minutosAtras(40),
      atualizadoEm: minutosAtras(20),
    },
    // P05 - Risoto pendente
    {
      id: 'p5',
      codigo: 'M3-P05',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-4',
      convidadoLugar: 4,
      convidadoApelido: '',
      itens: [
        { id: 'i8', produtoId: '9', produtoNome: 'Risoto de Camarão', produtoCodigo: 'P003', quantidade: 1, observacao: 'Sem cebola', precoUnitario: 64.50, entregueEm: null },
      ],
      status: 'pendente',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(10) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(10),
      atualizadoEm: minutosAtras(10),
    },
    // P06 - Bolinho + Refri em preparo (parcial)
    {
      id: 'p6',
      codigo: 'M3-P06',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-5',
      convidadoLugar: 5,
      convidadoApelido: '',
      itens: [
        { id: 'i9', produtoId: '2', produtoNome: 'Bolinho de Bacalhau', produtoCodigo: 'E002', quantidade: 1, observacao: '', precoUnitario: 32.00, entregueEm: null },
        { id: 'i10', produtoId: '4', produtoNome: 'Refrigerante Lata', produtoCodigo: 'B001', quantidade: 1, observacao: '', precoUnitario: 7.50, entregueEm: minutosAtras(17) },
      ],
      status: 'em_preparo',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(20) },
        { status: 'em_preparo', timestamp: minutosAtras(18) },
      ],
      anotadoPor: 'Ana',
      criadoEm: minutosAtras(20),
      atualizadoEm: minutosAtras(18),
    },
    // P07 - Petit Gâteau entregue
    {
      id: 'p7',
      codigo: 'M3-P07',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-6',
      convidadoLugar: 6,
      convidadoApelido: '',
      itens: [
        { id: 'i11', produtoId: '10', produtoNome: 'Petit Gâteau', produtoCodigo: 'S001', quantidade: 1, observacao: '', precoUnitario: 26.00, entregueEm: minutosAtras(25) },
      ],
      status: 'entregue',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(35) },
        { status: 'em_preparo', timestamp: minutosAtras(32) },
        { status: 'entregue', timestamp: minutosAtras(25) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(35),
      atualizadoEm: minutosAtras(25),
    },
    // P08 - Carpaccio cancelado
    {
      id: 'p8',
      codigo: 'M3-P08',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-7',
      convidadoLugar: 7,
      convidadoApelido: '',
      itens: [
        { id: 'i12', produtoId: '3', produtoNome: 'Carpaccio de Carne', produtoCodigo: 'E003', quantidade: 1, observacao: '', precoUnitario: 38.50, entregueEm: null },
      ],
      status: 'cancelado',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(28) },
        { status: 'cancelado', timestamp: minutosAtras(26) },
      ],
      anotadoPor: 'Ana',
      criadoEm: minutosAtras(28),
      atualizadoEm: minutosAtras(26),
    },
    // P09 - 2 Pudins pendente
    {
      id: 'p9',
      codigo: 'M3-P09',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-8',
      convidadoLugar: 8,
      convidadoApelido: '',
      itens: [
        { id: 'i13', produtoId: '11', produtoNome: 'Pudim de Leite', produtoCodigo: 'S002', quantidade: 2, observacao: '', precoUnitario: 18.00, entregueEm: null },
      ],
      status: 'pendente',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(5) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(5),
      atualizadoEm: minutosAtras(5),
    },
    // P10 - Cheesecake + Suco em preparo
    {
      id: 'p10',
      codigo: 'M3-P10',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-9',
      convidadoLugar: 9,
      convidadoApelido: '',
      itens: [
        { id: 'i14', produtoId: '12', produtoNome: 'Cheesecake de Frutas Vermelhas', produtoCodigo: 'S003', quantidade: 1, observacao: '', precoUnitario: 24.00, entregueEm: null },
        { id: 'i15', produtoId: '5', produtoNome: 'Suco Natural', produtoCodigo: 'B002', quantidade: 1, observacao: 'Maracujá', precoUnitario: 12.00, entregueEm: null },
      ],
      status: 'em_preparo',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(12) },
        { status: 'em_preparo', timestamp: minutosAtras(10) },
      ],
      anotadoPor: 'Ana',
      criadoEm: minutosAtras(12),
      atualizadoEm: minutosAtras(10),
    },
    // P11 - Filé entregue
    {
      id: 'p11',
      codigo: 'M3-P11',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-10',
      convidadoLugar: 10,
      convidadoApelido: '',
      itens: [
        { id: 'i16', produtoId: '7', produtoNome: 'Filé Mignon ao Molho Madeira', produtoCodigo: 'P001', quantidade: 1, observacao: 'Ao ponto', precoUnitario: 68.90, entregueEm: minutosAtras(22) },
      ],
      status: 'entregue',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(38) },
        { status: 'em_preparo', timestamp: minutosAtras(35) },
        { status: 'entregue', timestamp: minutosAtras(22) },
      ],
      anotadoPor: 'Carlos',
      criadoEm: minutosAtras(38),
      atualizadoEm: minutosAtras(22),
    },
    // P12 - 2 Águas entregue
    {
      id: 'p12',
      codigo: 'M3-P12',
      mesaId: '3',
      atendimentoId: 'at3',
      convidadoId: 'c3-11',
      convidadoLugar: 11,
      convidadoApelido: '',
      itens: [
        { id: 'i17', produtoId: '6', produtoNome: 'Água Mineral', produtoCodigo: 'B003', quantidade: 2, observacao: 'Com gás', precoUnitario: 5.00, entregueEm: minutosAtras(38) },
      ],
      status: 'entregue',
      historicoStatus: [
        { status: 'pendente', timestamp: minutosAtras(44) },
        { status: 'em_preparo', timestamp: minutosAtras(42) },
        { status: 'entregue', timestamp: minutosAtras(38) },
      ],
      anotadoPor: 'Ana',
      criadoEm: minutosAtras(44),
      atualizadoEm: minutosAtras(38),
    },
  ];
}

export function getPedidos(): Pedido[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const exemplos = criarPedidosExemplo();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exemplos));
    return exemplos;
  }
  return JSON.parse(data);
}

export function savePedidos(pedidos: Pedido[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
}

export function getPedido(id: string): Pedido | undefined {
  return getPedidos().find(p => p.id === id);
}

export function getPedidoByCodigo(codigo: string): Pedido | undefined {
  return getPedidos().find(p => p.codigo.toLowerCase() === codigo.toLowerCase());
}

export function getPedidosByAtendimento(atendimentoId: string): Pedido[] {
  return getPedidos().filter(p => p.atendimentoId === atendimentoId);
}

export function getPedidosByConvidado(convidadoId: string): Pedido[] {
  return getPedidos().filter(p => p.convidadoId === convidadoId);
}

export function getPedidosByMesa(mesaId: string): Pedido[] {
  return getPedidos().filter(p => p.mesaId === mesaId);
}

export function gerarCodigoPedido(mesaNumero: string, atendimentoId: string): string {
  const pedidos = getPedidosByAtendimento(atendimentoId);
  const sequencia = pedidos.length + 1;
  return `M${mesaNumero}-P${String(sequencia).padStart(2, '0')}`;
}

export function criarPedido(
  mesaId: string,
  mesaNumero: string,
  atendimentoId: string,
  convidadoId: string,
  convidadoLugar: number,
  convidadoApelido: string,
  itens: ItemPedido[],
  anotadoPor: string
): Pedido {
  const pedidos = getPedidos();
  const codigo = gerarCodigoPedido(mesaNumero, atendimentoId);
  const agora = new Date().toISOString();

  const novo: Pedido = {
    id: Date.now().toString(),
    codigo,
    mesaId,
    atendimentoId,
    convidadoId,
    convidadoLugar,
    convidadoApelido,
    itens,
    status: 'pendente',
    historicoStatus: [{ status: 'pendente', timestamp: agora }],
    anotadoPor,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  pedidos.push(novo);
  savePedidos(pedidos);
  return novo;
}

export function atualizarStatusPedido(pedidoId: string, novoStatus: StatusPedido): Pedido | null {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return null;

  const agora = new Date().toISOString();
  pedidos[index].status = novoStatus;
  pedidos[index].historicoStatus.push({ status: novoStatus, timestamp: agora });
  pedidos[index].atualizadoEm = agora;

  savePedidos(pedidos);
  return pedidos[index];
}

export function marcarItemEntregue(pedidoId: string, itemId: string): Pedido | null {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return null;

  const itemIndex = pedidos[index].itens.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  pedidos[index].itens[itemIndex].entregueEm = new Date().toISOString();
  pedidos[index].atualizadoEm = new Date().toISOString();

  // Se todos os itens foram entregues, atualiza status do pedido
  const todosEntregues = pedidos[index].itens.every(i => i.entregueEm !== null);
  if (todosEntregues && pedidos[index].status !== 'entregue' && pedidos[index].status !== 'cancelado') {
    const agora = new Date().toISOString();
    pedidos[index].status = 'entregue';
    pedidos[index].historicoStatus.push({ status: 'entregue', timestamp: agora });
  }

  savePedidos(pedidos);
  return pedidos[index];
}

export function desmarcarItemEntregue(pedidoId: string, itemId: string): Pedido | null {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return null;

  const itemIndex = pedidos[index].itens.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  pedidos[index].itens[itemIndex].entregueEm = null;
  pedidos[index].atualizadoEm = new Date().toISOString();

  // Se o pedido estava como entregue, volta para em_preparo
  if (pedidos[index].status === 'entregue') {
    const agora = new Date().toISOString();
    pedidos[index].status = 'em_preparo';
    pedidos[index].historicoStatus.push({ status: 'em_preparo', timestamp: agora });
  }

  savePedidos(pedidos);
  return pedidos[index];
}
