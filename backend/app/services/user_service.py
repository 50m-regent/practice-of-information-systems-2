from sqlalchemy.orm import Session
from typing import Optional
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_height(self, user_id: int) -> Optional[float]:
        height_data = self.db.query(VitalData).join(VitalDataName).filter(
            VitalDataName.name == "height",
            VitalData.name_id == VitalDataName.id
        ).first()
        return height_data.value if height_data else None
    
    def add_friend(self, user: User, friend_id: int) -> bool:
        if not self.get_user_by_id(friend_id):
            return False
        
        friends = user.friends or []
        if friend_id in friends:
            return False
        
        friends.append(friend_id)
        user.friends = friends
        self.db.commit()
        return True