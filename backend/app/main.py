from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.models import cardapio, pedido
from app.routers import cardapio as cardapio_router
from app.routers import reserva as reserva_router
from app.routers import pedido as pedido_router

from app.routers.reserva import limpar_reservas_expiradas
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(limpar_reservas_expiradas(SessionLocal))
    yield

Base.metadata.create_all(bind=engine)

app = FastAPI()


## include de rotas ## 
app.include_router(cardapio_router.router)
app.include_router(reserva_router.router)
app.include_router(pedido_router.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "API da Brasa & Galeto funcionando"}