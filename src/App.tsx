import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Mesas from './pages/Mesas';
import Cardapio from './pages/Cardapio';
import ProdutoForm from './pages/ProdutoForm';
import NovaMesa from './pages/NovaMesa';
import AbrirAtendimento from './pages/AbrirAtendimento';
import Atendimento from './pages/Atendimento';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Mesas />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/cardapio/produto/:id" element={<ProdutoForm />} />
          <Route path="/mesa/nova" element={<NovaMesa />} />
          <Route path="/mesa/:id/abrir" element={<AbrirAtendimento />} />
          <Route path="/mesa/:id" element={<Atendimento />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
