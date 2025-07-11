from sqlalchemy import Column, Integer, String
from settings import Base
from sqlalchemy.orm import relationship

class VitalDataName(Base):
    __tablename__ = 'vitaldataname'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    vitaldata = relationship("VitalData", back_populates="vitaldataname")

    def __repr__(self):
        return f"<VitalDataName(id={self.id}, name={self.name})>"