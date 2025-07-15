from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from settings import Base
from datetime import datetime
import uuid

class ChatConversation(Base):
    __tablename__ = "chat_conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)  # 会話のタイトル（最初のメッセージから生成）
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")
    user = relationship("User", back_populates="chat_conversations")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("chat_conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    function_call = Column(JSON, nullable=True)  # OpenAI function call情報
    function_result = Column(JSON, nullable=True)  # function実行結果
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # リレーションシップ
    conversation = relationship("ChatConversation", back_populates="messages")