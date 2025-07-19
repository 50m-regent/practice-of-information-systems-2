from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class FriendData(BaseModel):
    friend_icon: str
    friend_info: float

class ObjectiveResponse(BaseModel):
    objective_id: int
    data_name: str
    start_date: datetime
    end_date: datetime
    objective_value: float
    my_value: Optional[float] = None
    friends: List[FriendData]

class CreateObjectiveRequest(BaseModel):
    data_name: str
    start_date: datetime
    end_date: datetime
    objective_value: float

class ObjectiveListResponse(BaseModel):
    id: int
    name: str
    start: str
    end: str
    objective_value: float
    progress: float

class UpdateObjectiveRequest(BaseModel):
    objective_value: float