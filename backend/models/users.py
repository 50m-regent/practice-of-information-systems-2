from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.sqlite import JSON
from settings import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)
    username = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    sex = Column(Boolean, nullable=True)
    friends = Column(JSON, nullable=True)  # Storing list of integers as JSON
    objective = Column(JSON, nullable=True)  # Storing list of integers as JSON

    def __repr__(self):
        return (
            f"<User(id={self.id}, email={self.email}, username={self.username}, "
            f"date_of_birth={self.date_of_birth}, sex={self.sex}, "
            f"friends={self.friends}, objective={self.objective})>"
        )
