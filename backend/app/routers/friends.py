from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import base64

from app.schemas.user import FriendListResponse, FriendDetailResponse, AddFriendRequest
from app.utils.auth import get_current_user
from settings import get_db
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.uservitalcategory import UserVitalCategory

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.get("/", response_model=List[FriendListResponse])
async def get_friends(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friends = []
    if current_user.friends:
        friend_ids = current_user.friends
        for friend_id in friend_ids:
            friend = db.query(User).filter(User.id == friend_id).first()
            if friend:
                age = -1
                if friend.date_of_birth:
                    today = datetime.now()
                    age = today.year - friend.date_of_birth.year
                    if (today.month, today.day) < (friend.date_of_birth.month, friend.date_of_birth.day):
                        age -= 1

                icon_str = None
                if friend.icon:
                    if isinstance(friend.icon, bytes):
                        icon_str = base64.b64encode(friend.icon).decode('utf-8')
                    elif isinstance(friend.icon, str):
                        icon_str = friend.icon

                friends.append(FriendListResponse(
                    user_id=friend.id,
                    username=friend.username,
                    icon=icon_str,
                    age=age
                ))
    
    return friends

@router.get("/{user_id}/", response_model=FriendDetailResponse)
async def get_friend_detail(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.id == user_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    age = 0
    if friend.date_of_birth:
        today = datetime.now()
        age = today.year - friend.date_of_birth.year
        if (today.month, today.day) < (friend.date_of_birth.month, friend.date_of_birth.day):
            age -= 1
    
    vital_data = []
    vital_datas = db.query(VitalData).join(UserVitalCategory, VitalData.user_id == UserVitalCategory.user_id)\
        .join(VitalDataName, VitalData.name_id == VitalDataName.id)\
        .filter(
            VitalData.user_id == friend.id
        ).order_by(VitalData.date.desc()).all()
    
    for data in vital_datas:
        if data.UserVitalCategory.is_public == True:
            vital_data.append({
                "data_name": data.VitalDataNamename,
                "value": data.VitalData.value,
                "date": data.VitalData.date
            })
    
    return FriendDetailResponse(
        user_id=friend.id,
        icon=friend.icon,
        username=friend.username,
        age=age,
        sex=friend.sex,
        vital_data=vital_data
    )

@router.post("/add/")
async def add_friend(request: AddFriendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.id == request.friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 当前用户加对方
    friends = current_user.friends or []
    if request.friend_id not in friends:
        friends.append(request.friend_id)
        friends.sort()
        current_user.friends = friends

    # 对方也加当前用户
    friend_friends = friend.friends or []
    if current_user.id not in friend_friends:
        friend_friends.append(current_user.id)
        friend_friends.sort()
        friend.friends = friend_friends

    db.commit()
    db.refresh(current_user)
    db.refresh(friend)
    
    return {"message": "Friend added successfully"}