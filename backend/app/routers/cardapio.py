from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.cardapio import Categoria, Item
from app.schemas.cardapio import CategoriaSchema, ItemSchema
from datetime import datetime

router = APIRouter(prefix="/cardapio", tags=["cardápio"])

DIAS_SEMANA = {
    0: "seg", 1: "ter", 2: "qua", 3: "qui", 4: "sex", 5: "sab", 6: "dom"
}

@router.get("/", response_model=list[CategoriaSchema])
def listar_cardapio(db: Session = Depends(get_db)):
    hoje = DIAS_SEMANA[datetime.now().weekday()]

    categorias = db.query(Categoria).options(
        joinedload(Categoria.itens).joinedload(Item.variantes),
        joinedload(Categoria.itens).joinedload(Item.adicionais)
    ).filter(Categoria.ativo == True).all()

    resultado = []
    for categoria in categorias:
        itens_disponiveis = [
            item for item in categoria.itens
            if item.ativo and (
                item.disponivel_sempre or
                (item.dias_semana and hoje in item.dias_semana)
            )
        ]
        categoria.itens = itens_disponiveis
        resultado.append(categoria)

    return resultado