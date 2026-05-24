import { createContext, useContext, useState } from 'react'

const CarrinhoContext = createContext()

export function CarrinhoProvider({ children }) {
    const [carrinho, setCarrinho] = useState([])
    const [token, setToken] = useState(null)
    const [expiraEm, setExpiraEm] = useState(null)

    function adicionarItem(item, variante = null, quantidade = 1, observacao = '', adicionais = []) {
        const id_unico = variante ? `${item.id}-${variante.id}` : `${item.id}`

        setCarrinho(prev => {
            const existente = prev.find(i => i.id_unico === id_unico)
            if (existente) {
                return prev.map(i =>
                    i.id_unico === id_unico
                        ? { ...i, quantidade: i.quantidade + quantidade }
                        : i
                )
            }
            return [...prev, {
                id_unico,
                item_id: item.id,
                nome: variante ? `${item.nome} (${variante.nome})` : item.nome,
                preco: variante ? variante.preco : item.preco_base,
                variante_id: variante ? variante.id : null,
                quantidade,
                observacao,
                adicionais,
            }]
        })
    }

    function removerItem(id_unico) {
        setCarrinho(prev => prev.filter(i => i.id_unico !== id_unico))
    }

    function limparCarrinho() {
        setCarrinho([])
        setToken(null)
        setExpiraEm(null)
    }

    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0)

    return (
        <CarrinhoContext.Provider value={{
            carrinho, token, setToken, expiraEm, setExpiraEm,
            adicionarItem, removerItem, limparCarrinho, total
        }}>
            {children}
        </CarrinhoContext.Provider>
    )
}

export function useCarrinho() {
    return useContext(CarrinhoContext)
}