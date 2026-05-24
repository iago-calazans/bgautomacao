import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCarrinho } from '../context/CarrinhoContext'

function Cardapio() {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const { carrinho, adicionarItem, removerItem, total } = useCarrinho()

    useEffect(() => {
        api.get('/cardapio/')
            .then(res => {
                setCategorias(res.data)
                setLoading(false)
            })
            .catch(() => {
                setErro('Erro ao carregar o cardápio.')
                setLoading(false)
            })
    }, [])

    function handleAdicionar(item, variante = null) {
        adicionarItem(item, variante)
    }

    if (loading) return <p>Carregando cardápio...</p>
    if (erro) return <p>{erro}</p>

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
            <h1>Cardápio</h1>

            {categorias.map(categoria => (
                <div key={categoria.id} style={{ marginBottom: 24 }}>
                    <h2>{categoria.nome}</h2>

                    {categoria.itens.map(item => (
                        <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.nome}</span>
                                {item.variantes.length === 0 && (
                                    <span>R$ {item.preco_base.toFixed(2)}</span>
                                )}
                            </div>

                            {item.variantes.length > 0 ? (
                                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                    {item.variantes.map(variante => (
                                        <button key={variante.id} onClick={() => handleAdicionar(item, variante)}>
                                            + {variante.nome} R$ {variante.preco.toFixed(2)}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <button style={{ marginTop: 8 }} onClick={() => handleAdicionar(item)}>
                                    + Adicionar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}

            {carrinho.length > 0 && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #ddd', padding: 16 }}>
                    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{carrinho.reduce((acc, i) => acc + i.quantidade, 0)} item(s) no carrinho</span>
                        <span>Total: R$ {total.toFixed(2)}</span>
                        <button>Ver carrinho</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cardapio