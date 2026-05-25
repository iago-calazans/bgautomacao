import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrinho } from '../context/CarrinhoContext'
import { buscarBairro, calcularAdicionalCartao, calcularFrete, listarBairros } from '../utils/frete'
import api from '../services/api'

const btnPrimario = {
    width: '100%',
    background: 'var(--color-brand)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '16px 20px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 20px rgba(192,57,43,0.35)',
}

const input = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--color-border)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    background: 'var(--color-card)',
    color: 'var(--color-text)',
    outline: 'none',
}

function Carrinho() {
    const { carrinho, removerItem, total, alterarQuantidade, limparCarrinho, token, setToken, setExpiraEm } = useCarrinho()
    const navigate = useNavigate()

    const [nome, setNome] = useState('')
    const [telefone, setTelefone] = useState('')
    const [tipo, setTipo] = useState('retirada')
    const [endereco, setEndereco] = useState('')
    const [linkMaps, setLinkMaps] = useState('')
    const [pagamento, setPagamento] = useState('pix')
    const [observacao, setObservacao] = useState('')
    const [mensagem, setMensagem] = useState(null)
    const [loading, setLoading] = useState(false)
    const [bairro, setBairro] = useState('')
    const [bairroInfo, setBairroInfo] = useState(null)
    const [frete, setFrete] = useState(0)
    const [adicionalCartao, setAdicionalCartao] = useState(0)

    const totalComFrete = tipo === 'delivery' ? total + frete + adicionalCartao : total

    function handleBairro(nomeBairro) {
        setBairro(nomeBairro)
        const info = buscarBairro(nomeBairro)
        if (info) {
            setBairroInfo(info)
            const f = calcularFrete(info.distanciaKmEstimada)
            setFrete(f)
            setAdicionalCartao(
                ['debito', 'credito'].includes(pagamento)
                    ? calcularAdicionalCartao(info.distanciaKmEstimada)
                    : 0
            )
        } else {
            setBairroInfo(null)
            setFrete(0)
            setAdicionalCartao(0)
        }
    }

    function handlePagamento(p) {
        setPagamento(p)
        if (bairroInfo && tipo === 'delivery') {
            setAdicionalCartao(
                ['debito', 'credito'].includes(p)
                    ? calcularAdicionalCartao(bairroInfo.distanciaKmEstimada)
                    : 0
            )
        } else {
            setAdicionalCartao(0)
        }
    }

    function handleTipo(t) {
        setTipo(t)
        if (t === 'retirada') {
            setFrete(0)
            setAdicionalCartao(0)
        } else if (bairroInfo) {
            const f = calcularFrete(bairroInfo.distanciaKmEstimada)
            setFrete(f)
            setAdicionalCartao(
                ['debito', 'credito'].includes(pagamento)
                    ? calcularAdicionalCartao(bairroInfo.distanciaKmEstimada)
                    : 0
            )
        }
    }

    async function iniciarReservaSeNecessario() {
        if (token) return token
        const res = await api.post('/reserva/iniciar')
        setToken(res.data.token)
        setExpiraEm(res.data.expira_em)
        return res.data.token
    }

    async function handleFinalizar() {
        if (!nome || !telefone) return alert('Preencha nome e telefone.')
        if (tipo === 'delivery' && !endereco) return alert('Preencha o endereço.')
        if (tipo === 'delivery' && !bairro) return alert('Selecione seu bairro.')
        if (carrinho.length === 0) return alert('Seu carrinho está vazio.')

        setLoading(true)
        try {
            const tokenAtivo = await iniciarReservaSeNecessario()

            const enderecoCompleto = tipo === 'delivery'
                ? `${endereco}, ${bairro}${linkMaps ? ` | Maps: ${linkMaps}` : ''}`
                : null

            await api.post('/pedidos/', {
                token: tokenAtivo,
                nome_cliente: nome,
                telefone,
                tipo,
                endereco: enderecoCompleto,
                forma_pagamento: pagamento,
                observacao_geral: observacao || null,
                total: totalComFrete,
                itens: carrinho.map(i => ({
                    item_id: i.item_id,
                    variante_id: i.variante_id,
                    quantidade: i.quantidade,
                    preco_unitario: i.preco,
                    observacao: i.observacao || null,
                    adicionais: i.adicionais.length > 0 ? i.adicionais.join(', ') : null,
                }))
            })

            const linhaItens = carrinho.map(i => {
                const adicionaisStr = i.adicionais && i.adicionais.length > 0 ? ` [+ ${i.adicionais.join(', ')}]` : ''
                return `• ${i.nome} x${i.quantidade}${adicionaisStr}${i.observacao ? ` (${i.observacao})` : ''} — R$ ${(i.preco * i.quantidade).toFixed(2)}`
            }).join('\n')

            const msg =
                `*Pedido Brasa & Galeto*\n\n` +
                `*Nome:* ${nome}\n` +
                `*Telefone:* ${telefone}\n` +
                `*Tipo:* ${tipo === 'delivery' ? 'Delivery' : 'Retirada'}\n` +
                (tipo === 'delivery' ? `*Endereço:* ${endereco}, ${bairro}\n` : '') +
                (tipo === 'delivery' && linkMaps ? `*Maps:* ${linkMaps}\n` : '') +
                `*Pagamento:* ${pagamento.toUpperCase()}\n\n` +
                `*Itens:*\n${linhaItens}\n\n` +
                (tipo === 'delivery' ? `*Frete:* R$ ${frete.toFixed(2)}\n` : '') +
                (adicionalCartao > 0 ? `*Acréscimo cartão:* R$ ${adicionalCartao.toFixed(2)}\n` : '') +
                `*Total: R$ ${totalComFrete.toFixed(2)}*` +
                (observacao ? `\n\n*Observações:* ${observacao}` : '')

            setMensagem(msg)
            limparCarrinho()
        } catch (err) {
            alert('Erro ao registrar pedido. Tente novamente.')
        }
        setLoading(false)
    }

    if (mensagem) return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>
                Pedido pronto!
            </h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 20, fontSize: 14 }}>
                Copie a mensagem abaixo e envie para o nosso WhatsApp.
            </p>
            <pre style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.7,
                marginBottom: 16,
            }}>{mensagem}</pre>
            <button
                onClick={() => navigator.clipboard.writeText(mensagem)}
                style={{ ...btnPrimario, marginBottom: 12 }}>
                Copiar mensagem
            </button>
            <a
                href={`https://wa.me/559889216575?text=${encodeURIComponent(mensagem)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#25d366',
                    color: '#fff',
                    borderRadius: 14,
                    padding: '16px 20px',
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: 'none',
                }}>
                Abrir WhatsApp
            </a>
        </div>
    )

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>

            {/* Header */}
            <div style={{ background: 'var(--color-brand)', padding: '20px 20px 16px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', padding: 0, marginBottom: 8 }}>
                    ← Voltar ao cardápio
                </button>
                <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 26 }}>
                    Seu pedido
                </h1>
            </div>

            <div style={{ padding: '16px 16px 0' }}>

                {/* Lista de itens */}
                {carrinho.length === 0 ? (
                    <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 40 }}>
                        Seu carrinho está vazio.
                    </p>
                ) : (
                    <div style={{ marginBottom: 20 }}>
                        {carrinho.map(item => (
                            <div key={item.id_unico} style={{
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                marginBottom: 8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: 14 }}>{item.nome}</p>
                                    {item.adicionais && item.adicionais.length > 0 && (
                                        <p style={{ color: 'var(--color-brand)', fontSize: 12, marginTop: 2 }}>
                                            + {item.adicionais.join(', ')}
                                        </p>
                                    )}
                                    <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 2 }}>
                                        R$ {(item.preco * item.quantidade).toFixed(2)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => alterarQuantidade(item.id_unico, -1)}
                                        style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: 'var(--color-text)' }}>
                                        −
                                    </button>
                                    <span style={{ fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{item.quantidade}</span>
                                    <button onClick={() => alterarQuantidade(item.id_unico, 1)}
                                        style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: 'var(--color-text)' }}>
                                        +
                                    </button>
                                    <button onClick={() => removerItem(item.id_unico)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontSize: 20, marginLeft: 4 }}>
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Resumo de valores */}
                        <div style={{
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 12,
                            padding: '12px 14px',
                            marginTop: 4,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-muted)', marginBottom: 4 }}>
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            {tipo === 'delivery' && frete > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-muted)', marginBottom: 4 }}>
                                    <span>Frete</span>
                                    <span>R$ {frete.toFixed(2)}</span>
                                </div>
                            )}
                            {adicionalCartao > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-muted)', marginBottom: 4 }}>
                                    <span>Acréscimo cartão</span>
                                    <span>R$ {adicionalCartao.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                                <span>Total</span>
                                <span>R$ {totalComFrete.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulário */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input style={input} placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
                    <input
                        style={input}
                        placeholder="Seu número de telefone (ex: +55 98 987654321)"
                        value={telefone}
                        onChange={e => {
                            let v = e.target.value.replace(/\D/g, '')
                            if (v.length > 13) v = v.slice(0, 13)
                            if (v.length >= 4) v = `+${v.slice(0, 2)} ${v.slice(2, 4)} ${v.slice(4)}`
                            else if (v.length >= 2) v = `+${v.slice(0, 2)} ${v.slice(2)}`
                            else if (v.length > 0) v = `+${v}`
                            setTelefone(v)
                        }}
                        inputMode="numeric"
                    />

                    {/* Tipo */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['retirada', 'delivery'].map(t => (
                            <button key={t} onClick={() => handleTipo(t)} style={{
                                flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                                border: '1.5px solid',
                                borderColor: tipo === t ? 'var(--color-brand)' : 'var(--color-border)',
                                background: tipo === t ? 'var(--color-brand)' : 'var(--color-card)',
                                color: tipo === t ? '#fff' : 'var(--color-text)',
                            }}>
                                {t === 'retirada' ? 'Retirada' : 'Delivery'}
                            </button>
                        ))}
                    </div>

                    {/* Campos de delivery */}
                    {tipo === 'delivery' && (
                        <>
                            <input
                                style={input}
                                placeholder="Endereço completo (rua, número)"
                                value={endereco}
                                onChange={e => setEndereco(e.target.value)}
                            />

                            <select
                                style={{ ...input, cursor: 'pointer' }}
                                value={bairro}
                                onChange={e => handleBairro(e.target.value)}>
                                <option value="">Selecione seu bairro</option>
                                {listarBairros().map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>

                            {bairroInfo && (
                                <div style={{
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    fontSize: 13,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Distância estimada</span>
                                        <span style={{ fontWeight: 600 }}>{bairroInfo.distanciaKmEstimada} km</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Frete</span>
                                        <span style={{ fontWeight: 600, color: 'var(--color-brand)' }}>R$ {frete.toFixed(2)}</span>
                                    </div>
                                    {bairroInfo.confianca === 'baixa' && (
                                        <p style={{ color: '#b7791f', fontSize: 12, marginTop: 8 }}>
                                            ⚠️ Distância estimada — o frete pode ser ajustado pelo atendente.
                                        </p>
                                    )}
                                </div>
                            )}

                            <input
                                style={input}
                                placeholder="Link do Google Maps (opcional)"
                                value={linkMaps}
                                onChange={e => setLinkMaps(e.target.value)}
                            />
                        </>
                    )}

                    {/* Pagamento */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['pix', 'debito', 'credito', 'dinheiro'].map(p => (
                            <button key={p} onClick={() => handlePagamento(p)} style={{
                                flex: 1, minWidth: 80, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                                border: '1.5px solid',
                                borderColor: pagamento === p ? 'var(--color-brand)' : 'var(--color-border)',
                                background: pagamento === p ? 'var(--color-brand)' : 'var(--color-card)',
                                color: pagamento === p ? '#fff' : 'var(--color-text)',
                            }}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    {['debito', 'credito'].includes(pagamento) && tipo === 'delivery' && bairroInfo && (
                        <p style={{ fontSize: 12, color: '#b7791f' }}>
                            ⚠️ Pagamento em {pagamento} tem acréscimo de R$ {adicionalCartao.toFixed(2)} para delivery.
                        </p>
                    )}

                    <textarea
                        style={{ ...input, resize: 'none', minHeight: 80 }}
                        placeholder="Observações gerais (opcional)"
                        value={observacao}
                        onChange={e => setObservacao(e.target.value)}
                    />

                    <button onClick={handleFinalizar} disabled={loading} style={btnPrimario}>
                        {loading ? 'Registrando...' : `Finalizar pedido · R$ ${totalComFrete.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Carrinho
