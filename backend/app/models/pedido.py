from sqlalchemy import Column, Integer, String, Boolean, Float, Text, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    nome_cliente = Column(String(100), nullable=False)
    telefone = Column(String(20), nullable=False)
    tipo = Column(Enum("delivery", "retirada"), nullable=False)
    endereco = Column(String(255), nullable=True)
    forma_pagamento = Column(Enum("pix", "debito", "credito", "dinheiro"), nullable=False)
    status_pagamento = Column(Enum("aguardando", "pago", "a pagar"), default="aguardando")
    status = Column(Enum("pendente", "em_preparo", "enviado", "concluido", "cancelado"), default="pendente")
    observacao_geral = Column(Text, nullable=True)
    total = Column(Float, nullable=False)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    itens = relationship("PedidoItem", back_populates="pedido")


class PedidoItem(Base):
    __tablename__ = "pedido_itens"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    variante_id = Column(Integer, ForeignKey("item_variantes.id"), nullable=True)
    quantidade = Column(Float, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    observacao = Column(Text, nullable=True)
    adicionais = Column(Text, nullable=True)

    pedido = relationship("Pedido", back_populates="itens")