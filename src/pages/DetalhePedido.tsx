import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User, ChefHat, CheckCircle2, XCircle, AlertCircle, Check } from 'lucide-react';
import { Pedido, StatusPedido, statusPedidoLabels, statusPedidoCores } from '../types';
import { getPedido, atualizarStatusPedido, marcarItemEntregue, desmarcarItemEntregue } from '../pedidosStore';
import Toast from '../components/Toast';

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const fluxos: Record<StatusPedido, { label: string; proximo: StatusPedido | null; cor: string; icon: React.ReactNode }> = {
  pendente: {
    label: 'Iniciar Preparo',
    proximo: 'em_preparo',
    cor: 'bg-blue-500',
    icon: <ChefHat size={20} />,
  },
  em_preparo: {
    label: 'Marcar Entregue',
    proximo: 'entregue',
    cor: 'bg-green-500',
    icon: <CheckCircle2 size={20} />,
  },
  entregue: {
    label: '',
    proximo: null,
    cor: '',
    icon: null,
  },
  cancelado: {
    label: '',
    proximo: null,
    cor: '',
    icon: null,
  },
};

export default function DetalhePedido() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (!id) return;
    const p = getPedido(id);
    if (!p) {
      navigate('/');
      return;
    }
    setPedido(p);
  }, [id, navigate]);

  if (!pedido) return null;

  const statusClasses = statusPedidoCores[pedido.status];
  const fluxo = fluxos[pedido.status];

  const handleMudarStatus = (novoStatus: StatusPedido) => {
    if (!id) return;
    const atualizado = atualizarStatusPedido(id, novoStatus);
    if (atualizado) {
      setPedido(atualizado);
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
    setConfirmarCancelamento(false);
  };

  const handleMarcarItemEntregue = (itemId: string) => {
    if (!id) return;
    const atualizado = marcarItemEntregue(id, itemId);
    if (atualizado) {
      setPedido(atualizado);
      setToast({ message: 'Item marcado como entregue', type: 'success' });
    }
  };

  const handleDesmarcarItemEntregue = (itemId: string) => {
    if (!id) return;
    const atualizado = desmarcarItemEntregue(id, itemId);
    if (atualizado) {
      setPedido(atualizado);
      setToast({ message: 'Item desmarcado', type: 'info' });
    }
  };

  const totalItens = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0);
  const valorTotal = pedido.itens.reduce((acc, i) => {
    if (i.precoUnitario === null) return acc;
    return acc + i.precoUnitario * i.quantidade;
  }, 0);

  const itensEntregues = pedido.itens.filter(i => i.entregueEm).length;
  const pedidoStatus = pedido.status === 'cancelado' ? 'cancelado' :
    itensEntregues === 0 ? 'nenhum' :
    itensEntregues === pedido.itens.length ? 'concluido' : 'parcial';

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/mesa/${pedido.mesaId}`)}
          className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Detalhe do Pedido</h2>
        </div>
      </div>

      {/* Código em destaque */}
      <div className="bg-slate-800 rounded-2xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Código do Pedido</p>
        <p className="text-3xl font-bold text-white tracking-wider font-mono">{pedido.codigo}</p>
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full ${statusClasses.bg}`}>
          <span className={`w-2 h-2 rounded-full ${
            pedido.status === 'pendente' ? 'bg-yellow-500' :
            pedido.status === 'em_preparo' ? 'bg-blue-500' :
            pedido.status === 'entregue' ? 'bg-green-500' :
            'bg-slate-400'
          }`}></span>
          <span className={`text-sm font-semibold ${statusClasses.text}`}>
            {statusPedidoLabels[pedido.status]}
          </span>
        </div>
        {pedidoStatus === 'parcial' && (
          <div className="mt-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
              Parcial ({itensEntregues}/{pedido.itens.length} itens)
            </span>
          </div>
        )}
        {pedidoStatus === 'concluido' && (
          <div className="mt-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              Todos os itens entregues
            </span>
          </div>
        )}
      </div>

      {/* Info do convidado e garçom */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <User size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Convidado</p>
            <p className="font-semibold text-slate-800">
              {pedido.convidadoApelido || `Convidado ${pedido.convidadoLugar}`} — Lugar {pedido.convidadoLugar}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Anotado por</p>
            <p className="font-semibold text-slate-800">{pedido.anotadoPor}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Criado em</p>
            <p className="font-semibold text-slate-800">{formatarDataHora(pedido.criadoEm)}</p>
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-700">Itens</h3>
          <span className="text-sm text-slate-500">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
        </div>
        <div className="space-y-2">
          {pedido.itens.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Botão de entrega */}
                <button
                  onClick={() => {
                    if (item.entregueEm) {
                      handleDesmarcarItemEntregue(item.id);
                    } else {
                      handleMarcarItemEntregue(item.id);
                    }
                  }}
                  disabled={pedido.status === 'cancelado'}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                    item.entregueEm
                      ? 'bg-green-500 text-white'
                      : pedido.status === 'cancelado'
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                  }`}
                >
                  {item.entregueEm ? (
                    <Check size={20} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-current rounded"></div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.produtoCodigo}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      x{item.quantidade}
                    </span>
                  </div>
                  <p className={`font-semibold text-base mt-1 ${
                    item.entregueEm || pedido.status === 'cancelado'
                      ? 'text-slate-400 line-through'
                      : 'text-slate-800'
                  }`}>
                    {item.produtoNome}
                  </p>
                  {item.observacao && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${
                      item.entregueEm || pedido.status === 'cancelado'
                        ? 'text-slate-400 line-through'
                        : 'text-amber-700'
                    }`}>
                      <AlertCircle size={12} />
                      {item.observacao}
                    </p>
                  )}
                  {item.entregueEm && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Entregue às {formatarHora(item.entregueEm)}
                    </p>
                  )}
                </div>
                {item.precoUnitario !== null && (
                  <div className="text-right shrink-0">
                    <p className="text-sm text-slate-500">
                      R$ {item.precoUnitario.toFixed(2).replace('.', ',')} un.
                    </p>
                    <p className={`font-bold ${
                      item.entregueEm || pedido.status === 'cancelado'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800'
                    }`}>
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        {valorTotal > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold text-emerald-800">Total</span>
            <span className="text-xl font-bold text-emerald-700">
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}
      </div>

      {/* Histórico de status */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-700">Histórico</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          {pedido.historicoStatus.map((h, i) => {
            const cls = statusPedidoCores[h.status];
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    h.status === 'pendente' ? 'bg-yellow-500' :
                    h.status === 'em_preparo' ? 'bg-blue-500' :
                    h.status === 'entregue' ? 'bg-green-500' :
                    'bg-slate-400'
                  }`}></span>
                  <span className={`text-sm font-medium ${cls.text}`}>
                    {statusPedidoLabels[h.status]}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatarDataHora(h.timestamp)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações de status */}
      {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
        <div className="space-y-3">
          {fluxo.proximo && (
            <button
              onClick={() => handleMudarStatus(fluxo.proximo!)}
              className={`w-full py-4 ${fluxo.cor} text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform`}
            >
              {fluxo.icon}
              {fluxo.label}
            </button>
          )}
          <button
            onClick={() => setConfirmarCancelamento(true)}
            className="w-full py-4 bg-slate-200 text-slate-700 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <XCircle size={22} />
            Cancelar Pedido
          </button>
        </div>
      )}

      {pedido.status === 'entregue' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Pedido Entregue</p>
          <p className="text-sm text-green-600">Este pedido foi concluído</p>
        </div>
      )}

      {pedido.status === 'cancelado' && (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
          <XCircle size={32} className="text-slate-400 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">Pedido Cancelado</p>
        </div>
      )}

      {/* Modal de confirmação de cancelamento */}
      {confirmarCancelamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Cancelar pedido?</h3>
            <p className="text-slate-600 text-center text-sm">
              O pedido <span className="font-mono font-bold">{pedido.codigo}</span> será cancelado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarCancelamento(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-95 transition-transform"
              >
                Voltar
              </button>
              <button
                onClick={() => handleMudarStatus('cancelado')}
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
