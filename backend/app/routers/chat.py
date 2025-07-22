import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ConversationSummary, 
    ConversationHistoryResponse,
    CreateConversationRequest
)
from app.utils.auth import get_current_user
from app.services.agent_service import AgentService
from models.users import User
from settings import get_db

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """メッセージを送信してエージェントから応答を受け取る"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key が設定されていません")
    
    agent_service = AgentService(db, current_user, openai_api_key)
    
    try:
        result = await agent_service.process_message(
            request.message, 
            request.conversation_id
        )
        
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"メッセージ処理中にエラーが発生しました: {str(e)}")

@router.get("/conversations", response_model=List[ConversationSummary])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーの会話一覧を取得"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key が設定されていません")
    
    agent_service = AgentService(db, current_user, openai_api_key)
    
    try:
        conversations = await agent_service.get_conversations()
        return [ConversationSummary(**conv) for conv in conversations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"会話一覧取得中にエラーが発生しました: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定の会話の履歴を取得"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key が設定されていません")
    
    agent_service = AgentService(db, current_user, openai_api_key)
    
    try:
        history = await agent_service.get_conversation_history(conversation_id)
        if not history:
            raise HTTPException(status_code=404, detail="会話が見つかりません")
        
        return ConversationHistoryResponse(**history)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"会話履歴取得中にエラーが発生しました: {str(e)}")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """会話を削除"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key が設定されていません")
    
    agent_service = AgentService(db, current_user, openai_api_key)
    
    try:
        success = await agent_service.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="会話が見つかりません")
        
        return {"message": "会話を削除しました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"会話削除中にエラーが発生しました: {str(e)}")

@router.post("/conversations", response_model=dict)
async def create_conversation(
    request: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新しい会話を作成"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key が設定されていません")
    
    agent_service = AgentService(db, current_user, openai_api_key)
    
    try:
        conversation = await agent_service._get_or_create_conversation()
        if request.title:
            conversation.title = request.title
            db.commit()
        
        return {
            "conversation_id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"会話作成中にエラーが発生しました: {str(e)}")

# 後方互換性のため、元のエンドポイントも残す
@router.post("", response_model=ChatResponse)
async def chat_legacy(
    request: ChatRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """レガシーチャットエンドポイント（後方互換性のため）"""
    return await send_message(request, current_user, db)