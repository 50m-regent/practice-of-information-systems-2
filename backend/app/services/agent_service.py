"""
エージェントサービス
OpenAI API経由でのfunction callingとチャット履歴管理
"""

import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from openai import AsyncOpenAI

from models.users import User
from models.chat_conversation import ChatConversation, ChatMessage
from app.services.internal_api import InternalAPIService
from app.services.function_schemas import ALL_FUNCTION_SCHEMAS


class AgentService:
    def __init__(self, db: Session, user: User, openai_api_key: str):
        self.db = db
        self.user = user
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.internal_api = InternalAPIService(db, user)
        
        # 利用可能な関数マッピング
        self.available_functions = {
            "create_objective": self.internal_api.create_objective,
            "get_objectives": self.internal_api.get_objectives,
            "update_objective": self.internal_api.update_objective,
            "delete_objective": self.internal_api.delete_objective,
            "register_vital_data": self.internal_api.register_vital_data,
            "get_vital_data": self.internal_api.get_vital_data,
        }

    async def process_message(
        self, 
        message: str, 
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """メッセージを処理し、OpenAI APIとfunction callingを使用して応答を生成"""
        try:
            # 会話セッションの取得または作成
            conversation = await self._get_or_create_conversation(conversation_id)
            
            # ユーザーメッセージを保存
            user_message = ChatMessage(
                id=str(uuid.uuid4()),
                conversation_id=conversation.id,
                role="user",
                content=message,
                timestamp=datetime.utcnow()
            )
            self.db.add(user_message)
            self.db.commit()
            
            # 会話履歴を取得
            conversation_history = await self._get_conversation_history(conversation.id)
            
            # OpenAI APIを呼び出し
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=conversation_history,
                tools=ALL_FUNCTION_SCHEMAS,
                tool_choice="auto"
            )
            
            assistant_message = response.choices[0].message
            function_call_info = None
            function_result = None
            
            # Function callingの処理
            if assistant_message.tool_calls:
                tool_call = assistant_message.tool_calls[0]
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                # 関数を実行
                if function_name in self.available_functions:
                    function_result = await self.available_functions[function_name](**function_args)
                    function_call_info = {
                        "name": function_name,
                        "arguments": function_args
                    }
                    
                    # 関数の結果を含めて再度OpenAI APIを呼び出し
                    conversation_history.append({
                        "role": "assistant",
                        "content": assistant_message.content or "",
                        "tool_calls": [{"id": tool_call.id, "type": "function", "function": {"name": function_name, "arguments": tool_call.function.arguments}}]
                    })
                    
                    conversation_history.append({
                        "role": "tool",
                        "content": json.dumps(function_result, ensure_ascii=False),
                        "tool_call_id": tool_call.id
                    })
                    
                    # 最終応答を生成
                    final_response = await self.openai_client.chat.completions.create(
                        model="gpt-4",
                        messages=conversation_history
                    )
                    
                    reply_content = final_response.choices[0].message.content
                else:
                    reply_content = f"申し訳ございません。'{function_name}' 関数は利用できません。"
            else:
                reply_content = assistant_message.content or "申し訳ございません。応答を生成できませんでした。"
            
            # アシスタントメッセージを保存
            assistant_message_obj = ChatMessage(
                id=str(uuid.uuid4()),
                conversation_id=conversation.id,
                role="assistant",
                content=reply_content,
                function_call=function_call_info,
                function_result=function_result,
                timestamp=datetime.utcnow()
            )
            self.db.add(assistant_message_obj)
            
            # 会話の更新時刻を更新
            conversation.updated_at = datetime.utcnow()
            
            # 会話にタイトルがない場合は生成
            if not conversation.title:
                conversation.title = await self._generate_conversation_title(message)
            
            self.db.commit()
            
            return {
                "message_id": assistant_message_obj.id,
                "reply": reply_content,
                "conversation_id": conversation.id,
                "function_called": function_call_info,
                "function_result": function_result,
                "timestamp": assistant_message_obj.timestamp
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "message_id": str(uuid.uuid4()),
                "reply": f"申し訳ございません。エラーが発生しました: {str(e)}",
                "conversation_id": conversation_id or "error",
                "function_called": None,
                "function_result": None,
                "timestamp": datetime.utcnow()
            }

    async def _get_or_create_conversation(
        self, 
        conversation_id: Optional[str] = None
    ) -> ChatConversation:
        """会話セッションを取得または作成"""
        if conversation_id:
            conversation = self.db.query(ChatConversation).filter(
                ChatConversation.id == conversation_id,
                ChatConversation.user_id == self.user.id
            ).first()
            if conversation:
                return conversation
        
        # 新しい会話を作成
        conversation = ChatConversation(
            id=str(uuid.uuid4()),
            user_id=self.user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(conversation)
        self.db.commit()
        return conversation

    async def _get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """会話履歴をOpenAI API形式で取得"""
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        # システムメッセージを最初に追加
        history = [{
            "role": "system",
            "content": "あなたは健康管理アプリケーションのアシスタントです。ユーザーの健康目標の設定や管理、バイタルデータの記録などをサポートします。日本語で丁寧に応答してください。"
        }]
        
        for message in messages:
            history.append({
                "role": message.role,
                "content": message.content
            })
        
        return history

    async def _generate_conversation_title(self, first_message: str) -> str:
        """会話の最初のメッセージから会話タイトルを生成"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "以下のメッセージから会話のタイトルを20文字以内で生成してください。健康管理に関連する内容であることを考慮してください。"
                    },
                    {
                        "role": "user",
                        "content": first_message
                    }
                ],
                max_tokens=50
            )
            return response.choices[0].message.content.strip()
        except:
            return "健康管理の相談"

    async def get_conversations(self) -> List[Dict[str, Any]]:
        """ユーザーの会話一覧を取得"""
        conversations = self.db.query(ChatConversation).filter(
            ChatConversation.user_id == self.user.id
        ).order_by(ChatConversation.updated_at.desc()).all()
        
        result = []
        for conversation in conversations:
            # 最新メッセージを取得
            last_message = self.db.query(ChatMessage).filter(
                ChatMessage.conversation_id == conversation.id
            ).order_by(ChatMessage.timestamp.desc()).first()
            
            # メッセージ数を取得
            message_count = self.db.query(ChatMessage).filter(
                ChatMessage.conversation_id == conversation.id
            ).count()
            
            result.append({
                "conversation_id": conversation.id,
                "title": conversation.title,
                "last_message": last_message.content if last_message else "",
                "created_at": conversation.created_at,
                "updated_at": conversation.updated_at,
                "message_count": message_count
            })
        
        return result

    async def get_conversation_history(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """特定の会話の履歴を取得"""
        conversation = self.db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == self.user.id
        ).first()
        
        if not conversation:
            return None
        
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        message_list = []
        for message in messages:
            message_list.append({
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "timestamp": message.timestamp,
                "function_call": message.function_call,
                "function_result": message.function_result
            })
        
        return {
            "conversation_id": conversation.id,
            "title": conversation.title,
            "messages": message_list,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }

    async def delete_conversation(self, conversation_id: str) -> bool:
        """会話を削除"""
        conversation = self.db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == self.user.id
        ).first()
        
        if not conversation:
            return False
        
        # メッセージも一緒に削除（cascadeで自動削除される）
        self.db.delete(conversation)
        self.db.commit()
        return True