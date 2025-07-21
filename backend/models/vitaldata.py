from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from settings import Base
from sqlalchemy.orm import relationship

class VitalData(Base):
    __tablename__ = 'vitaldata'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date = Column(DateTime, nullable=False)
    name_id = Column(Integer, ForeignKey('vitaldataname.id'), nullable=False)
    value = Column(Float, nullable=False)
    vitaldataname = relationship("VitalDataName", back_populates="vitaldata")

    def __repr__(self):
        return (
            f"<VitalData(id={self.id}, user_id={self.user_id}, date={self.date}, name_id={self.name_id}, "
            f"value={self.value})>"
        )