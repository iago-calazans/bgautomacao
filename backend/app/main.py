from fastapi import FastAPI
from app.database import engine, Base
from app.models import cardapio, pedido
from app.routers import cardapio as cardapio_router
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(cardapio_router.router)
@app.get("/")
def root():
    return {"status": "ok", "message": "API da Brasa & Galeto funcionando"}