import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, LogOut, Edit3, Check, Users, X, Plus, ChefHat, CheckCircle2, XCircle } from 'lucide-react';
import { Mesa, corParaClasses, Pedido, StatusPedido, statusPedidoCores, statusPedidoLabels } from '../types';
import { getMesa, fecharAtendimento, atualizarApelido } from '../services/mesasService';
import { getPedidosByConvidado, getPedidosByAtendimento, atualizarStatusPedido, marcarItemEntregue, desmarcarItemEntregue } from '../services/pedidosService';
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

function formatarHoraEntrega(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Atendimento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarFechamento, setConfirmarFechamento] = useState(false);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [apelidoEdit, setApelidoEdit] = useState('');
  const [pedidosPorConvidado, setPedidosPorConvidado] = useState<Record<string, Pedido[]>>({});
  const [todosPedidos, setTodosPedidos] = useState<Pedido[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<'convidado' | 'mesa'>('convidado');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [, setTick] = useState(0);

  const carregarDados = async () => {
    if (!mesa?.atendimentoAberto) return;
    const map: Record<string, Pedido[]> = {};
    for (const c of mesa.atendimentoAberto.convidados) {
      map[c.id] = await getPedidosByConvidado(c.id);
    }
    setPedidosPorConvidado(map);
    setTodosPedidos(await getPedidosByAtendimento(mesa.atendimentoAberto.id));
  };

  useEffect(() => {
    let mounted = true;
    
    const carregar = async () => {
      setCarregando(true);
      setErro(null);
      
      try {
        if (!id) {
          setErro('ID da mesa não fornecido');
          setCarregando(false);
          return;
        }
        
        console.log('Carregando mesa:', id);
        const m = await getMesa(id);
        
        if (!mounted) return;
        
        if (!m) {
          console.error('Mesa não encontrada:', id);
          setErro('Mesa não encontrada');
          setCarregando(false);
          return;
        }
        
        if (!m.atendimentoAberto) {
          console.error('Mesa sem atendimento aberto:', id);
          setErro('Esta mesa não tem atendimento aberto');
          setCarregando(false);
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        // Validar dados
        if (!Array.isArray(m.atendimentoAberto.convidados)) {
          console.error('Dados de convidados inválidos');
          setErro('Dados de convidados inválidos');
          setCarregando(false);
          return;
        }
        
        console.log('Mesa carregada com sucesso:', m.numero);
        setMesa(m);
        
        // Carregar pedidos
        console.log('Carregando pedidos...');
        const map: Record<string, Pedido[]> = {};
        for (const c of m.atendimentoAberto.convidados) {
          map[c.id] = await getPedidosByConvidado(c.id);
        }
        
        if (!mounted) return;
        
        setPedidosPorConvidado(map);
        const pedidos = await getPedidosByAtendimento(m.atendimentoAberto.id);
        setTodosPedidos(pedidos);
        
        console.log('Pedidos carregados:', pedidos.length);
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao carregar atendimento:', error);
        setErro(`Erro ao carregar atendimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        setCarregando(false);
      }
    };
    
    carregar();
    
    return () => { mounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (!mesa?.atendimentoAberto) return;
    const interval = setInterval(async () => {
      setTick(t => t + 1);
      await carregarDados();
    }, 30000);
    return () => clearInterval(interval);
  }, [mesa]);

  // Tela de carregamento
  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Clock size={32} className="text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-slate-700">Carregando atendimento...</p>
          <p className="text-sm text-slate-500">Aguarde enquanto buscamos os dados</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (erro) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center">Erro ao Carregar</h2>
          <p className="text-sm text-slate-600 text-center">{erro}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-95 transition-transform"
            >
              Voltar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mesa || !mesa.atendimentoAberto) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border-2 border-amber-200">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center">Atendimento Não Encontrado</h2>
          <p className="text-sm text-slate-600 text-center">
            Esta mesa não possui um atendimento aberto ou os dados não foram carregados corretamente.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
          >
            Voltar para Mesas
          </button>
        </div>
      </div>
    );
  }

  const atendimento = mesa.atendimentoAberto;

  // Resumo por itens
  const resumoItens = useMemo(() => {
    try {
      let pendentes = 0;
      let emPreparo = 0;
      let entregues = 0;

      todosPedidos.forEach(pedido => {
        if (pedido.status === 'cancelado') return;
        if (!Array.isArray(pedido.itens)) return;
        pedido.itens.forEach(item => {
          if (item.entregueEm) {
            entregues++;
          } else if (pedido.status === 'pendente') {
            pendentes++;
          } else {
            emPreparo++;
          }
        });
      });

      const partes: string[] = [];
      if (pendentes > 0) partes.push(`${pendentes} pendente${pendentes > 1 ? 's' : ''}`);
      if (emPreparo > 0) partes.push(`${emPreparo} em preparo`);
      if (entregues > 0) partes.push(`${entregues} entregue${entregues > 1 ? 's' : ''}`);

      return partes.length > 0 ? partes.join(' · ') : 'Sem itens';
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
      return 'Sem itens';
    }
  }, [todosPedidos]);

  // Pedidos ordenados
  const pedidosOrdenados = useMemo(() => {
    return [...todosPedidos].sort((a, b) => {
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

  const handleFechar = async () => {
    if (!id) return;
    await fecharAtendimento(id);
    setConfirmarFechamento(false);
    navigate('/');
  };

  const handleSalvarApelido = async (convidadoId: string) => {
    if (!id) return;
    await atualizarApelido(id, convidadoId, apelidoEdit);
    const m = await getMesa(id);
    if (m) setMesa(m);
    setEditandoId(null);
  };

  const handleMudarStatus = async (pedidoId: string, novoStatus: StatusPedido) => {
    const atualizado = await atualizarStatusPedido(pedidoId, novoStatus);
    if (atualizado) {
      await carregarDados();
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

  const handleMarcarItemEntregue = async (pedidoId: string, itemId: string) => {
    const atualizado = await marcarItemEntregue(pedidoId, itemId);
    if (atualizado) {
      await carregarDados();
      setToast({ message: 'Item marcado como entregue', type: 'success' });
    }
  };

  const handleDesmarcarItemEntregue = async (pedidoId: string, itemId: string) => {
    const atualizado = await desmarcarItemEntregue(pedidoId, itemId);
    if (atualizado) {
      await carregarDados();
      setToast({ message: 'Item desmarcado', type: 'info' });
    }
  };

  const getResumoPedidosConvidado = (convidadoId: string) => {
    try {
      const pedidos = pedidosPorConvidado[convidadoId] || [];
      let pendentes = 0;
      let emPreparo = 0;
      let entregues = 0;

      pedidos.forEach(pedido => {
        if (pedido.status === 'cancelado') return;
        if (!Array.isArray(pedido.itens)) return;
        pedido.itens.forEach(item => {
          if (item.entregueEm) {
            entregues++;
          } else if (pedido.status === 'pendente') {
            pendentes++;
          } else {
            emPreparo++;
          }
        });
      });

      const partes: string[] = [];
      if (pendentes > 0) partes.push(`${pendentes} pendente${pendentes > 1 ? 's' : ''}`);
      if (emPreparo > 0) partes.push(`${emPreparo} em preparo`);
      if (entregues > 0) partes.push(`${entregues} entregue${entregues > 1 ? 's' : ''}`);

      return {
        texto: partes.length > 0 ? partes.join(', ') : 'Sem pedidos',
        total: pedidos.filter(p => p.status !== 'cancelado').length,
      };
    } catch (error) {
      console.error('Erro ao calcular resumo do convidado:', error);
      return { texto: 'Sem pedidos', total: 0 };
    }
  };

  const getPedidoStatus = (pedido: Pedido) => {
    try {
      if (pedido.status === 'cancelado') return 'cancelado';
      if (!Array.isArray(pedido.itens)) return 'nenhum';
      const totalItens = pedido.itens.length;
      const itensEntregues = pedido.itens.filter(i => i.entregueEm).length;
      if (itensEntregues === 0) return 'nenhum';
      if (itensEntregues === totalItens) return 'concluido';
      return 'parcial';
    } catch (error) {
      console.error('Erro ao calcular status do pedido:', error);
      return 'nenhum';
    }
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

          {/* Linha 3: Resumo por itens */}
          <div className="mt-2 bg-orange-50 rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-orange-800 text-center">
              {resumoItens}
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
            <div className="grid grid-cols-1 gap-3">
              {atendimento.convidados.map(convidado => {
                const classes = corParaClasses[convidado.cor];
                const editando = editandoId === convidado.id;
                const resumo = getResumoPedidosConvidado(convidado.id);
                const pedidos = pedidosPorConvidado[convidado.id] || [];

                return (
                  <div
                    key={convidado.id}
                    className={`bg-white border-2 rounded-2xl p-4 shadow-sm ${classes.border}`}
                  >
                    {/* Cabeçalho do card */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${classes.bg} shrink-0`}>
                        <span className={`text-xs font-medium ${classes.text}`}>Lugar</span>
                        <span className={`text-xl font-bold ${classes.text}`}>{convidado.lugar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editando ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={apelidoEdit}
                              onChange={e => setApelidoEdit(e.target.value)}
                              placeholder="Apelido..."
                              className="w-full py-2 px-3 bg-slate-50 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSalvarApelido(convidado.id)}
                                className="flex-1 py-2 bg-emerald-100 rounded-lg flex items-center justify-center gap-1"
                              >
                                <Check size={16} className="text-emerald-700" />
                                <span className="text-xs font-medium text-emerald-700">Salvar</span>
                              </button>
                              <button
                                onClick={() => setEditandoId(null)}
                                className="flex-1 py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-1"
                              >
                                <X size={16} className="text-slate-500" />
                                <span className="text-xs font-medium text-slate-500">Cancelar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-4 h-4 rounded-full ${classes.dot}`}></div>
                              <span className={`text-sm font-medium capitalize ${classes.text}`}>
                                {convidado.cor}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-slate-800 flex-1">
                                {convidado.apelido || `Convidado ${convidado.lugar}`}
                              </p>
                              <button
                                onClick={() => {
                                  setEditandoId(convidado.id);
                                  setApelidoEdit(convidado.apelido);
                                }}
                                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center active:bg-slate-200 shrink-0"
                              >
                                <Edit3 size={14} className="text-slate-500" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{resumo.texto}</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/mesa/${mesa.id}/pedido/novo?convidadoId=${convidado.id}`)}
                        className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm shrink-0"
                      >
                        <Plus size={22} className="text-white" />
                      </button>
                    </div>

                    {/* Lista de pedidos com conteúdo */}
                    {pedidos.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {pedidos.map(pedido => {
                          const pedidoStatus = getPedidoStatus(pedido);
                          const sClasses = statusPedidoCores[pedido.status];

                          return (
                            <div key={pedido.id} className="space-y-2">
                              {/* Itens do pedido */}
                              {pedido.itens.map(item => (
                                <div key={item.id} className="flex items-start gap-2">
                                  <button
                                    onClick={() => {
                                      if (item.entregueEm) {
                                        handleDesmarcarItemEntregue(pedido.id, item.id);
                                      } else {
                                        handleMarcarItemEntregue(pedido.id, item.id);
                                      }
                                    }}
                                    disabled={pedido.status === 'cancelado'}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                                      item.entregueEm
                                        ? 'bg-green-500 text-white'
                                        : pedido.status === 'cancelado'
                                        ? 'bg-slate-100 text-slate-300'
                                        : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                                    }`}
                                  >
                                    {item.entregueEm ? (
                                      <Check size={16} />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-current rounded"></div>
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${
                                      item.entregueEm || pedido.status === 'cancelado'
                                        ? 'text-slate-400 line-through'
                                        : 'text-slate-800'
                                    }`}>
                                      {item.quantidade}x {item.produtoNome}
                                    </p>
                                    {item.observacao && (
                                      <p className={`text-xs italic ${
                                        item.entregueEm || pedido.status === 'cancelado'
                                          ? 'text-slate-400 line-through'
                                          : 'text-amber-700'
                                      }`}>
                                        {item.observacao}
                                      </p>
                                    )}
                                    {item.entregueEm && (
                                      <p className="text-[10px] text-green-600 mt-0.5">
                                        ✓ Entregue às {formatarHoraEntrega(item.entregueEm)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {/* Rodapé do pedido */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {pedido.codigo}
                                  </span>
                                  {pedidoStatus === 'parcial' && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                                      Parcial
                                    </span>
                                  )}
                                  {pedidoStatus === 'concluido' && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                      Concluído
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => navigate(`/pedido/${pedido.id}`)}
                                  className="text-[10px] text-emerald-600 font-medium"
                                >
                                  Ver detalhes →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                const pedidoStatus = getPedidoStatus(pedido);

                return (
                  <div
                    key={pedido.id}
                    className={`bg-white border-2 rounded-2xl p-4 shadow-sm ${sClasses.border}`}
                  >
                    {/* Cabeçalho do pedido */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-slate-800">
                          {pedido.codigo}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${sClasses.bg} ${sClasses.text}`}>
                          {statusPedidoLabels[pedido.status]}
                        </span>
                        {pedidoStatus === 'parcial' && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                            Parcial
                          </span>
                        )}
                        {pedidoStatus === 'concluido' && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Concluído
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/pedido/${pedido.id}`)}
                        className="text-xs text-emerald-600 font-medium"
                      >
                        Detalhes →
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
                    <div className="space-y-2 mb-3">
                      {pedido.itens.map(item => (
                        <div key={item.id} className="flex items-start gap-2">
                          <button
                            onClick={() => {
                              if (item.entregueEm) {
                                handleDesmarcarItemEntregue(pedido.id, item.id);
                              } else {
                                handleMarcarItemEntregue(pedido.id, item.id);
                              }
                            }}
                            disabled={pedido.status === 'cancelado'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                              item.entregueEm
                                ? 'bg-green-500 text-white'
                                : pedido.status === 'cancelado'
                                ? 'bg-slate-100 text-slate-300'
                                : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                            }`}
                          >
                            {item.entregueEm ? (
                              <Check size={16} />
                            ) : (
                              <div className="w-4 h-4 border-2 border-current rounded"></div>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              item.entregueEm || pedido.status === 'cancelado'
                                ? 'text-slate-400 line-through'
                                : 'text-slate-800'
                            }`}>
                              {item.quantidade}x {item.produtoNome}
                            </p>
                            {item.observacao && (
                              <p className={`text-xs italic ${
                                item.entregueEm || pedido.status === 'cancelado'
                                  ? 'text-slate-400 line-through'
                                  : 'text-amber-700'
                              }`}>
                                {item.observacao}
                              </p>
                            )}
                            {item.entregueEm && (
                              <p className="text-[10px] text-green-600 mt-0.5">
                                ✓ Entregue às {formatarHoraEntrega(item.entregueEm)}
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
