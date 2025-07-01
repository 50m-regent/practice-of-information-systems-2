from fastapi import APIRouter,  Depends
from app.schemas.user import (
    ProfileResponse, SettingsResponse, IdResponse
)
from app.utils.auth import get_current_user
from models.users import User

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

@router.get("/settings/", response_model=SettingsResponse)
async def get_settings(current_user: User = Depends(get_current_user)):
    return SettingsResponse(
        icon=current_user.icon,
        address=current_user.email,
        username=current_user.username,
        height=current_user.height
    )

@router.get("/id", response_model=IdResponse)
async def get_user_id(current_user: User = Depends(get_current_user)):
    return IdResponse(id=current_user.id)