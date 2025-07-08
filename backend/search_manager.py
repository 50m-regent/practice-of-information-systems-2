from typing import List, Dict, Any, Optional
from openai import OpenAI
from vector_store_manager import VectorStoreManager
from config import DEFAULT_MODEL, DEFAULT_VECTOR_STORE_NAME, MESSAGES


class SearchManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.vector_store_manager = VectorStoreManager(api_key)
    
    def setup_search_system(self, vector_store_name: str = DEFAULT_VECTOR_STORE_NAME) -> bool:
        try:
            self.vector_store_manager.create_or_get_vector_store(vector_store_name)
            
            if not self.vector_store_manager.vector_store_id:
                print(f"{MESSAGES['ERROR_PREFIX']} Vector Store IDが設定されていません")
                return False
            
            success = self.vector_store_manager.upload_database_to_vector_store()
            print(MESSAGES['INIT_COMPLETE'] if success else MESSAGES['INIT_FAILED'])
            
            return success
            
        except Exception as e:
            print(f"{MESSAGES['ERROR_PREFIX']} 検索システムセットアップエラー: {e}")
            return False
    
    def search(self, query: str, context: str = "") -> Dict[str, Any]:
        try:
            if not self.vector_store_manager.vector_store_id:
                return {
                    "success": False,
                    "error": "Vector Storeが設定されていません。先にsetup_search_system()を実行してください。"
                }
            
            full_query = f"{context}\n\n質問: {query}" if context else query
            
            assistant = self.client.beta.assistants.create(
                name="Health Data AI Assistant",
                instructions="""あなたは健康データ管理システムのAIアシスタントです。
                
以下の点に注意して回答してください：
1. 提供されたデータベース情報を元に正確な情報を提供する
2. 日本語で自然な回答をする
3. データが見つからない場合は、その旨を明確に伝える
4. 数値データについては具体的な値を示す
5. 関連するデータがある場合は、それも含めて説明する

ユーザーの質問に対して、関連するユーザー情報、バイタルデータ、目標データを検索し、わかりやすく回答してください。""",
                model=DEFAULT_MODEL,
                tools=[{"type": "file_search"}],
                tool_resources={
                    "file_search": {
                        "vector_store_ids": [self.vector_store_manager.vector_store_id]
                    }
                }
            )
            
            thread = self.client.beta.threads.create()
            
            message = self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=full_query
            )
            
            run = self.client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                assistant_id=assistant.id
            )
            
            result = {
                "success": False,
                "response": "",
                "sources": [],
                "run_status": run.status
            }
            
            if run.status == "completed":
                messages = self.client.beta.threads.messages.list(
                    thread_id=thread.id
                )
                
                for message in messages.data:
                    if message.role == "assistant":
                        for content in message.content:
                            if content.type == "text":
                                result["response"] = content.text.value
                                result["success"] = True
                                
                                if hasattr(content.text, 'annotations'):
                                    for annotation in content.text.annotations:
                                        if hasattr(annotation, 'file_citation'):
                                            result["sources"].append({
                                                "type": "file_citation",
                                                "file_id": annotation.file_citation.file_id
                                            })
                                break
                        break
            else:
                result["error"] = f"検索実行に失敗しました。ステータス: {run.status}"
            
            self.client.beta.assistants.delete(assistant.id)
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": f"検索エラー: {str(e)}"
            }
    
    def get_conversation_context(self, user_query: str) -> str:
        contexts = {
            "ユーザー": "ユーザー情報に関する質問です。",
            "バイタル": "バイタルデータに関する質問です。",
            "目標": "目標設定に関する質問です。",
            "健康": "健康データ全般に関する質問です。"
        }
        
        for keyword, context in contexts.items():
            if keyword in user_query:
                return context
        return "健康データに関する一般的な質問です。"
    
    def suggest_queries(self) -> List[str]:
        from config import SUGGESTION_QUERIES
        return SUGGESTION_QUERIES
    
    def cleanup(self):
        if hasattr(self, 'vector_store_manager'):
            self.vector_store_manager.delete_vector_store()