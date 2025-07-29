from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.schemas.auth import LoginRequest, TokenResponse, OTPRequest
from app.utils.auth import create_access_token, generate_otp
from app.utils.email import send_otp_email
from settings import get_db
from app.config import settings
from models.users import User
from models.otpcodes import OTPCode

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login/")
async def login(request: LoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        user = User(
            email=request.email,
            username="新規ユーザー",
            date_of_birth=None,
            sex=None,
            friends=[],
            objective=[]
            )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    db.query(OTPCode).filter(OTPCode.id == user.id).delete()
    
    otp_record = OTPCode(id=user.id, otp_code=otp_code, expires_at=expires_at, is_used=False)
    db.add(otp_record)
    db.commit()
    
    # 邮件发送をバックグラウンドで実行し、エラーが発生してもログイン処理を継続
    try:
        background_tasks.add_task(send_otp_email, user.email, otp_code)
    except Exception as e:
        print(f"Email sending failed: {e}")
        # 邮件发送失败时，仍然返回OTP代码用于测试

    return {"message": f"OTP sent to your email.: {otp_code}"}

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