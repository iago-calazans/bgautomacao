from pydantic import BaseModel
from typing import Optional, List

class PedidoItemInput(BaseModel):
    item_id: int
    variante_id: Optional[int] = None
    quantidade: float
    preco_unitario: float
    observacao: Optional[str] = None
    adicionais: Optional[str] = None

class PedidoInput(BaseModel):
    token: str
    nome_cliente: str
    telefone: str
    tipo: str
    endereco: Optional[str] = None
    forma_pagamento: str
    observacao_geral: Optional[str] = None
    total: float
    itens: List[PedidoItemInput]

class PedidoItemOutput(BaseModel):
    id: int
    item_id: int
    variante_id: Optional[int]
    quantidade: float
    preco_unitario: float
    observacao: Optional[str]
    adicionais: Optional[str]

    class Config:
        from_attributes = True

class PedidoOutput(BaseModel):
    id: int
    nome_cliente: str
    telefone: str
    tipo: str
    endereco: Optional[str]
    forma_pagamento: str
    status_pagamento: str
    status: str
    observacao_geral: Optional[str]
    total: float
    itens: List[PedidoItemOutput] = []

    class Config:
        from_attributes = True