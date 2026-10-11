import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, X, Ticket, Database } from 'lucide-react';
import { Mesa } from '../types';
import { getMesas, excluirMesa } from '../services/mesasService';
import { getPedidoByCodigo } from '../services/pedidosService';
import { isFirebaseConfigured } from '../firebase';
import Toast from '../components/Toast';

export default function Mesas() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [busca, setBusca] = useState('');
  const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [firebaseConfigurado, setFirebaseConfigurado] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const mesasData = await getMesas();
      setMesas(mesasData);
      setFirebaseConfigurado(isFirebaseConfigured());
    };
    carregar();
  }, []);

  const mesasFiltradas = useMemo(() => {
    if (!busca.trim()) return mesas;
    const termo = busca.toLowerCase().trim();
    return mesas.filter(m => m.numero.toLowerCase().includes(termo));
  }, [mesas, busca]);

  const handleBuscaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busca.trim()) return;

    const termo = busca.trim();

    // Verificar se é um código de pedido (formato M{número}-P{sequência})
    const codigoPedidoRegex = /^M\d+-P\d+$/i;
    if (codigoPedidoRegex.test(termo)) {
      const pedido = await getPedidoByCodigo(termo);
      if (pedido) {
        navigate(`/pedido/${pedido.id}`);
        setBusca('');
        return;
      } else {
        setToast({ message: `Pedido "${termo}" não encontrado`, type: 'error' });
        return;
      }
    }
  };

  const handleBuscaChange = (valor: string) => {
    setBusca(valor);
  };

  const handleExcluir = async (id: string) => {
    await excluirMesa(id);
    const mesasData = await getMesas();
    setMesas(mesasData);
    setConfirmarExclusao(null);
    setToast({ message: 'Mesa excluída com sucesso', type: 'success' });
  };

  const handleTapMesa = (mesa: Mesa) => {
    if (mesa.atendimentoAberto) {
      navigate(`/mesa/${mesa.id}`);
    } else {
      navigate(`/mesa/${mesa.id}/abrir`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mesas</h2>
          <p className="text-sm text-slate-500">
            {mesas.filter(m => m.atendimentoAberto).length} ocupada{mesas.filter(m => m.atendimentoAberto).length !== 1 ? 's' : ''} · {mesas.filter(m => !m.atendimentoAberto).length} livre{mesas.filter(m => !m.atendimentoAberto).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/config/firebase')}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              firebaseConfigurado
                ? 'bg-green-100 text-green-600'
                : 'bg-amber-100 text-amber-600'
            }`}
            title={firebaseConfigurado ? 'Firebase configurado' : 'Configurar Firebase'}
          >
            <Database size={20} />
          </button>
          <button
            onClick={() => navigate('/mesa/nova')}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="text-sm">Nova mesa</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleBuscaSubmit} className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar mesa ou pedido (ex: M3-P01)..."
          value={busca}
          onChange={e => handleBuscaChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {busca && /^M\d+-P\d+$/i.test(busca.trim()) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">
            <Ticket size={12} />
            <span>Pedido</span>
          </div>
        )}
      </form>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 gap-3">
        {mesasFiltradas.map(mesa => {
          const ocupada = !!mesa.atendimentoAberto;
          const numConvidados = mesa.atendimentoAberto?.convidados.length || 0;

          return (
            <div
              key={mesa.id}
              className="relative group"
            >
              <button
                onClick={() => handleTapMesa(mesa)}
                className={`w-full rounded-2xl p-4 border-2 text-left transition-all active:scale-[0.97] shadow-sm ${
                  ocupada
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    ocupada
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-green-200 text-green-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${ocupada ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                    {ocupada ? 'Ocupada' : 'Livre'}
                  </span>
                  {mesa.capacidade && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={12} />
                      {mesa.capacidade}
                    </span>
                  )}
                </div>

                {/* Número da mesa */}
                <div className="flex items-center gap-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    ocupada ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {mesa.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-base truncate">
                      Mesa {mesa.numero}
                    </p>
                    {ocupada && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <Users size={12} />
                          {numConvidados}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info adicional se ocupada */}
                {ocupada && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-orange-700 font-medium">
                    <Ticket size={12} />
                    <span>Ver atendimento</span>
                  </div>
                )}
              </button>

              {/* Botão excluir (apenas se livre) */}
              {!ocupada && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmarExclusao(mesa.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity shadow-sm"
                  title="Excluir mesa"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {mesasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🪑</div>
          <p className="text-slate-500 text-lg">Nenhuma mesa encontrada</p>
          <p className="text-slate-400 text-sm mt-1">
            {busca ? 'Tente outro termo de busca' : 'Cadastre sua primeira mesa'}
          </p>
          {!busca && (
            <button
              onClick={() => navigate('/mesa/nova')}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
            >
              Nova Mesa
            </button>
          )}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmarExclusao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Excluir mesa?</h3>
            <p className="text-slate-600">
              Esta ação não pode ser desfeita. A mesa será removida permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarExclusao(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(confirmarExclusao)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
