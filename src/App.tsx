import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Mesas from './pages/Mesas';
import Cardapio from './pages/Cardapio';
import ProdutoForm from './pages/ProdutoForm';
import NovaMesa from './pages/NovaMesa';
import AbrirAtendimento from './pages/AbrirAtendimento';
import Atendimento from './pages/Atendimento';
import NovoPedido from './pages/NovoPedido';
import DetalhePedido from './pages/DetalhePedido';
import ConfigFirebase from './pages/ConfigFirebase';
import MigrarDados from './pages/MigrarDados';
import Diagnostic from './pages/Diagnostic';
import Historico from './pages/Historico';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Mesas />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/cardapio/produto/:id" element={<ProdutoForm />} />
          <Route path="/mesa/nova" element={<NovaMesa />} />
          <Route path="/mesa/:id/abrir" element={<AbrirAtendimento />} />
          <Route path="/mesa/:id" element={<Atendimento />} />
          <Route path="/mesa/:id/pedido/novo" element={<NovoPedido />} />
          <Route path="/pedido/:id" element={<DetalhePedido />} />
          <Route path="/config/firebase" element={<ConfigFirebase />} />
          <Route path="/migrar" element={<MigrarDados />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/historico" element={<Historico />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
