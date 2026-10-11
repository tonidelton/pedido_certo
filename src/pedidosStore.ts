import { Pedido, ItemPedido, StatusPedido } from './types';

const STORAGE_KEY = 'pedido-certo-pedidos';

export function getPedidos(): Pedido[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function savePedidos(pedidos: Pedido[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
}

export function getPedido(id: string): Pedido | undefined {
  return getPedidos().find(p => p.id === id);
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

export function adicionarItemPedido(pedidoId: string, item: ItemPedido): Pedido | null {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return null;

  pedidos[index].itens.push(item);
  pedidos[index].atualizadoEm = new Date().toISOString();
  savePedidos(pedidos);
  return pedidos[index];
}

export function removerItemPedido(pedidoId: string, itemId: string): Pedido | null {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return null;

  pedidos[index].itens = pedidos[index].itens.filter(i => i.id !== itemId);
  pedidos[index].atualizadoEm = new Date().toISOString();
  savePedidos(pedidos);
  return pedidos[index];
}
