from app.database import SessionLocal
from app.models.cardapio import Categoria, Item, ItemVariante, ItemAdicional

db = SessionLocal()

# Categorias
cat_galeto = Categoria(nome="Galeto")
cat_acomp = Categoria(nome="Acompanhamentos")
cat_especiais = Categoria(nome="Especiais")
cat_bebidas = Categoria(nome="Bebidas")
cat_combos = Categoria(nome="Combos")

db.add_all([cat_galeto, cat_acomp, cat_especiais, cat_bebidas, cat_combos])
db.commit()

# Tipos de Galeto
galeto = Item(nome="Galeto", categoria_id=cat_galeto.id, preco_base=47.00,
              controla_estoque=True, estoque_atual=10, unidade_estoque="unidade", reserva_ativa=True)
meio_galeto = Item(nome="Meio Galeto", categoria_id=cat_galeto.id, preco_base=24.00,
                   controla_estoque=True, estoque_atual=10, unidade_estoque="unidade", reserva_ativa=True)
db.add_all([galeto, meio_galeto])
db.commit()

# Adicionais do galeto
db.add_all([
    ItemAdicional(item_id=galeto.id, nome="Queijo", preco_adicional=0),
    ItemAdicional(item_id=galeto.id, nome="Orégano", preco_adicional=0),
    ItemAdicional(item_id=meio_galeto.id, nome="Queijo", preco_adicional=0),
    ItemAdicional(item_id=meio_galeto.id, nome="Orégano", preco_adicional=0),
])
db.commit()

# Acompanhamentos
db.add_all([
    Item(nome="Toscana", categoria_id=cat_acomp.id, preco_base=3.50, unidade_estoque="unidade"),
    Item(nome="Farofa (150g)", categoria_id=cat_acomp.id, preco_base=6.00, unidade_estoque="porcao"),
    Item(nome="Arroz Branco (400g)", categoria_id=cat_acomp.id, preco_base=7.00, unidade_estoque="porcao"),
    Item(nome="Arroz Baião de Dois (400g)", categoria_id=cat_acomp.id, preco_base=9.00, unidade_estoque="porcao"),
    Item(nome="Feijão (300ml)", categoria_id=cat_acomp.id, preco_base=7.00, controla_estoque=True, estoque_atual=20, unidade_estoque="porcao"),
])
db.commit()

# Especiais (sab/dom)
feijoada = Item(nome="Feijoada", categoria_id=cat_especiais.id, preco_base=21.00,
                controla_estoque=True, estoque_atual=5.0, unidade_estoque="litro",
                disponivel_sempre=False, dias_semana="sab,dom")
mocoto = Item(nome="Mocotó", categoria_id=cat_especiais.id, preco_base=27.00,
              controla_estoque=True, estoque_atual=5.0, unidade_estoque="litro",
              disponivel_sempre=False, dias_semana="sab,dom")
salpicao = Item(nome="Salpicão (300g)", categoria_id=cat_especiais.id, preco_base=13.00,
                disponivel_sempre=False, dias_semana="sex,sab,dom")
db.add_all([feijoada, mocoto, salpicao])
db.commit()

# Variantes feijoada e mocotó
db.add_all([
    ItemVariante(item_id=feijoada.id, nome="500ml", preco=21.00, consumo_estoque=0.5),
    ItemVariante(item_id=feijoada.id, nome="1 Litro", preco=42.00, consumo_estoque=1.0),
    ItemVariante(item_id=mocoto.id, nome="500ml", preco=27.00, consumo_estoque=0.5),
    ItemVariante(item_id=mocoto.id, nome="1 Litro", preco=54.00, consumo_estoque=1.0),
])
db.commit()

# Bebidas
db.add_all([
    Item(nome="Refri Lata Coca-Cola", categoria_id=cat_bebidas.id, preco_base=6.00),
    Item(nome="Refri Lata Jesus", categoria_id=cat_bebidas.id, preco_base=6.00),
    Item(nome="Refri Lata Guaraná", categoria_id=cat_bebidas.id, preco_base=6.00),
    Item(nome="Coca-Cola 1L", categoria_id=cat_bebidas.id, preco_base=11.00),
    Item(nome="Jesus 1L", categoria_id=cat_bebidas.id, preco_base=11.00),
    Item(nome="Coca-Cola 1,5L", categoria_id=cat_bebidas.id, preco_base=14.00),
    Item(nome="Jesus 1,5L", categoria_id=cat_bebidas.id, preco_base=14.00),
    Item(nome="Guaraná Antártica 1L", categoria_id=cat_bebidas.id, preco_base=9.00),
    Item(nome="Guaraná Antártica 1,5L", categoria_id=cat_bebidas.id, preco_base=12.00),
    Item(nome="Água Mineral", categoria_id=cat_bebidas.id, preco_base=3.00),
])
db.commit()

db.close()
print("Banco populado com sucesso!")