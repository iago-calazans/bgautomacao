from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cardapio import Item, Reserva
from app.models.pedido import Pedido, PedidoItem
from app.schemas.pedido import PedidoInput, PedidoOutput
from datetime import datetime

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@router.post("/", response_model=PedidoOutput)
def criar_pedido(dados: PedidoInput, db: Session = Depends(get_db)):
    # Valida o token de reserva
    reserva = db.query(Reserva).filter(
        Reserva.token == dados.token,
        Reserva.ativa == True
    ).first()

    if not reserva:
        raise HTTPException(status_code=400, detail="Reserva inválida ou expirada.")

    if reserva.expira_em < datetime.now():
        raise HTTPException(status_code=400, detail="Reserva expirada. Inicie um novo pedido.")

    # Valida tipo e endereço
    if dados.tipo == "delivery" and not dados.endereco:
        raise HTTPException(status_code=400, detail="Endereço obrigatório para delivery.")

    # Cria o pedido
    pedido = Pedido(
        nome_cliente=dados.nome_cliente,
        telefone=dados.telefone,
        tipo=dados.tipo,
        endereco=dados.endereco,
        forma_pagamento=dados.forma_pagamento,
        observacao_geral=dados.observacao_geral,
        total=dados.total,
    )
    db.add(pedido)
    db.flush()  # gera o id do pedido sem commitar ainda

    # Adiciona os itens
    for item_input in dados.itens:
        item = db.query(Item).filter(Item.id == item_input.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item {item_input.item_id} não encontrado.")

        # Subtrai estoque dos itens que controlam (exceto galeto que já foi subtraído na reserva)
        if item.controla_estoque and not item.reserva_ativa:
            if item.estoque_atual < item_input.quantidade:
                raise HTTPException(status_code=400, detail=f"{item.nome} sem estoque suficiente.")
            item.estoque_atual -= item_input.quantidade

        pedido_item = PedidoItem(
            pedido_id=pedido.id,
            item_id=item_input.item_id,
            variante_id=item_input.variante_id,
            quantidade=item_input.quantidade,
            preco_unitario=item_input.preco_unitario,
            observacao=item_input.observacao,
            adicionais=item_input.adicionais,
        )
        db.add(pedido_item)

    # Invalida a reserva
    reserva.ativa = False
    db.commit()
    db.refresh(pedido)

    return pedido


@router.get("/", response_model=list[PedidoOutput])
def listar_pedidos(db: Session = Depends(get_db)):
    return db.query(Pedido).order_by(Pedido.criado_em.desc()).all()


@router.patch("/{pedido_id}/status")
def atualizar_status(pedido_id: int, status: str, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    status_validos = ["pendente", "em_preparo", "enviado", "concluido", "cancelado"]
    if status not in status_validos:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {status_validos}")

    pedido.status = status
    db.commit()

    return {"mensagem": f"Pedido {pedido_id} atualizado para {status}."}