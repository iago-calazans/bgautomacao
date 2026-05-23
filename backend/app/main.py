from fastapi import FastAPI
from app.database import engine, Base
from app.models import cardapio, pedido

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok", "message": "API da Brasa & Galeto funcionando"}