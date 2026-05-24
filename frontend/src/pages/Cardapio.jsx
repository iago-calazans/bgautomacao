import { useEffect, useState } from 'react'
import api from '../services/api'

function Cardapio() {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

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

    if (loading) return <p>Carregando cardápio...</p>
    if (erro) return <p>{erro}</p>

    return (
        <div>
            <h1>Cardápio</h1>
            {categorias.map(categoria => (
                <div key={categoria.id}>
                    <h2>{categoria.nome}</h2>
                    {categoria.itens.map(item => (
                        <div key={item.id}>
                            <span>{item.nome}</span>
                            <span>R$ {item.preco_base.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Cardapio