from fastapi import APIRouter, Depends

from app.schemas.chat import ChatRequest, ChatResponse
from app.utils.auth import get_current_user
from models.users import User

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    reply = f"こんにちは！あなたのメッセージ「{request.message}」を受け取りました。"
    
    return ChatResponse(reply=reply)