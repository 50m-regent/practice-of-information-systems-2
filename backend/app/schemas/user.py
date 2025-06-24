from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProfileResponse(BaseModel):
    icon: Optional[str] = None
    username: str
    date_of_birth: Optional[datetime] = None
    height: Optional[float] = None
    sex: Optional[bool] = None

class SettingsResponse(BaseModel):
    icon: Optional[str] = None
    address: str
    username: str
    height: Optional[float] = None

class FriendListResponse(BaseModel):
    user_id: int
    username: str
    icon: Optional[str] = None
    latest_step: Optional[float] = None

class FriendDetailResponse(BaseModel):
    user_id: int
    username: str
    age: int
    sex: Optional[bool] = None
    latest_data: List[Dict[str, Any]]

class AddFriendRequest(BaseModel):
    friend_id: int