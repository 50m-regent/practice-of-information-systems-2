from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.schemas.auth import LoginRequest, TokenResponse, OTPRequest
from app.utils.auth import create_access_token, generate_otp
from settings import get_db
from app.config import settings
from models.users import User
from models.otpcodes import OTPCode

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login/")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    db.query(OTPCode).filter(OTPCode.id == user.id).delete()
    
    otp_record = OTPCode(id=user.id, otp_code=otp_code, expires_at=expires_at, is_used=False)
    db.add(otp_record)
    db.commit()
    
    return {"message": f"OTP sent: {otp_code}"}

@router.post("/one-time/", response_model=TokenResponse)
async def verify_otp(request: OTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTPCode).filter(
        OTPCode.otp_code == request.otp_code,
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    
    otp_record.is_used = True
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(otp_record.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}