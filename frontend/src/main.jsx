import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CarrinhoProvider } from './context/CarrinhoContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  </StrictMode>,
)