from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import redis
import json
import os
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import engine, SessionLocal
from .gios_client import fetch_air_quality

# Tworzymy tabele w bazie przy starcie aplikacji
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Monitor Jakości Powietrza API",
    description="Backend serwujący dane o zanieczyszczeniach (PostgreSQL + Redis + GIOŚ)",
    version="1.0.0"
)

# Połączenie z Redisem (uruchomionym w Dockerze) do cachowania wyników
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

# Helper do obsługi sesji bazy danych - FastAPI automatycznie ją zamknie po skończeniu requestu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Serwer i baza działają poprawnie!"}

# Główny endpoint - pobiera dane o jakości powietrza dla danego miasta
@app.get("/air-quality/{city}", response_model=schemas.AirQualityResponse, tags=["Air Quality"])
async def get_air_quality(city: str, db: Session = Depends(get_db)):
    
    city_key = city.lower()
    
    # Najpierw szukamy w Redisie - jeśli dane są tam, zwracamy je od razu
    cached_data = redis_client.get(city_key)
    if cached_data:
        print(f"[CACHE HIT] Dane z Redisa dla miasta: {city}")
        return json.loads(cached_data)

    # Jeśli nie ma w cache'u, sprawdzamy bazę danych
    db_record = db.query(models.AirQualityRecord).filter(models.AirQualityRecord.city.ilike(city)).first()
    
    # Sprawdzamy, czy dane w bazie mają mniej niż godzinę
    is_data_fresh = False
    if db_record and db_record.refreshed_at:
        is_data_fresh = datetime.utcnow() - db_record.refreshed_at < timedelta(hours=1)

    # Jeśli mamy świeże dane w bazie, używamy ich (i cachujemy w Redisie)
    if db_record and is_data_fresh:
        print(f"[DB HIT] Zwracam świeże dane z PostgreSQL dla miasta: {city}")
        
        # Konwertujemy Record z bazy na Response model (Pydantic do walidacji)
        response_data = schemas.AirQualityResponse.model_validate(db_record).model_dump(mode='json')
        
        # Zapisujemy je do Redisa na kolejną godzinę i zwracamy
        redis_client.setex(city_key, 3600, json.dumps(response_data))
        return db_record

    # Brak w cache'u i baza ma stare dane - call GIOŚ API
    print(f"[API CALL] Pobieranie nowych danych z GIOŚ API dla miasta: {city}")
    api_data = await fetch_air_quality(city)
    
    if not api_data:
        # Jeśli GIOŚ zwrócił None (np. zła nazwa miasta lub brak stacji)
        raise HTTPException(status_code=404, detail=f"Nie znaleziono stacji pomiarowych dla miasta '{city}'.")

    # Zapisujemy nowe dane w bazie (update albo insert)
    if db_record:
        # Mamy miasto w bazie, ale dane były stare - aktualizujemy je
        for key, value in api_data.items():
            setattr(db_record, key, value)
        db_record.refreshed_at = datetime.utcnow()
    else:
        # Pierwszy raz pytamy o to miasto - tworzymy nowy rekord
        db_record = models.AirQualityRecord(**api_data)
        db.add(db_record)
        
    # Zapisujemy zmiany w PostgreSQL
    db.commit()
    db.refresh(db_record)

    # Odświeżamy Redisa i odsyłamy JSON-a na Frontend
    response_data = schemas.AirQualityResponse.model_validate(db_record).model_dump(mode='json')
    redis_client.setex(city_key, 3600, json.dumps(response_data))
    
    return db_record

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
