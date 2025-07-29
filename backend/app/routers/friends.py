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
                    age=age,
                    sex=friend.sex
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
    
    # Get friend's registered categories that are public
    user_categories = db.query(VitalDataName).join(UserVitalCategory).filter(
        VitalDataName.id == UserVitalCategory.vital_id, 
        UserVitalCategory.user_id == friend.id,
        UserVitalCategory.is_public == True
    ).all()
    
    life_logs = []
    
    for category in user_categories:
        # Get vital data for this category
        vital_data = db.query(VitalData).filter(
            VitalData.user_id == friend.id,
            VitalData.name_id == category.id
        ).order_by(VitalData.date).all()
        
        # Convert to chart data format
        vitaldata_list = [
            {"x": data.date.isoformat(), "y": data.value}
            for data in vital_data
        ]
        
        life_logs.append({
            "data_name": category.name,
            "vitaldata_list": vitaldata_list
        })
    
    return FriendDetailResponse(
        user_id=friend.id,
        icon=friend.icon,
        username=friend.username,
        age=age,
        sex=friend.sex,
        life_logs=life_logs
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