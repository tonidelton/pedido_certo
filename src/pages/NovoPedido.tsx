import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, Trash2, Save, ShoppingCart, X } from 'lucide-react';
import { Produto, Categoria, CATEGORIAS, Convidado, corParaClasses, Mesa, ItemPedido } from '../types';
import { getMesa } from '../mesasStore';
import { getProdutos } from '../store';
import { criarPedido } from '../pedidosStore';

const categoriaEmoji: Record<Categoria, string> = {
  'Entradas': '🥗',
  'Bebidas': '🥤',
  'Pratos Principais': '🍽️',
  'Sobremesas': '🍰',
};

interface ItemCarrinho {
  key: string;
  produto: Produto;
  quantidade: number;
  observacao: string;
}

export default function NovoPedido() {
  const navigate = useNavigate();
  const { id: mesaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const convidadoId = searchParams.get('convidadoId') || '';

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todas'>('todas');

  // Carrinho de itens
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacaoItem, setObservacaoItem] = useState('');

  // Dados do pedido
  const [anotadoPor, setAnotadoPor] = useState('');

  useEffect(() => {
    if (!mesaId) return;
    const m = getMesa(mesaId);
    if (!m || !m.atendimentoAberto) {
      navigate('/');
      return;
    }
    setMesa(m);

    const conv = m.atendimentoAberto.convidados.find(c => c.id === convidadoId);
    if (!conv) {
      navigate('/');
      return;
    }
    setConvidado(conv);

    // Produtos ativos
    setProdutos(getProdutos().filter(p => p.ativo));
  }, [mesaId, convidadoId, navigate]);

  const produtosFiltrados = useMemo(() => {
    let lista = produtos;
    if (categoriaFiltro !== 'todas') {
      lista = lista.filter(p => p.categoria === categoriaFiltro);
    }
    if (busca.trim()) {
      const termo = busca.toLowerCase().trim();
      lista = lista.filter(
        p => p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo)
      );
    }
    return lista;
  }, [produtos, busca, categoriaFiltro]);

  const handleAdicionarAoCarrinho = () => {
    if (!produtoSelecionado) return;
    const item: ItemCarrinho = {
      key: `${Date.now()}-${Math.random()}`,
      produto: produtoSelecionado,
      quantidade,
      observacao: observacaoItem.trim(),
    };
    setCarrinho([...carrinho, item]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setObservacaoItem('');
  };

  const handleRemoverItem = (key: string) => {
    setCarrinho(carrinho.filter(i => i.key !== key));
  };

  const handleSalvar = () => {
    if (!mesa || !convidado || !mesa.atendimentoAberto || carrinho.length === 0) return;

    const itens: ItemPedido[] = carrinho.map(item => ({
      id: `item-${Date.now()}-${Math.random()}`,
      produtoId: item.produto.id,
      produtoNome: item.produto.nome,
      produtoCodigo: item.produto.codigo,
      quantidade: item.quantidade,
      observacao: item.observacao,
      precoUnitario: item.produto.preco,
    }));

    const pedido = criarPedido(
      mesa.id,
      mesa.numero,
      mesa.atendimentoAberto.id,
      convidado.id,
      convidado.lugar,
      convidado.apelido,
      itens,
      anotadoPor.trim() || 'Garçom'
    );

    navigate(`/pedido/${pedido.id}`);
  };

  if (!mesa || !convidado) return null;

  const classesConvidado = corParaClasses[convidado.cor];
  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/mesa/${mesaId}`)}
          className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Novo Pedido</h2>
          <p className="text-sm text-slate-500">Mesa {mesa.numero}</p>
        </div>
      </div>

      {/* Info do convidado */}
      <div className={`border rounded-2xl p-4 ${classesConvidado.border} ${classesConvidado.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${classesConvidado.bg} border ${classesConvidado.border}`}>
            <span className={`text-xs font-medium ${classesConvidado.text}`}>Lugar</span>
            <span className={`text-lg font-bold ${classesConvidado.text}`}>{convidado.lugar}</span>
          </div>
          <div>
            <p className={`font-semibold ${classesConvidado.text}`}>
              {convidado.apelido || `Convidado ${convidado.lugar}`}
            </p>
            <p className={`text-xs ${classesConvidado.text} opacity-75`}>
              Mesa {mesa.numero}
            </p>
          </div>
        </div>
      </div>

      {/* Busca de produtos */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou código..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por categoria */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setCategoriaFiltro('todas')}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoriaFiltro === 'todas'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Todos
          </button>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                categoriaFiltro === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <span>{categoriaEmoji[cat]}</span>
              <span className="hidden sm:inline">{cat}</span>
              <span className="sm:hidden">{cat.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-2">
        {produtosFiltrados.map(produto => (
          <button
            key={produto.id}
            onClick={() => setProdutoSelecionado(produto)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {produto.codigo}
                  </span>
                  <span className="text-xs text-slate-400">{produto.categoria}</span>
                </div>
                <p className="font-semibold text-slate-800 text-base mt-1">{produto.nome}</p>
                {produto.observacoes && (
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{produto.observacoes}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-3">
                {produto.preco !== null && (
                  <p className="text-base font-bold text-emerald-700">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </p>
                )}
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center mt-1 ml-auto">
                  <Plus size={18} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </button>
        ))}
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Itens do Pedido</h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="space-y-2">
            {carrinho.map(item => (
              <div key={item.key} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{item.produto.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Qtd: {item.quantidade}</span>
                    {item.observacao && <span>· {item.observacao}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoverItem(item.key)}
                  className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center active:bg-red-100"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anotado por */}
      <div className="space-y-2">
        <label className="block text-base font-semibold text-slate-700">
          Anotado por
        </label>
        <input
          type="text"
          value={anotadoPor}
          onChange={e => setAnotadoPor(e.target.value)}
          placeholder="Nome do garçom..."
          className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSalvar}
        disabled={carrinho.length === 0}
        className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        <Save size={22} />
        Salvar Pedido ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
      </button>

      {/* Modal de produto selecionado */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Adicionar Item</h3>
              <button
                onClick={() => {
                  setProdutoSelecionado(null);
                  setQuantidade(1);
                  setObservacaoItem('');
                }}
                className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Produto info */}
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {produtoSelecionado.codigo}
                </span>
                <span className="text-xs text-slate-400">{produtoSelecionado.categoria}</span>
              </div>
              <p className="font-semibold text-slate-800 mt-1">{produtoSelecionado.nome}</p>
              {produtoSelecionado.preco !== null && (
                <p className="text-emerald-700 font-bold mt-1">
                  R$ {produtoSelecionado.preco.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Quantidade</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200"
                >
                  <Minus size={20} className="text-slate-700" />
                </button>
                <span className="text-3xl font-bold text-slate-800 w-16 text-center">{quantidade}</span>
                <button
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200"
                >
                  <Plus size={20} className="text-slate-700" />
                </button>
              </div>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Observação <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={observacaoItem}
                onChange={e => setObservacaoItem(e.target.value)}
                placeholder="Ex: sem gelo, bem passado..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Botão adicionar */}
            <button
              onClick={handleAdicionarAoCarrinho}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Plus size={22} />
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
