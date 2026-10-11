import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, Home } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  // Esconde a bottom nav em formulários e telas de atendimento
  const hideNav =
    location.pathname.includes('/produto') ||
    location.pathname.includes('/mesa/nova') ||
    location.pathname.includes('/abrir') ||
    location.pathname.includes('/pedido') ||
    /^\/mesa\/[^/]+$/.test(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Pedido Certo</h1>
            <p className="text-xs text-slate-300">Gestão de pedidos</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
          <div className="max-w-lg mx-auto flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`
              }
            >
              <Home size={24} />
              <span className="text-xs font-medium">Mesas</span>
            </NavLink>
            <NavLink
              to="/cardapio"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`
              }
            >
              <ClipboardList size={24} />
              <span className="text-xs font-medium">Cardápio</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
}
