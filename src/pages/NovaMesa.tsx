import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { criarMesa, numeroMesaExiste } from '../services/mesasService';

export default function NovaMesa() {
  const navigate = useNavigate();
  const [numero, setNumero] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [erro, setErro] = useState('');
  const [erroNumero, setErroNumero] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setErroNumero('');

    if (!numero.trim()) {
      setErro('Número/nome da mesa é obrigatório');
      return;
    }

    // Verificar se já existe no Firebase
    const existe = await numeroMesaExiste(numero.trim());
    if (existe) {
      setErroNumero('Já existe uma mesa com este número');
      return;
    }

    const cap = capacidade.trim() ? parseInt(capacidade) : null;
    if (capacidade.trim() && (isNaN(cap!) || cap! < 1)) {
      setErro('Capacidade deve ser um número maior que zero');
      return;
    }

    try {
      await criarMesa(numero.trim(), cap);
      navigate('/');
    } catch (error) {
      setErro('Erro ao criar mesa. Tente novamente.');
      console.error('Erro ao criar mesa:', error);
    }
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
        <h2 className="text-2xl font-bold text-slate-800">Nova Mesa</h2>
      </div>

      {/* Error */}
      {erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">{erro}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Número */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Número ou Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={numero}
            onChange={e => {
              setNumero(e.target.value);
              setErroNumero('');
            }}
            placeholder="Ex: 1, VIP, Terraço..."
            className={`w-full px-4 py-4 bg-white border rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              erroNumero ? 'border-red-300' : 'border-slate-200'
            }`}
            autoFocus
          />
          {erroNumero && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {erroNumero}
            </p>
          )}
          <p className="text-xs text-slate-400">Pode ser um número, nome ou identificador único</p>
        </div>

        {/* Capacidade */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-slate-700">
            Capacidade <span className="text-slate-400 font-normal text-sm">(opcional)</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={capacidade}
            onChange={e => setCapacidade(e.target.value)}
            placeholder="Ex: 4"
            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-400">Quantidade máxima de lugares na mesa</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          <Save size={22} />
          Criar Mesa
        </button>
      </form>
    </div>
  );
}
