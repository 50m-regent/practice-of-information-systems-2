from sqlalchemy import Column, Integer, String
from settings import Base

class VitalDataName(Base):
    __tablename__ = 'vitaldataname'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    def __repr__(self):
        return f"<VitalDataName(id={self.id}, name={self.name})>"