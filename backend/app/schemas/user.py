from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProfileResponse(BaseModel):
    icon: Optional[str] = None
    username: str
    date_of_birth: Optional[datetime] = None
    height: Optional[float] = None
    sex: Optional[bool] = None

class ProfileUpdateRequest(BaseModel):
    icon: Optional[str] = None
    username: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    height: Optional[float] = None
    sex: Optional[bool] = None

class SettingsResponse(BaseModel):
    icon: Optional[str] = None
    address: str
    username: str
    height: Optional[float] = None

class IdResponse(BaseModel):
    id: int

class FriendListResponse(BaseModel):
    user_id: int
    username: str
    icon: Optional[str] = None
    age: Optional[int] = -1

class FriendDetailResponse(BaseModel):
    user_id: int
    icon: Optional[str] = None
    username: str
    age: int
    sex: Optional[bool] = None
    vital_data: Optional[List[Dict[str, Any]]] = None

class AddFriendRequest(BaseModel):
    friend_id: int