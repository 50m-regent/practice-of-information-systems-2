from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message_id: str
    reply: str
    conversation_id: str
    function_called: Optional[Dict[str, Any]] = None
    function_result: Optional[Dict[str, Any]] = None
    timestamp: datetime

class ChatMessage(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    function_call: Optional[Dict[str, Any]] = None
    function_result: Optional[Dict[str, Any]] = None

class ConversationSummary(BaseModel):
    conversation_id: str
    title: Optional[str]
    last_message: str
    created_at: datetime
    updated_at: datetime
    message_count: int

class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    title: Optional[str]
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

class CreateConversationRequest(BaseModel):
    title: Optional[str] = None