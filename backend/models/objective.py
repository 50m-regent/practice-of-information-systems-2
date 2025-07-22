from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from settings import Base
from sqlalchemy.orm import relationship

class Objective(Base):
    __tablename__ = 'objective'

    id = Column(Integer, primary_key=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    name_id = Column(Integer, ForeignKey('vitaldataname.id'), nullable=False)
    value = Column(Float, nullable=False)

    vitaldataname = relationship("VitalDataName", back_populates="objective")

    def __repr__(self):
        return (
            f"<Objective(id={self.id}, start_date={self.start_date}, end_date={self.end_date}, "
            f"name_id={self.name_id}, value={self.value})>"
        )