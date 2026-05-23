from pydantic import BaseModel
from typing import Optional, List

class AdicionalSchema(BaseModel):
    id: int
    nome: str
    preco_adicional: float

    class Config:
        from_attributes = True

class VarianteSchema(BaseModel):
    id: int
    nome: str
    preco: float

    class Config:
        from_attributes = True

class ItemSchema(BaseModel):
    id: int
    nome: str
    preco_base: float
    controla_estoque: bool
    estoque_atual: float
    reserva_ativa: bool
    disponivel_sempre: bool
    dias_semana: Optional[str]
    variantes: List[VarianteSchema] = []
    adicionais: List[AdicionalSchema] = []

    class Config:
        from_attributes = True

class CategoriaSchema(BaseModel):
    id: int
    nome: str
    itens: List[ItemSchema] = []

    class Config:
        from_attributes = True