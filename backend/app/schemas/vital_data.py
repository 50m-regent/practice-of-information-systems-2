from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class VitalDataCategoryResponse(BaseModel):
    id: int
    name: str

class RegisterRequest(BaseModel):
    name_id: int
    date: datetime
    value: float

class CreateCategoryRequest(BaseModel):
    vitaldataname: str
    is_public: bool
    is_accumulating: bool

class StatisticsResponse(BaseModel):
    average: float
    your_value: float
    percentile: float

class VitalDataResponse(BaseModel):
    name: str
    value: float
    date: datetime

class VitalPoint(BaseModel):
    x: datetime
    y: float

class LifeLogGroupedResponse(BaseModel):
    data_name: str
    vitaldata_list: List[VitalPoint]