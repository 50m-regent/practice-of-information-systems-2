from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.schemas.user import (
    ProfileResponse, SettingsResponse, FriendListResponse, 
    FriendDetailResponse, AddFriendRequest
)
from app.utils.auth import get_current_user
from app.utils.qr_code import generate_qr_code
from settings import get_db
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile/", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    height_data = db.query(VitalData).join(VitalDataName).filter(
        VitalDataName.name == "height",
        VitalData.name_id == VitalDataName.id
    ).first()
    
    height = height_data.value if height_data else None
    
    return ProfileResponse(
        icon=None,
        username=current_user.username,
        date_of_birth=current_user.date_of_birth,
        height=height,
        sex=current_user.sex
    )

@router.get("/settings/", response_model=SettingsResponse)
async def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    height_data = db.query(VitalData).join(VitalDataName).filter(
        VitalDataName.name == "height",
        VitalData.name_id == VitalDataName.id
    ).first()
    
    height = height_data.value if height_data else None
    
    return SettingsResponse(
        icon=None,
        address=current_user.email,
        username=current_user.username,
        height=height
    )

@router.get("/qrcode")
async def get_user_qrcode(current_user: User = Depends(get_current_user)):
    qr_data = f"user:{current_user.id}"
    qr_code = generate_qr_code(qr_data)
    
    return {"qr_code": qr_code}