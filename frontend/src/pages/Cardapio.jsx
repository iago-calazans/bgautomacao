import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCarrinho } from '../context/CarrinhoContext'

function Cardapio() {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [painelAberto, setPainelAberto] = useState(null)
    const [quantidadeTemp, setQuantidadeTemp] = useState(1)
    const [adicionaisTemp, setAdicionaisTemp] = useState({})

    const { carrinho, adicionarItem, total } = useCarrinho()
    const navigate = useNavigate()

    const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0)

    useEffect(() => {
        api.get('/cardapio/')
            .then(res => { setCategorias(res.data); setLoading(false) })
            .catch(() => { setErro('Erro ao carregar o cardápio.'); setLoading(false) })
    }, [])

    function abrirPainel(item) {
        if (painelAberto === item.id) {
            setPainelAberto(null)
            return
        }
        setPainelAberto(item.id)
        setQuantidadeTemp(1)
        const iniciais = {}
        item.adicionais.forEach(a => { iniciais[a.nome] = 0 })
        setAdicionaisTemp(iniciais)
    }

    function alterarAdicional(nome, delta, max) {
        setAdicionaisTemp(prev => ({
            ...prev,
            [nome]: Math.min(max, Math.max(0, (prev[nome] || 0) + delta))
        }))
    }

    function confirmarAdicao(item, variante = null) {
        const adicionaisFormatados = Object.entries(adicionaisTemp)
            .filter(([, qtd]) => qtd > 0)
            .map(([nome, qtd]) => `${nome} x${qtd}`)

        adicionarItem(item, variante, quantidadeTemp, '', adicionaisFormatados)
        setPainelAberto(null)
    }

    const btnAdicional = (ativo) => ({
        background: 'none',
        border: `1.5px solid ${ativo ? 'var(--color-brand)' : 'var(--color-border)'}`,
        borderRadius: 6, width: 28, height: 28,
        cursor: 'pointer', fontSize: 16,
        color: ativo ? 'var(--color-brand)' : 'var(--color-text)',
    })

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>Carregando cardápio...</p>
        </div>
    )

    if (erro) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p style={{ color: 'var(--color-brand)' }}>{erro}</p>
        </div>
    )

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: totalItens > 0 ? 100 : 24 }}>

            <div style={{ background: 'var(--color-brand)', padding: '32px 20px 24px', marginBottom: 8 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 32, lineHeight: 1.1 }}>
                    Brasa & Galeto
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>Monte seu pedido</p>
            </div>

            {categorias.map(categoria => (
                categoria.itens.length > 0 && (
                    <div key={categoria.id} style={{ padding: '8px 0' }}>
                        <h2 style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: 'var(--color-brand)',
                            padding: '12px 20px 8px',
                        }}>{categoria.nome}</h2>

                        {categoria.itens.map(item => (
                            <div key={item.id} style={{
                                background: 'var(--color-card)',
                                margin: '0 12px 8px', borderRadius: 12,
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                            }}>
                                {/* Linha principal do item */}
                                <div style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ fontWeight: 500, fontSize: 15 }}>{item.nome}</span>
                                        {item.variantes.length === 0 && (
                                            <span style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: 15 }}>
                                                R$ {item.preco_base.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {item.variantes.length > 0 ? (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                            {item.variantes.map(variante => (
                                                <button key={variante.id}
                                                    onClick={() => adicionarItem(item, variante)}
                                                    style={{
                                                        background: 'var(--color-bg)', border: '1.5px solid var(--color-brand)',
                                                        borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500,
                                                        color: 'var(--color-brand)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                                                    }}>
                                                    {variante.nome} · R$ {variante.preco.toFixed(2)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => item.adicionais.length > 0 ? abrirPainel(item) : adicionarItem(item)}
                                            style={{
                                                marginTop: 10,
                                                background: painelAberto === item.id ? 'var(--color-bg)' : 'var(--color-brand)',
                                                color: painelAberto === item.id ? 'var(--color-brand)' : '#fff',
                                                border: `1.5px solid var(--color-brand)`,
                                                borderRadius: 8, padding: '8px 16px',
                                                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                                            }}>
                                            {painelAberto === item.id ? '✕ Cancelar' : '+ Adicionar'}
                                        </button>
                                    )}
                                </div>

                                {/* Painel de adicionais */}
                                {painelAberto === item.id && (
                                    <div style={{
                                        borderTop: '1px solid var(--color-border)',
                                        background: 'var(--color-bg)',
                                        padding: '14px 16px',
                                    }}>

                                        {/* Quantidade */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>Quantidade</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <button onClick={() => setQuantidadeTemp(q => Math.max(1, q - 1))}
                                                    style={btnAdicional(false)}>−</button>
                                                <span style={{ fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: 'center' }}>
                                                    {quantidadeTemp}
                                                </span>
                                                <button onClick={() => setQuantidadeTemp(q => q + 1)}
                                                    style={btnAdicional(false)}>+</button>
                                            </div>
                                        </div>

                                        {/* Adicionais */}
                                        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
                                            Adicionais (máx. {quantidadeTemp} de cada)
                                        </p>

                                        {item.adicionais.map(adicional => (
                                            <div key={adicional.id} style={{
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', marginBottom: 10,
                                            }}>
                                                <span style={{ fontSize: 14 }}>{adicional.nome}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <button
                                                        onClick={() => alterarAdicional(adicional.nome, -1, quantidadeTemp)}
                                                        style={btnAdicional(adicionaisTemp[adicional.nome] > 0)}>−</button>
                                                    <span style={{ fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                                                        {adicionaisTemp[adicional.nome] || 0}
                                                    </span>
                                                    <button
                                                        onClick={() => alterarAdicional(adicional.nome, 1, quantidadeTemp)}
                                                        style={btnAdicional(adicionaisTemp[adicional.nome] < quantidadeTemp)}>+</button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => confirmarAdicao(item)}
                                            style={{
                                                marginTop: 8, width: '100%',
                                                background: 'var(--color-brand)', color: '#fff',
                                                border: 'none', borderRadius: 10, padding: '12px',
                                                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                                fontFamily: 'var(--font-body)',
                                            }}>
                                            Adicionar ao carrinho · R$ {(item.preco_base * quantidadeTemp).toFixed(2)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            ))}

            {totalItens > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    padding: '12px 16px', background: 'transparent',
                    display: 'flex', justifyContent: 'center',
                }}>
                    <button
                        onClick={() => navigate('/carrinho')}
                        style={{
                            width: '100%', maxWidth: 480,
                            background: 'var(--color-brand)', color: '#fff',
                            border: 'none', borderRadius: 14, padding: '16px 20px',
                            fontSize: 16, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontFamily: 'var(--font-body)',
                            boxShadow: '0 4px 20px rgba(192,57,43,0.35)',
                        }}>
                        <span style={{
                            background: 'rgba(255,255,255,0.2)', borderRadius: 8,
                            padding: '2px 10px', fontSize: 14,
                        }}>{totalItens}</span>
                        <span>Ver carrinho</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Cardapio