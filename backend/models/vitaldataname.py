from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from settings import Base

class VitalDataName(Base):
    __tablename__ = 'vitaldataname'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    
    # リレーションシップ
    vital_data = relationship("VitalData", back_populates="name")
    objectives = relationship("Objective", back_populates="name")

    def __repr__(self):
        return f"<VitalDataName(id={self.id}, name={self.name})>"