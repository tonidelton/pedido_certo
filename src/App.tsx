import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cardapio from './pages/Cardapio';
import ProdutoForm from './pages/ProdutoForm';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/cardapio/produto/:id" element={<ProdutoForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
