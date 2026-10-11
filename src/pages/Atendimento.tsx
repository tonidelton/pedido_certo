import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, LogOut, Edit3, Check, Users, X, Plus, FileText } from 'lucide-react';
import { Mesa, corParaClasses, Pedido, statusPedidoCores, statusPedidoLabels } from '../types';
import { getMesa, fecharAtendimento, atualizarApelido } from '../mesasStore';
import { getPedidosByConvidado } from '../pedidosStore';

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [apelidoEdit, setApelidoEdit] = useState('');
  const [pedidosPorConvidado, setPedidosPorConvidado] = useState<Record<string, Pedido[]>>({});
  const [, setTick] = useState(0);

  const carregarPedidos = () => {
    if (!mesa?.atendimentoAberto) return;
    const map: Record<string, Pedido[]> = {};
    mesa.atendimentoAberto.convidados.forEach(c => {
      map[c.id] = getPedidosByConvidado(c.id);
    });
    setPedidosPorConvidado(map);
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
  }, [id, navigate]);

  // Atualiza o timer a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      carregarPedidos();
    }, 30000);
    return () => clearInterval(interval);
  }, [mesa]);

  if (!mesa || !mesa.atendimentoAberto) return null;

  const atendimento = mesa.atendimentoAberto;

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

  const totalPedidos = Object.values(pedidosPorConvidado).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">Mesa {mesa.numero}</h2>
          <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Em atendimento
          </p>
        </div>
      </div>

      {/* Info do atendimento */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Aberto em</span>
          </div>
          <span className="text-sm font-bold text-orange-900">
            {formatarDataHora(atendimento.abertoEm)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Tempo</span>
          </div>
          <span className="text-sm font-bold text-orange-900">
            {tempoDecorrido(atendimento.abertoEm)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Convidados</span>
          </div>
          <span className="text-sm font-bold text-orange-900">
            {atendimento.convidados.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Pedidos</span>
          </div>
          <span className="text-sm font-bold text-orange-900">
            {totalPedidos}
          </span>
        </div>
      </div>

      {/* Cards dos convidados */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700">Convidados</h3>
        <div className="space-y-3">
          {atendimento.convidados.map(convidado => {
            const classes = corParaClasses[convidado.cor];
            const editando = editandoId === convidado.id;
            const pedidos = pedidosPorConvidado[convidado.id] || [];
            const pedidosPendentes = pedidos.filter(p => p.status !== 'entregue' && p.status !== 'cancelado');

            return (
              <div
                key={convidado.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm ${classes.border}`}
              >
                <div className="flex items-center gap-3">
                  {/* Indicador de lugar */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${classes.bg}`}>
                    <span className={`text-xs font-medium ${classes.text}`}>Lugar</span>
                    <span className={`text-xl font-bold ${classes.text}`}>{convidado.lugar}</span>
                  </div>

                  {/* Cor + apelido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${classes.dot}`}></div>
                      <span className={`text-sm font-medium capitalize ${classes.text}`}>
                        {convidado.cor}
                      </span>
                    </div>
                    {editando ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={apelidoEdit}
                          onChange={e => setApelidoEdit(e.target.value)}
                          placeholder="Apelido..."
                          className="flex-1 py-2 px-3 bg-slate-50 rounded-lg text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSalvarApelido(convidado.id)}
                          className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center active:bg-emerald-200"
                        >
                          <Check size={18} className="text-emerald-700" />
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center active:bg-slate-200"
                        >
                          <X size={18} className="text-slate-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-800 truncate">
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
                    )}
                  </div>

                  {/* Botão + Pedido */}
                  <button
                    onClick={() => navigate(`/mesa/${mesa.id}/pedido/novo?convidadoId=${convidado.id}`)}
                    className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm shrink-0"
                    title="Novo pedido"
                  >
                    <Plus size={20} className="text-white" />
                  </button>
                </div>

                {/* Lista de pedidos do convidado */}
                {pedidos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Pedidos ({pedidos.length})
                    </p>
                    {pedidos.map(pedido => {
                      const sClasses = statusPedidoCores[pedido.status];
                      return (
                        <button
                          key={pedido.id}
                          onClick={() => navigate(`/pedido/${pedido.id}`)}
                          className="w-full flex items-center justify-between bg-slate-50 rounded-xl p-3 text-left active:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-sm font-bold text-slate-700">
                              {pedido.codigo}
                            </span>
                            <span className="text-xs text-slate-500">
                              {pedido.itens.reduce((a, i) => a + i.quantidade, 0)}{' '}
                              {pedido.itens.reduce((a, i) => a + i.quantidade, 0) === 1 ? 'item' : 'itens'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sClasses.bg} ${sClasses.text}`}>
                              {statusPedidoLabels[pedido.status]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão fechar atendimento */}
      <button
        onClick={() => setConfirmarFechamento(true)}
        className="w-full py-4 bg-red-500 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
      >
        <LogOut size={22} />
        Fechar Atendimento
      </button>

      {/* Modal de confirmação */}
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
    </div>
  );
}
