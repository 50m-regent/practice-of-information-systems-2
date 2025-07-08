from sqlalchemy import Column, Integer, String, Boolean, DateTime, LargeBinary, Float
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.ext.mutable import MutableList
from settings import Base
from typing import Optional, List

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)
    username = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    sex = Column(Boolean, nullable=True)
    friends: Optional[List[int]] = Column(MutableList.as_mutable(JSON), nullable=True)
    objective: Optional[List[int]] = Column(MutableList.as_mutable(JSON), nullable=True)
    icon = Column(LargeBinary, nullable=True)
    height = Column(Float, nullable=True)

    def __repr__(self):
        return (
            f"<User(id={self.id}, email={self.email}, username={self.username}, "
            f"date_of_birth={self.date_of_birth}, sex={self.sex}, "
            f"friends={self.friends}, objective={self.objective}, "
            f"icon={self.icon}, height={self.height})>"
        )