from sqlalchemy import Column, Integer, ForeignKey, Boolean
from settings import Base

class UserVitalCategory(Base):
    __tablename__ = 'uservitalcategory'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    vital_id = Column(Integer, ForeignKey('vitaldataname.id'), nullable=False)
    is_public = Column(Boolean, nullable=False)
    is_accumulating = Column(Boolean, nullable=False)

    def __repr__(self):
        return f"<UserVitalCategory(id={self.id}, user_id={self.user_id}, vital_id={self.vital_id}, is_public={self.is_public}, is_accumulating={self.is_accumulating})>"