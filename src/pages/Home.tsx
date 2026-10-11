import { useNavigate } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, PlusCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Bem-vindo!</h2>
        <p className="text-slate-500 mt-2 text-base">
          Gerencie o cardápio e registre pedidos com facilidade.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">Acesso rápido</h3>

        <button
          onClick={() => navigate('/cardapio')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList size={28} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-lg">Cardápio</p>
            <p className="text-sm text-slate-500">Ver e gerenciar produtos</p>
          </div>
        </button>

        <button
          disabled
          className="w-full bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm opacity-50"
        >
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <UtensilsCrossed size={28} className="text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-lg">Mesas</p>
            <p className="text-sm text-slate-500">Em breve</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/cardapio/produto/novo')}
          className="w-full bg-emerald-600 rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <PlusCircle size={28} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white text-lg">Novo Produto</p>
            <p className="text-sm text-emerald-100">Adicionar ao cardápio</p>
          </div>
        </button>
      </div>
    </div>
  );
}
