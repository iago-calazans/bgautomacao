import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Cardapio from './pages/Cardapio'
import Carrinho from './pages/Carrinho'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cardapio />} />
        <Route path="/carrinho" element={<Carrinho />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App