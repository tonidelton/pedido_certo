import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Produto, Categoria, CATEGORIAS } from '../types';
import { getProdutos, addProduto, updateProduto, gerarCodigoSugerido, codigoExiste } from '../services/produtosService';

export default function ProdutoForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'novo';

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Entradas');
  const [preco, setPreco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [erro, setErro] = useState('');
  const [erroCodigo, setErroCodigo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      if (isEdit) {
        const produtos = await getProdutos();
        const produto = produtos.find(p => p.id === id);
        if (produto) {
          setNome(produto.nome);
          setCodigo(produto.codigo);
          setCategoria(produto.categoria);
          setPreco(produto.preco !== null ? produto.preco.toFixed(2) : '');
          setObservacoes(produto.observacoes);
          setAtivo(produto.ativo);
        } else {
          navigate('/cardapio');
        }
      } else {
        // Sugerir código automaticamente
        setCodigo(await gerarCodigoSugerido('Entradas'));
      }
    };
    carregar();
  }, [id, isEdit, navigate]);

  const handleCategoriaChange = async (novaCategoria: Categoria) => {
    setCategoria(novaCategoria);
    if (!isEdit) {
      setCodigo(await gerarCodigoSugerido(novaCategoria));
    }
  };

  const handleCodigoChange = (valor: string) => {
    setCodigo(valor.toUpperCase());
    setErroCodigo('');
  };

  const validar = async (): Promise<boolean> => {
    if (!nome.trim()) {
      setErro('Nome é obrigatório');
      return false;
    }
    if (!codigo.trim()) {
      setErro('Código é obrigatório');
      return false;
    }
    if (await codigoExiste(codigo.trim(), isEdit ? id : undefined)) {
      setErroCodigo('Este código já está em uso');
      setErro('');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setErroCodigo('');

    if (!(await validar())) return;

    setSalvando(true);

    const precoNum = preco.trim() ? parseFloat(preco.replace(',', '.')) : null;

    if (isEdit && id) {
      await updateProduto(id, {
        nome: nome.trim(),
        codigo: codigo.trim(),
        categoria,
        preco: precoNum,
        observacoes: observacoes.trim(),
        ativo,
      });
    } else {
      await addProduto({
        nome: nome.trim(),
        codigo: codigo.trim(),
        categoria,
        preco: precoNum,
        observacoes: observacoes.trim(),
        ativo,
      });
    }

    setTimeout(() => {
      navigate('/cardapio');
    }, 100);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cardapio')}
          className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h2>
      </div>

      {/* Error message */}
      {erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">{erro}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Filé Mignon ao Molho"
            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Código */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={codigo}
            onChange={e => handleCodigoChange(e.target.value)}
            placeholder="Ex: P001"
            className={`w-full px-4 py-4 bg-white border rounded-xl text-base font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              erroCodigo ? 'border-red-300' : 'border-slate-200'
            }`}
          />
          {erroCodigo && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {erroCodigo}
            </p>
          )}
          {!isEdit && (
            <p className="text-xs text-slate-400">Sugerido automaticamente pela categoria</p>
          )}
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Categoria <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoriaChange(cat)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all active:scale-[0.97] ${
                  categoria === cat
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Preço <span className="text-slate-400 font-normal text-sm">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={preco}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9.,]/g, '');
                setPreco(val);
              }}
              placeholder="0,00"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Observações <span className="text-slate-400 font-normal text-sm">(opcional)</span>
          </label>
          <textarea
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Descrição, ingredientes, observações..."
            rows={3}
            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Ativo */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">Status</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAtivo(true)}
              className={`flex-1 py-4 rounded-xl text-base font-medium border-2 transition-all active:scale-[0.97] ${
                ativo
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              ✅ Ativo
            </button>
            <button
              type="button"
              onClick={() => setAtivo(false)}
              className={`flex-1 py-4 rounded-xl text-base font-medium border-2 transition-all active:scale-[0.97] ${
                !ativo
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              ⏸️ Inativo
            </button>
          </div>
          {!ativo && (
            <p className="text-xs text-slate-500">
              Produto inativo não aparece no cardápio ativo, mas permanece no histórico.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={salvando}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Save size={22} />
          {isEdit ? 'Salvar Alterações' : 'Adicionar Produto'}
        </button>
      </form>
    </div>
  );
}
