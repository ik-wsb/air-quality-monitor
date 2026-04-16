from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class AirQualityRecord(Base):
    __tablename__ = "air_quality_records"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, unique=True, index=True)
    pm10 = Column(Float, nullable=True)
    pm25 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    overall_status = Column(String)
    refreshed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)