from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.schemas.user import FriendListResponse, FriendDetailResponse, AddFriendRequest
from app.utils.auth import get_current_user
from settings import get_db
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.get("/", response_model=List[FriendListResponse])
async def get_friends(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friends = []
    if current_user.friends:
        friend_ids = current_user.friends
        for friend_id in friend_ids:
            friend = db.query(User).filter(User.id == friend_id).first()
            if friend:
                steps_data = db.query(VitalData).join(VitalDataName).filter(
                    VitalDataName.name == "steps",
                    VitalData.name_id == VitalDataName.id
                ).order_by(VitalData.date.desc()).first()
                
                friends.append(FriendListResponse(
                    user_id=friend.id,
                    username=friend.username,
                    icon=None,
                    latest_step=steps_data.value if steps_data else None
                ))
    
    return friends

@router.get("/{user_id}", response_model=FriendDetailResponse)
async def get_friend_detail(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.id == user_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    age = 0
    if friend.date_of_birth:
        today = datetime.now()
        age = today.year - friend.date_of_birth.year
        if today.month < friend.date_of_birth.month or (today.month == friend.date_of_birth.month and today.day < friend.date_of_birth.day):
            age -= 1
    
    latest_data = []
    vital_data = db.query(VitalData).join(VitalDataName).filter(
        VitalData.name_id == VitalDataName.id
    ).order_by(VitalData.date.desc()).limit(10).all()
    
    for data in vital_data:
        data_name = db.query(VitalDataName).filter(VitalDataName.id == data.name_id).first()
        latest_data.append({
            "data_name": data_name.name,
            "value": data.value,
            "date": data.date
        })
    
    return FriendDetailResponse(
        user_id=friend.id,
        username=friend.username,
        age=age,
        sex=friend.sex,
        latest_data=latest_data
    )

@router.post("/add")
async def add_friend(request: AddFriendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.id == request.friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    friends = current_user.friends or []
    
    if request.friend_id in friends:
        raise HTTPException(status_code=400, detail="Already friends")
    
    friends.append(request.friend_id)
    current_user.friends = friends
    db.commit()
    
    return {"message": "Friend added successfully"}