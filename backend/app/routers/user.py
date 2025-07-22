from fastapi import APIRouter,  Depends
from app.schemas.user import (
    ProfileResponse, SettingsResponse, IdResponse, ProfileUpdateRequest
)
from app.utils.auth import get_current_user
from models.users import User
from sqlalchemy.orm import Session
from settings import get_db
import base64

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile/", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse(
        icon=current_user.icon,
        username=current_user.username,
        date_of_birth=current_user.date_of_birth,
        height=current_user.height,
        sex=current_user.sex
    )

@router.put("/profile/")
async def update_profile(
    profile: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile.icon is not None:
        current_user.icon = base64.b64decode(profile.icon)
    if profile.username is not None:
        current_user.username = profile.username
    if profile.date_of_birth is not None:
        current_user.date_of_birth = profile.date_of_birth
    if profile.height is not None:
        current_user.height = profile.height
    if profile.sex is not None:
        current_user.sex = profile.sex
    db.commit()
    db.refresh(current_user)
    return {"message": "OK"}

@router.get("/settings/", response_model=SettingsResponse)
async def get_settings(current_user: User = Depends(get_current_user)):
    return SettingsResponse(
        icon=current_user.icon,
        address=current_user.email,
        username=current_user.username,
        height=current_user.height
    )

@router.get("/id/", response_model=IdResponse)
async def get_user_id(current_user: User = Depends(get_current_user)):
    return IdResponse(id=current_user.id)