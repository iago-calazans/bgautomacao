from sqlalchemy import Column, Integer, String, Boolean, Float, Text, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    ativo = Column(Boolean, default=True)

    itens = relationship("Item", back_populates="categoria")


class Item(Base):
    __tablename__ = "itens"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    preco_base = Column(Float, nullable=False)
    controla_estoque = Column(Boolean, default=False)
    estoque_atual = Column(Float, default=0)
    unidade_estoque = Column(Enum("unidade", "litro", "porcao"), default="unidade")
    reserva_ativa = Column(Boolean, default=False)
    disponivel_sempre = Column(Boolean, default=True)
    dias_semana = Column(String(20), nullable=True)
    ativo = Column(Boolean, default=True)

    categoria = relationship("Categoria", back_populates="itens")
    variantes = relationship("ItemVariante", back_populates="item")
    adicionais = relationship("ItemAdicional", back_populates="item")


class ItemVariante(Base):
    __tablename__ = "item_variantes"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    nome = Column(String(50), nullable=False)
    preco = Column(Float, nullable=False)
    consumo_estoque = Column(Float, default=1)
    ativo = Column(Boolean, default=True)

    item = relationship("Item", back_populates="variantes")


class ItemAdicional(Base):
    __tablename__ = "item_adicionais"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    nome = Column(String(50), nullable=False)
    preco_adicional = Column(Float, default=0)
    ativo = Column(Boolean, default=True)

    item = relationship("Item", back_populates="adicionais")


class ComboComponente(Base):
    __tablename__ = "combo_componentes"

    id = Column(Integer, primary_key=True, index=True)
    combo_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    quantidade = Column(Float, default=1)

class Reserva(Base):
    __tablename__ = "reservas"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(36), unique=True, nullable=False)
    expira_em = Column(DateTime, nullable=False)
    ativa = Column(Boolean, default=True)

