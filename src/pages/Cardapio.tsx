import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { Produto, Categoria, CATEGORIAS } from '../types';
import { getProdutos, toggleAtivo } from '../store';

const categoriaEmoji: Record<Categoria, string> = {
  'Entradas': '🥗',
  'Bebidas': '🥤',
  'Pratos Principais': '🍽️',
  'Sobremesas': '🍰',
};

const categoriaCor: Record<Categoria, string> = {
  'Entradas': 'bg-green-100 text-green-800',
  'Bebidas': 'bg-blue-100 text-blue-800',
  'Pratos Principais': 'bg-amber-100 text-amber-800',
  'Sobremesas': 'bg-pink-100 text-pink-800',
};

export default function Cardapio() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  useEffect(() => {
    setProdutos(getProdutos());
  }, []);

  const produtosFiltrados = useMemo(() => {
    let lista = produtos;
    if (!mostrarInativos) {
      lista = lista.filter(p => p.ativo);
    }
    if (busca.trim()) {
      const termo = busca.toLowerCase().trim();
      lista = lista.filter(
        p =>
          p.nome.toLowerCase().includes(termo) ||
          p.codigo.toLowerCase().includes(termo)
      );
    }
    return lista;
  }, [produtos, busca, mostrarInativos]);

  const agrupados = useMemo(() => {
    const grupos: Record<Categoria, Produto[]> = {
      'Entradas': [],
      'Bebidas': [],
      'Pratos Principais': [],
      'Sobremesas': [],
    };
    produtosFiltrados.forEach(p => {
      grupos[p.categoria].push(p);
    });
    return grupos;
  }, [produtosFiltrados]);

  const handleToggle = (id: string) => {
    toggleAtivo(id);
    setProdutos(getProdutos());
  };

  const totalAtivos = produtos.filter(p => p.ativo).length;
  const totalInativos = produtos.filter(p => !p.ativo).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cardápio</h2>
          <p className="text-sm text-slate-500">
            {totalAtivos} {totalAtivos === 1 ? 'produto ativo' : 'produtos ativos'}
            {totalInativos > 0 && ` · ${totalInativos} inativo${totalInativos > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/cardapio/produto/novo')}
          className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Toggle inativos */}
      {totalInativos > 0 && (
        <button
          onClick={() => setMostrarInativos(!mostrarInativos)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg px-3 py-2 active:bg-slate-200 transition-colors"
        >
          {mostrarInativos ? (
            <>
              <ToggleRight size={20} className="text-emerald-600" />
              Mostrando inativos
            </>
          ) : (
            <>
              <ToggleLeft size={20} className="text-slate-400" />
              Mostrar inativos ({totalInativos})
            </>
          )}
        </button>
      )}

      {/* Product Groups */}
      {CATEGORIAS.map(cat => {
        const items = agrupados[cat];
        if (items.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{categoriaEmoji[cat]}</span>
              <h3 className="text-lg font-semibold text-slate-700">{cat}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoriaCor[cat]}`}>
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map(produto => (
                <div
                  key={produto.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm ${
                    !produto.ativo ? 'border-slate-200 opacity-60' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {produto.codigo}
                        </span>
                        {!produto.ativo && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 text-base mt-1">{produto.nome}</p>
                      {produto.observacoes && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{produto.observacoes}</p>
                      )}
                      {produto.preco !== null && (
                        <p className="text-base font-bold text-emerald-700 mt-1">
                          R$ {produto.preco.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/cardapio/produto/${produto.id}`)}
                        className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center active:bg-slate-200 transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={18} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleToggle(produto.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          produto.ativo
                            ? 'bg-red-50 active:bg-red-100'
                            : 'bg-emerald-50 active:bg-emerald-100'
                        }`}
                        title={produto.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {produto.ativo ? (
                          <ToggleRight size={18} className="text-red-500" />
                        ) : (
                          <ToggleLeft size={18} className="text-emerald-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {produtosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-slate-400 text-sm mt-1">
            {busca ? 'Tente outro termo de busca' : 'Adicione produtos ao cardápio'}
          </p>
          {!busca && (
            <button
              onClick={() => navigate('/cardapio/produto/novo')}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform"
            >
              Adicionar Produto
            </button>
          )}
        </div>
      )}
    </div>
  );
}
