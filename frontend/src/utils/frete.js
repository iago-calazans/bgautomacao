import bairros from './bairros.json'

export function calcularFrete(distanciaKm) {
    if (distanciaKm <= 1.9) return 7
    if (distanciaKm <= 3.9) return 9
    if (distanciaKm <= 5.8) return 13
    if (distanciaKm <= 7.8) return 15
    if (distanciaKm <= 9.9) return 17
    return Math.ceil(distanciaKm) * 2
}

export function calcularAdicionalCartao(distanciaKm) {
    if (distanciaKm <= 5.8) return 2
    return 4
}

export function buscarBairro(nome) {
    return bairros.find(b =>
        b.bairro.toLowerCase() === nome.toLowerCase()
    )
}

export function listarBairros() {
    return bairros.map(b => b.bairro).sort()
}