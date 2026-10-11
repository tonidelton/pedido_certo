import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Check } from 'lucide-react';
import { Mesa, corParaClasses, CORES_CONVIDADO } from '../types';
import { getMesa, abrirAtendimento } from '../services/mesasService';

export default function AbrirAtendimento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [numConvidados, setNumConvidados] = useState(2);
  const [apelidos, setApelidos] = useState<string[]>(['', '']);

  useEffect(() => {
    let mounted = true;
    
    const carregar = async () => {
      if (!id) return;
      const m = await getMesa(id);
      if (!mounted) return;
      
      if (!m) {
        navigate('/');
        return;
      }
      if (m.atendimentoAberto) {
        navigate(`/mesa/${id}`);
        return;
      }
      setMesa(m);
    };
    
    carregar();
    
    return () => { mounted = false; };
  }, [id, navigate]);

  if (!mesa) return null;

  const handleNumChange = (n: number) => {
    const novo = Math.max(1, Math.min(20, n));
    setNumConvidados(novo);
    // Ajusta array de apelidos
    const novosApelidos = [...apelidos];
    if (novo > novosApelidos.length) {
      while (novosApelidos.length < novo) novosApelidos.push('');
    } else {
      novosApelidos.length = novo;
    }
    setApelidos(novosApelidos);
  };

  const handleApelidoChange = (index: number, valor: string) => {
    const novos = [...apelidos];
    novos[index] = valor;
    setApelidos(novos);
  };

  const handleAbrir = async () => {
    if (!id) return;
    await abrirAtendimento(id, numConvidados, apelidos);
    navigate(`/mesa/${id}`);
  };

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
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Abrir Atendimento</h2>
          <p className="text-sm text-slate-500">Mesa {mesa.numero}</p>
        </div>
      </div>

      {/* Info da mesa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-green-700">{mesa.numero}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Mesa {mesa.numero}</p>
            {mesa.capacidade && (
              <p className="text-sm text-slate-500">Capacidade: {mesa.capacidade} lugares</p>
            )}
          </div>
        </div>
      </div>

      {/* Número de convidados */}
      <div className="space-y-3">
        <label className="block text-base font-semibold text-slate-700">
          Número de Convidados
        </label>
        <div className="flex items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl p-5">
          <button
            type="button"
            onClick={() => handleNumChange(numConvidados - 1)}
            disabled={numConvidados <= 1}
            className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-700 active:bg-slate-200 transition-colors disabled:opacity-40"
          >
            −
          </button>
          <div className="flex items-center gap-2">
            <Users size={24} className="text-emerald-600" />
            <span className="text-4xl font-bold text-slate-800 w-12 text-center">{numConvidados}</span>
          </div>
          <button
            type="button"
            onClick={() => handleNumChange(numConvidados + 1)}
            disabled={numConvidados >= 20 || (mesa.capacidade !== null && numConvidados >= mesa.capacidade)}
            className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-700 active:bg-slate-200 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>
        {mesa.capacidade && numConvidados >= mesa.capacidade && (
          <p className="text-xs text-amber-600 text-center">
            Atenção: número igual ou acima da capacidade ({mesa.capacidade})
          </p>
        )}
      </div>

      {/* Lista de lugares */}
      <div className="space-y-3">
        <label className="block text-base font-semibold text-slate-700">
          Lugares e Apelidos <span className="text-slate-400 font-normal text-sm">(opcional)</span>
        </label>
        <div className="space-y-2">
          {Array.from({ length: numConvidados }, (_, i) => {
            const cor = CORES_CONVIDADO[i % CORES_CONVIDADO.length];
            const classes = corParaClasses[cor];
            return (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${classes.bg} ${classes.text}`}>
                  {i + 1}
                </div>
                <div className={`w-3 h-3 rounded-full ${classes.dot}`}></div>
                <input
                  type="text"
                  value={apelidos[i] || ''}
                  onChange={e => handleApelidoChange(i, e.target.value)}
                  placeholder={`Lugar ${i + 1} — apelido opcional`}
                  className="flex-1 py-2 px-3 bg-slate-50 rounded-lg text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleAbrir}
        className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
      >
        <Check size={22} />
        Abrir Atendimento
      </button>
    </div>
  );
}
