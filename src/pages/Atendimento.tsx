import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, LogOut, Edit3, Check, Users, X, Plus, ChefHat, CheckCircle2, XCircle } from 'lucide-react';
import { Mesa, corParaClasses, Pedido, StatusPedido, statusPedidoCores, statusPedidoLabels } from '../types';
import { getMesa, fecharAtendimento, atualizarApelido } from '../mesasStore';
import { getPedidosByConvidado, getPedidosByAtendimento, atualizarStatusPedido } from '../pedidosStore';
import Toast from '../components/Toast';

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function tempoDecorrido(iso: string): string {
  const inicio = new Date(iso).getTime();
  const agora = Date.now();
  const diff = Math.floor((agora - inicio) / 1000);
  const horas = Math.floor(diff / 3600);
  const minutos = Math.floor((diff % 3600) / 60);
  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }
  return `${minutos}min`;
}

export default function Atendimento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [confirmarFechamento, setConfirmarFechamento] = useState(false);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [apelidoEdit, setApelidoEdit] = useState('');
  const [pedidosPorConvidado, setPedidosPorConvidado] = useState<Record<string, Pedido[]>>({});
  const [todosPedidos, setTodosPedidos] = useState<Pedido[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<'convidado' | 'mesa'>('convidado');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [, setTick] = useState(0);

  const carregarDados = () => {
    if (!mesa?.atendimentoAberto) return;
    const map: Record<string, Pedido[]> = {};
    mesa.atendimentoAberto.convidados.forEach(c => {
      map[c.id] = getPedidosByConvidado(c.id);
    });
    setPedidosPorConvidado(map);
    setTodosPedidos(getPedidosByAtendimento(mesa.atendimentoAberto.id));
  };

  useEffect(() => {
    if (!id) return;
    const m = getMesa(id);
    if (!m || !m.atendimentoAberto) {
      navigate('/');
      return;
    }
    setMesa(m);
    // Carregar pedidos
    const map: Record<string, Pedido[]> = {};
    m.atendimentoAberto.convidados.forEach(c => {
      map[c.id] = getPedidosByConvidado(c.id);
    });
    setPedidosPorConvidado(map);
    setTodosPedidos(getPedidosByAtendimento(m.atendimentoAberto.id));
  }, [id, navigate]);

  // Atualiza a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      carregarDados();
    }, 30000);
    return () => clearInterval(interval);
  }, [mesa]);

  if (!mesa || !mesa.atendimentoAberto) return null;

  const atendimento = mesa.atendimentoAberto;

  // Resumo de status
  const resumoStatus = useMemo(() => {
    const pendentes = todosPedidos.filter(p => p.status === 'pendente').length;
    const emPreparo = todosPedidos.filter(p => p.status === 'em_preparo').length;
    const entregues = todosPedidos.filter(p => p.status === 'entregue').length;
    const cancelados = todosPedidos.filter(p => p.status === 'cancelado').length;

    const partes: string[] = [];
    if (pendentes > 0) partes.push(`${pendentes} pendente${pendentes > 1 ? 's' : ''}`);
    if (emPreparo > 0) partes.push(`${emPreparo} em preparo`);
    if (entregues > 0) partes.push(`${entregues} entregue${entregues > 1 ? 's' : ''}`);
    if (cancelados > 0) partes.push(`${cancelados} cancelado${cancelados > 1 ? 's' : ''}`);

    return partes.length > 0 ? partes.join(' · ') : 'Sem pedidos';
  }, [todosPedidos]);

  // Pedidos ordenados cronologicamente
  const pedidosOrdenados = useMemo(() => {
    return [...todosPedidos].sort((a, b) => {
      // Pendentes e em_preparo primeiro, depois por data
      const statusOrder: Record<StatusPedido, number> = {
        pendente: 0,
        em_preparo: 1,
        entregue: 2,
        cancelado: 3,
      };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    });
  }, [todosPedidos]);

  const handleFechar = () => {
    if (!id) return;
    fecharAtendimento(id);
    setConfirmarFechamento(false);
    navigate('/');
  };

  const handleSalvarApelido = (convidadoId: string) => {
    if (!id) return;
    atualizarApelido(id, convidadoId, apelidoEdit);
    const m = getMesa(id);
    if (m) setMesa(m);
    setEditandoId(null);
  };

  const handleMudarStatus = (pedidoId: string, novoStatus: StatusPedido) => {
    const atualizado = atualizarStatusPedido(pedidoId, novoStatus);
    if (atualizado) {
      carregarDados();
      const mensagens: Record<StatusPedido, string> = {
        pendente: 'Pedido marcado como pendente',
        em_preparo: 'Preparo iniciado',
        entregue: 'Pedido entregue com sucesso',
        cancelado: 'Pedido cancelado',
      };
      const tipos: Record<StatusPedido, 'success' | 'info' | 'warning'> = {
        pendente: 'info',
        em_preparo: 'info',
        entregue: 'success',
        cancelado: 'warning',
      };
      setToast({ message: mensagens[novoStatus], type: tipos[novoStatus] });
    }
    setConfirmarCancelamento(null);
  };

  const getResumoPedidosConvidado = (convidadoId: string) => {
    const pedidos = pedidosPorConvidado[convidadoId] || [];
    const pendentes = pedidos.filter(p => p.status === 'pendente').length;
    const emPreparo = pedidos.filter(p => p.status === 'em_preparo').length;
    const entregues = pedidos.filter(p => p.status === 'entregue').length;

    const partes: string[] = [];
    if (pendentes > 0) partes.push(`${pendentes} pendente${pendentes > 1 ? 's' : ''}`);
    if (emPreparo > 0) partes.push(`${emPreparo} em preparo`);
    if (entregues > 0) partes.push(`${entregues} entregue${entregues > 1 ? 's' : ''}`);

    return {
      texto: partes.length > 0 ? partes.join(', ') : 'Sem pedidos',
      total: pedidos.length,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Cabeçalho fixo */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Linha 1: Voltar + Mesa + Fechar */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-orange-700">{mesa.numero}</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">Mesa {mesa.numero}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Em atendimento
                </p>
              </div>
            </div>
            <button
              onClick={() => setConfirmarFechamento(true)}
              className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center active:bg-red-100 transition-colors"
            >
              <LogOut size={18} className="text-red-600" />
            </button>
          </div>

          {/* Linha 2: Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-600">
                <Users size={14} />
                <span className="font-medium">{atendimento.convidados.length}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock size={14} />
                <span className="font-medium">{formatarHora(atendimento.abertoEm)}</span>
              </span>
              <span className="text-slate-500">
                {tempoDecorrido(atendimento.abertoEm)}
              </span>
            </div>
          </div>

          {/* Linha 3: Resumo de status */}
          <div className="mt-2 bg-orange-50 rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-orange-800 text-center">
              {resumoStatus}
            </p>
          </div>

          {/* Alternador de visualização */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setModoVisualizacao('convidado')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                modoVisualizacao === 'convidado'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Por convidado
            </button>
            <button
              onClick={() => setModoVisualizacao('mesa')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                modoVisualizacao === 'mesa'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Por mesa
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {modoVisualizacao === 'convidado' ? (
          /* Modo: Por convidado */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {atendimento.convidados.map(convidado => {
                const classes = corParaClasses[convidado.cor];
                const editando = editandoId === convidado.id;
                const resumo = getResumoPedidosConvidado(convidado.id);
                const pedidos = pedidosPorConvidado[convidado.id] || [];

                return (
                  <div
                    key={convidado.id}
                    className={`bg-white border rounded-xl p-2.5 shadow-sm ${classes.border}`}
                  >
                    {/* Cabeçalho do card */}
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center ${classes.bg} shrink-0`}>
                        <span className={`text-[10px] font-medium ${classes.text}`}>Lugar</span>
                        <span className={`text-base font-bold ${classes.text}`}>{convidado.lugar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editando ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={apelidoEdit}
                              onChange={e => setApelidoEdit(e.target.value)}
                              placeholder="Apelido..."
                              className="w-full py-1 px-2 bg-slate-50 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSalvarApelido(convidado.id)}
                                className="flex-1 py-1 bg-emerald-100 rounded flex items-center justify-center"
                              >
                                <Check size={12} className="text-emerald-700" />
                              </button>
                              <button
                                onClick={() => setEditandoId(null)}
                                className="flex-1 py-1 bg-slate-100 rounded flex items-center justify-center"
                              >
                                <X size={12} className="text-slate-500" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 mb-0.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${classes.dot}`}></div>
                              <span className={`text-[10px] font-medium capitalize ${classes.text}`}>
                                {convidado.cor}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-semibold text-slate-800 truncate flex-1">
                                {convidado.apelido || `Convidado ${convidado.lugar}`}
                              </p>
                              <button
                                onClick={() => {
                                  setEditandoId(convidado.id);
                                  setApelidoEdit(convidado.apelido);
                                }}
                                className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center active:bg-slate-200 shrink-0"
                              >
                                <Edit3 size={9} className="text-slate-500" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Resumo de pedidos */}
                    <div className="text-[11px] text-slate-600 mb-1.5 line-clamp-1">
                      {resumo.texto}
                    </div>

                    {/* Lista de pedidos */}
                    {pedidos.length > 0 && (
                      <div className="space-y-1">
                        {pedidos.slice(0, 2).map(pedido => {
                          const sClasses = statusPedidoCores[pedido.status];
                          return (
                            <button
                              key={pedido.id}
                              onClick={() => navigate(`/pedido/${pedido.id}`)}
                              className="w-full flex items-center justify-between bg-slate-50 rounded px-1.5 py-1 text-left active:bg-slate-100 transition-colors"
                            >
                              <span className={`font-mono text-[10px] font-bold ${
                                pedido.status === 'cancelado' ? 'text-slate-400 line-through' : 'text-slate-700'
                              }`}>
                                {pedido.codigo}
                              </span>
                              <span className={`text-[10px] px-1 py-0.5 rounded ${sClasses.bg} ${sClasses.text}`}>
                                {statusPedidoLabels[pedido.status].split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                        {pedidos.length > 2 && (
                          <button
                            onClick={() => {
                              setModoVisualizacao('mesa');
                            }}
                            className="w-full text-[10px] text-emerald-600 font-medium py-0.5"
                          >
                            +{pedidos.length - 2} pedido{pedidos.length - 2 > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Botão + Pedido */}
                    <button
                      onClick={() => navigate(`/mesa/${mesa.id}/pedido/novo?convidadoId=${convidado.id}`)}
                      className="w-full mt-1.5 py-1.5 bg-emerald-600 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <Plus size={14} className="text-white" />
                      <span className="text-[11px] font-semibold text-white">Pedido</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Modo: Por mesa */
          <div className="space-y-3">
            {pedidosOrdenados.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-slate-500 text-lg">Nenhum pedido ainda</p>
                <p className="text-slate-400 text-sm mt-1">
                  Toque em um convidado para adicionar um pedido
                </p>
              </div>
            ) : (
              pedidosOrdenados.map(pedido => {
                const sClasses = statusPedidoCores[pedido.status];
                const convidado = atendimento.convidados.find(c => c.id === pedido.convidadoId);
                const convidadoClasses = convidado ? corParaClasses[convidado.cor] : null;

                return (
                  <div
                    key={pedido.id}
                    className={`bg-white border rounded-2xl p-4 shadow-sm ${sClasses.border}`}
                  >
                    {/* Cabeçalho do pedido */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-slate-800">
                          {pedido.codigo}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${sClasses.bg} ${sClasses.text}`}>
                          {statusPedidoLabels[pedido.status]}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/pedido/${pedido.id}`)}
                        className="text-xs text-emerald-600 font-medium"
                      >
                        Ver detalhes →
                      </button>
                    </div>

                    {/* Convidado */}
                    {convidado && convidadoClasses && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${convidadoClasses.bg}`}>
                          <span className={`text-sm font-bold ${convidadoClasses.text}`}>{convidado.lugar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {convidado.apelido || `Convidado ${convidado.lugar}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatarHora(pedido.criadoEm)} · {pedido.anotadoPor}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Itens */}
                    <div className="space-y-1 mb-3">
                      {pedido.itens.map(item => (
                        <div key={item.id} className="flex items-start gap-2 text-sm">
                          <span className="text-slate-500 font-medium shrink-0">
                            {item.quantidade}x
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={pedido.status === 'cancelado' ? 'text-slate-400 line-through' : 'text-slate-800'}>
                              {item.produtoNome}
                            </p>
                            {item.observacao && (
                              <p className={`text-xs italic ${
                                pedido.status === 'cancelado' ? 'text-slate-400 line-through' : 'text-amber-700'
                              }`}>
                                {item.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ações de status */}
                    {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        {pedido.status === 'pendente' && (
                          <button
                            onClick={() => handleMudarStatus(pedido.id, 'em_preparo')}
                            className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          >
                            <ChefHat size={16} />
                            Iniciar preparo
                          </button>
                        )}
                        {pedido.status === 'em_preparo' && (
                          <button
                            onClick={() => handleMudarStatus(pedido.id, 'entregue')}
                            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          >
                            <CheckCircle2 size={16} />
                            Marcar entregue
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmarCancelamento(pedido.id)}
                          className="py-2.5 px-4 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        >
                          <XCircle size={16} />
                          Cancelar
                        </button>
                      </div>
                    )}

                    {pedido.status === 'entregue' && (
                      <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-xl">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">Entregue</span>
                      </div>
                    )}

                    {pedido.status === 'cancelado' && (
                      <div className="flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-xl">
                        <XCircle size={16} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">Cancelado</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação de fechamento */}
      {confirmarFechamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <LogOut size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Fechar atendimento?</h3>
            <p className="text-slate-600 text-center text-sm">
              O atendimento da Mesa {mesa.numero} será encerrado e a mesa ficará livre.
              <br />
              <span className="text-slate-400">
                Aberto às {formatarHora(atendimento.abertoEm)} · {atendimento.convidados.length} convidado{atendimento.convidados.length !== 1 ? 's' : ''}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarFechamento(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleFechar}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de cancelamento de pedido */}
      {confirmarCancelamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Cancelar pedido?</h3>
            <p className="text-slate-600 text-center text-sm">
              O pedido será marcado como cancelado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarCancelamento(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-95 transition-transform"
              >
                Voltar
              </button>
              <button
                onClick={() => handleMudarStatus(confirmarCancelamento, 'cancelado')}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
