from fastapi import FastAPI
from .database import engine, Base
from . import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Monitor Jakości Powietrza",
    description="API do sprawdzania jakości powietrza w miastach",
    version="1.0.0"
)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Serwer działa poprawnie!"}