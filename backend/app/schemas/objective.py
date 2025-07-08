from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class ObjectiveResponse(BaseModel):
    objective_id: int
    start_date: datetime
    end_date: datetime
    my_value: float
    data_name: str
    friends: List[Dict[str, Any]]

class ObjectiveListResponse(BaseModel):
    id: int
    name: str
    start: str
    end: str
    objective_value: float
    progress: float

class CreateObjectiveRequest(BaseModel):
    data_name: str
    start_date: datetime
    end_date: datetime
    objective_value: float

class UpdateObjectiveRequest(BaseModel):
    objective_value: float