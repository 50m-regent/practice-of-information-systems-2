from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class VitalDataResponse(BaseModel):
    name: str
    value: float
    date: str

class StatisticsResponse(BaseModel):
    average: float
    your_value: float
    percentile: int

class LifeLogResponse(BaseModel):
    data_name: str
    is_public: bool
    register_date: datetime
    graph: Any