from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cardapio import Item, Reserva
from datetime import datetime, timedelta
import uuid
import asyncio





router = APIRouter(prefix="/reserva", tags=["reserva"])

MINUTOS_RESERVA = 15

@router.post("/iniciar")
def iniciar_reserva(db: Session = Depends(get_db)):
    # Busca itens com reserva ativa
    itens_reservaveis = db.query(Item).filter(
        Item.reserva_ativa == True,
        Item.controla_estoque == True
    ).all()

    # Verifica se tem estoque disponível
    for item in itens_reservaveis:
        if item.estoque_atual < 1:
            raise HTTPException(
                status_code=400,
                detail=f"{item.nome} está esgotado no momento."
            )

    # Subtrai 1 do estoque de cada item reservável
    for item in itens_reservaveis:
        item.estoque_atual -= 1

    # Cria a reserva com token único e tempo de expiração
    token = str(uuid.uuid4())
    expira_em = datetime.now() + timedelta(minutes=MINUTOS_RESERVA)

    reserva = Reserva(token=token, expira_em=expira_em)
    db.add(reserva)
    db.commit()

    return {
        "token": token,
        "expira_em": expira_em,
        "mensagem": f"Você tem {MINUTOS_RESERVA} minutos para finalizar seu pedido."
    }


@router.delete("/cancelar/{token}")
def cancelar_reserva(token: str, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).filter(
        Reserva.token == token,
        Reserva.ativa == True
    ).first()

    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    # Devolve o estoque
    itens_reservaveis = db.query(Item).filter(
        Item.reserva_ativa == True,
        Item.controla_estoque == True
    ).all()

    for item in itens_reservaveis:
        item.estoque_atual += 1

    reserva.ativa = False
    db.commit()

    return {"mensagem": "Reserva cancelada e estoque devolvido."}

async def limpar_reservas_expiradas(db_factory):
    while True:
        await asyncio.sleep(60)  # roda a cada 60 segundos
        db = db_factory()
        try:
            agora = datetime.now()
            reservas_expiradas = db.query(Reserva).filter(
                Reserva.ativa == True,
                Reserva.expira_em < agora
            ).all()

            if reservas_expiradas:
                itens_reservaveis = db.query(Item).filter(
                    Item.reserva_ativa == True,
                    Item.controla_estoque == True
                ).all()

                for reserva in reservas_expiradas:
                    for item in itens_reservaveis:
                        item.estoque_atual += 1
                    reserva.ativa = False

                db.commit()
                print(f"{len(reservas_expiradas)} reserva(s) expirada(s) liberada(s).")
        finally:
            db.close()