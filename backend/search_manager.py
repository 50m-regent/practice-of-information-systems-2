from typing import List, Dict, Any, Optional
import json
import asyncio
from openai import OpenAI
from vector_store_manager import VectorStoreManager
from config import DEFAULT_MODEL, DEFAULT_VECTOR_STORE_NAME, MESSAGES
from function_tools import get_function_tools
from database_manager import DatabaseManager
from app.services.internal_api import InternalAPIService


class SearchManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.vector_store_manager = VectorStoreManager(api_key)
        self.database_manager = DatabaseManager()
        self.current_user = None  # 現在のユーザー（デモ用）
    
    def setup_search_system(self, vector_store_name: str = DEFAULT_VECTOR_STORE_NAME) -> bool:
        try:
            self.vector_store_manager.create_or_get_vector_store(vector_store_name)
            
            if not self.vector_store_manager.vector_store_id:
                print(f"{MESSAGES['ERROR_PREFIX']} Vector Store IDが設定されていません")
                return False
            
            success = self.vector_store_manager.upload_database_to_vector_store()
            print(MESSAGES['INIT_COMPLETE'] if success else MESSAGES['INIT_FAILED'])
            
            # デモ用のユーザーを設定（実際の運用では認証システムが必要）
            self._set_demo_user()
            
            return success
            
        except Exception as e:
            print(f"{MESSAGES['ERROR_PREFIX']} 検索システムセットアップエラー: {e}")
            return False

    def _set_demo_user(self):
        """デモ用のユーザーを設定"""
        try:
            # print("DEBUG: _set_demo_user開始")
            from settings import get_db
            from models.users import User
            
            session = next(get_db())
            
            # とりあえずuser_id=3のユーザーを取得（デモ用）
            user = session.query(User).filter(User.id == 3).first()
            # print(f"DEBUG: クエリ結果のuser = {user}")
            if user:
                self.current_user = user
                print(f"デモユーザー設定: {user.username} (ID: {user.id})")
                # print(f"DEBUG: self.current_user = {self.current_user}")
            else:
                print("警告: デモユーザー（ID: 3）が見つかりません")
            session.close()
        except Exception as e:
            print(f"デモユーザー設定エラー: {e}")
            # import traceback
            # traceback.print_exc()
    
    def search(self, query: str, context: str = "") -> Dict[str, Any]:
        try:
            if not self.vector_store_manager.vector_store_id:
                return {
                    "success": False,
                    "error": "Vector Storeが設定されていません。先にsetup_search_system()を実行してください。"
                }
            
            full_query = f"{context}\n\n質問: {query}" if context else query
            
            # Function callingツールを取得
            function_tools = get_function_tools()
            
            # ツールリストを作成
            tools = [{
                "type": "file_search",
                "vector_store_ids": [self.vector_store_manager.vector_store_id]
            }]
            tools.extend(function_tools)
            
            # Responses APIを使用
            response = self.client.responses.create(
                model=DEFAULT_MODEL,
                input=full_query,
                instructions="""あなたは健康データ管理システムのAIアシスタントです。

以下の点に注意して回答してください：
1. 提供されたデータベース情報を元に正確な情報を提供する
2. 日本語で自然な回答をする
3. データが見つからない場合は、その旨を明確に伝える
4. 数値データについては具体的な値を示す
5. 関連するデータがある場合は、それも含めて説明する

ユーザーの質問に対して、以下の判断基準に従って行動してください：
- 検索のみが必要な場合: file_search機能を使用
- データの追加・更新・削除が必要な場合: 適切なfunction callingツールを使用

特に目標の設定や更新、バイタルデータの登録が求められた場合は、必ず対応するfunction callingツールを使用してください。""",
                tools=tools
            )
            
            result = {
                "success": False,
                "response": "",
                "sources": [],
                "response_id": response.id,
                "function_calls": []
            }
            
            # Function callingの結果を処理
            function_results = self._process_function_calls(response)
            result["function_calls"] = function_results
            
            if hasattr(response, 'output') and response.output:
                # レスポンスからテキスト内容を取得
                if hasattr(response.output, 'content') and response.output.content:
                    for content in response.output.content:
                        if content.type == "text":
                            result["response"] = content.text.value
                            result["success"] = True
                            
                            # annotationsから参照元情報を取得
                            if hasattr(content.text, 'annotations'):
                                for annotation in content.text.annotations:
                                    if hasattr(annotation, 'file_citation'):
                                        result["sources"].append({
                                            "type": "file_citation",
                                            "file_id": annotation.file_citation.file_id
                                        })
                            break
                elif hasattr(response.output, 'text'):
                    result["response"] = response.output.text
                    result["success"] = True
                else:
                    result["response"] = str(response.output)
                    result["success"] = True
            else:
                result["error"] = "レスポンスからの出力の取得に失敗しました"
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": f"検索エラー: {str(e)}"
            }
    
    def _process_function_calls(self, response) -> List[Dict[str, Any]]:
        """Function callingの結果を処理"""
        function_results = []
        
        try:
            # レスポンスからtool callsを取得
            if hasattr(response, 'output') and response.output:
                # response.outputがlist型の場合の処理
                if isinstance(response.output, list):
                    for item in response.output:
                        if hasattr(item, 'type') and item.type == 'function_call':
                            tool_name = item.name
                            tool_args = json.loads(item.arguments)
                            
                            # print(f"DEBUG: Executing tool: {tool_name} with args: {tool_args}")
                            
                            # Tool callingを実行
                            result = asyncio.run(self._execute_function_call(tool_name, tool_args))
                            
                            # print(f"DEBUG: Tool execution result: {result}")
                            
                            function_results.append({
                                "function_name": tool_name,
                                "arguments": tool_args,
                                "result": result
                            })
                
                # 従来の構造（contentを持つ場合）の処理も維持
                elif hasattr(response.output, 'content') and response.output.content:
                    for content in response.output.content:
                        if content.type == "tool_call":
                            tool_name = content.tool_call.name
                            tool_args = json.loads(content.tool_call.arguments)
                            
                            # print(f"DEBUG: Executing tool: {tool_name} with args: {tool_args}")
                            
                            # Tool callingを実行
                            result = asyncio.run(self._execute_function_call(tool_name, tool_args))
                            
                            # print(f"DEBUG: Tool execution result: {result}")
                            
                            function_results.append({
                                "function_name": tool_name,
                                "arguments": tool_args,
                                "result": result
                            })
            
            # print(f"DEBUG: Total function calls processed: {len(function_calls)}")
                            
        except Exception as e:
            print(f"Function calling処理エラー: {e}")
            # import traceback
            # traceback.print_exc()
            function_results.append({
                "error": f"Function calling処理エラー: {str(e)}"
            })
        
        return function_results
    
    async def _execute_function_call(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Function callingを実行"""
        try:
            # print(f"DEBUG: current_user = {self.current_user}")
            if not self.current_user:
                # ユーザーが設定されていない場合、再度設定を試す
                # print("DEBUG: current_userがNone, 再設定を試します")
                self._set_demo_user()
                # print(f"DEBUG: 再設定後のcurrent_user = {self.current_user}")
                
                if not self.current_user:
                    return {
                        "success": False,
                        "error": "ユーザーが設定されていません"
                    }
            
            # データベースセッションを取得
            from settings import get_db
            session = next(get_db())
            
            try:
                # InternalAPIServiceを初期化
                api_service = InternalAPIService(session, self.current_user)
                
                # Function callingを実行
                if function_name == "create_objective":
                    return await api_service.create_objective(
                        data_name=arguments["data_name"],
                        start_date=arguments["start_date"],
                        end_date=arguments["end_date"],
                        objective_value=arguments["objective_value"]
                    )
                elif function_name == "get_objectives":
                    return await api_service.get_objectives()
                elif function_name == "update_objective":
                    return await api_service.update_objective(
                        objective_id=arguments["objective_id"],
                        objective_value=arguments["objective_value"]
                    )
                elif function_name == "delete_objective":
                    return await api_service.delete_objective(
                        objective_id=arguments["objective_id"]
                    )
                elif function_name == "register_vital_data":
                    return await api_service.register_vital_data(
                        data_name=arguments["data_name"],
                        value=arguments["value"],
                        date=arguments.get("date")
                    )
                elif function_name == "get_vital_data":
                    return await api_service.get_vital_data(
                        data_name=arguments.get("data_name"),
                        limit=arguments.get("limit", 10)
                    )
                else:
                    return {
                        "success": False,
                        "error": f"未知のfunction: {function_name}"
                    }
                    
            finally:
                session.close()
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Function calling実行エラー: {str(e)}"
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