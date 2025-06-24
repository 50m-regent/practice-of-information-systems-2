from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from settings import Base

class VitalData(Base):
    __tablename__ = 'vitaldata'

    id = Column(Integer, primary_key=True)
    date = Column(DateTime, nullable=False)
    name_id = Column(Integer, ForeignKey('vitaldataname.id'), nullable=False)
    value = Column(Float, nullable=False)
    is_accumulating = Column(Boolean, nullable=False)
    is_public = Column(Boolean, nullable=False)

    def __repr__(self):
        return (
            f"<VitalData(id={self.id}, date={self.date}, name_id={self.name_id}, "
            f"value={self.value}, is_accumulating={self.is_accumulating}, "
            f"is_public={self.is_public})>"
        )