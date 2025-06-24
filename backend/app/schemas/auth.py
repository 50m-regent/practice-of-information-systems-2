from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class OTPRequest(BaseModel):
    otp_code: str