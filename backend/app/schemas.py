from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AirQualityBase(BaseModel):
    city: str
    overall_status: str
    pm10: Optional[float] = None
    pm25: Optional[float] = None
    no2: Optional[float] = None
    o3: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None

class AirQualityResponse(AirQualityBase):
    id: int
    refreshed_at: datetime

    model_config = ConfigDict(from_attributes=True)