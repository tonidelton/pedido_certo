import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, History, LogOut } from 'lucide-react';
import { AtendimentoFechado } from '../types';
import { getAtendimentosFechados } from '../services/mesasService';

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

function formatarDuracao(abertoEm: string, fechadoEm: string | null): string {
  if (!fechadoEm) return '';
  const diff = Math.floor((new Date(fechadoEm).getTime() - new Date(abertoEm).getTime()) / 1000);
  const horas = Math.floor(diff / 3600);
  const minutos = Math.floor((diff % 3600) / 60);
  if (horas > 0) return `${horas}h ${minutos}min`;
  return `${minutos}min`;
}

export default function Historico() {
  const navigate = useNavigate();
  const [atendimentos, setAtendimentos] = useState<AtendimentoFechado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const dados = await getAtendimentosFechados();
      setAtendimentos(dados);
      setCarregando(false);
    };
    carregar();
  }, []);

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
          <h2 className="text-2xl font-bold text-slate-800">Histórico</h2>
          <p className="text-sm text-slate-500">Atendimentos encerrados</p>
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Carregando histórico...</p>
        </div>
      ) : atendimentos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 text-lg">Nenhum atendimento encerrado</p>
          <p className="text-slate-400 text-sm mt-1">
            Quando uma mesa for fechada, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {atendimentos.map(atendimento => (
            <div
              key={atendimento.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <History size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Mesa {atendimento.mesaNumero}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={12} />
                      {atendimento.convidados.length} convidado{atendimento.convidados.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                  <LogOut size={12} />
                  Encerrado
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  <span>Aberto: {formatarDataHora(atendimento.abertoEm)}</span>
                </div>
                {atendimento.fechadoEm && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>Fechado: {formatarDataHora(atendimento.fechadoEm)}</span>
                  </div>
                )}
              </div>

              {formatarDuracao(atendimento.abertoEm, atendimento.fechadoEm) && (
                <p className="text-xs text-slate-400 mt-1">
                  Duração: {formatarDuracao(atendimento.abertoEm, atendimento.fechadoEm)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
