from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from settings import Base

class OTPCode(Base):
    __tablename__ = 'otpcodes'

    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)

    def __repr__(self):
        return (
            f"<OTPCode(id={self.id}, otp_code={self.otp_code}, expires_at={self.expires_at}, "
            f"is_used={self.is_used})>"
        )