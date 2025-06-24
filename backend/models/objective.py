from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from settings import Base

class Objective(Base):
    __tablename__ = 'objective'

    id = Column(Integer, primary_key=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    name_id = Column(Integer, ForeignKey('vitaldataname.id'), nullable=False)
    value = Column(Float, nullable=False)

    def __repr__(self):
        return (
            f"<Objective(id={self.id}, start_date={self.start_date}, end_date={self.end_date}, "
            f"name_id={self.name_id}, value={self.value})>"
        )