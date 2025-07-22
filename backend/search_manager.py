from typing import List, Dict, Any, Optional
import json
import asyncio
import httpx
from openai import OpenAI
from vector_store_manager import VectorStoreManager
from config import DEFAULT_MODEL, DEFAULT_VECTOR_STORE_NAME, MESSAGES
from function_tools import get_function_tools
from database_manager import DatabaseManager


class SearchManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.vector_store_manager = VectorStoreManager(api_key)
        self.database_manager = DatabaseManager()
        self.current_user = None  # 現在のユーザー（デモ用）
        self.fastapi_base_url = "http://localhost:8000"  # FastAPIサーバーのURL
        self.demo_token = None  # デモ用のアクセストークン
    
    def setup_search_system(self, vector_store_name: str = DEFAULT_VECTOR_STORE_NAME) -> bool:
        try:
            self.vector_store_manager.create_or_get_vector_store(vector_store_name)
            
            if not self.vector_store_manager.vector_store_id:
                print(f"{MESSAGES['ERROR_PREFIX']} Vector Store IDが設定されていません")
                return False
            
            # 既存のVector Storeを使用（アップロードスキップ）
            if self.vector_store_manager.vector_store_id:
                print("✅ 既存のVector Storeを使用します（データアップロードをスキップ）")
                success = True
            else:
                success = self.vector_store_manager.upload_database_to_vector_store()
            print(MESSAGES['INIT_COMPLETE'] if success else MESSAGES['INIT_FAILED'])
            
            # デモ用のユーザーを設定（実際の運用では認証システムが必要）
            self._set_demo_user()
            self._set_demo_auth()
            
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

    def _set_demo_auth(self):
        """デモ用の認証トークンを設定"""
        try:
            if not self.current_user:
                print("警告: ユーザーが設定されていないため、認証トークンを設定できません")
                return
                
            # 簡易的なデモトークン（実際の運用では適切な認証システムを使用）
            self.demo_token = f"demo_token_user_{self.current_user.id}"
            print(f"デモ認証トークン設定: {self.demo_token}")
            
        except Exception as e:
            print(f"デモ認証設定エラー: {e}")
    
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
        """Function callingを実行（FastAPI経由）"""
        try:
            if not self.current_user or not self.demo_token:
                # ユーザーが設定されていない場合、再度設定を試す
                self._set_demo_user()
                self._set_demo_auth()
                
                if not self.current_user or not self.demo_token:
                    return {
                        "success": False,
                        "error": "ユーザーまたは認証トークンが設定されていません"
                    }
            
            # HTTPクライアントを使用してFastAPIエンドポイントに送信
            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {self.demo_token}"}
                
                # Function callingに応じてエンドポイントとデータを設定
                if function_name == "create_objective":
                    url = f"{self.fastapi_base_url}/objectives/"
                    # 日付を適切なISO形式に変換
                    start_date = arguments["start_date"]
                    end_date = arguments["end_date"]
                    if not start_date.endswith("T00:00:00"):
                        start_date += "T00:00:00"
                    if not end_date.endswith("T00:00:00"):
                        end_date += "T00:00:00"
                        
                    data = {
                        "data_name": arguments["data_name"],
                        "start_date": start_date,
                        "end_date": end_date,
                        "objective_value": arguments["objective_value"]
                    }
                    print(f"🔍 DEBUG: 目標作成リクエスト")
                    print(f"  URL: {url}")
                    print(f"  データ: {data}")
                    print(f"  ヘッダー: {headers}")
                    
                    response = await client.put(url, json=data, headers=headers)
                    
                    print(f"🔍 DEBUG: 目標作成レスポンス")
                    print(f"  ステータス: {response.status_code}")
                    print(f"  テキスト: '{response.text}'")
                    
                elif function_name == "get_objectives":
                    url = f"{self.fastapi_base_url}/objectives/"
                    print(f"🔍 DEBUG: 目標一覧取得リクエスト")
                    print(f"  URL: {url}")
                    print(f"  ヘッダー: {headers}")
                    
                    response = await client.get(url, headers=headers)
                    
                    print(f"🔍 DEBUG: 目標一覧取得レスポンス")
                    print(f"  ステータス: {response.status_code}")
                    print(f"  テキスト: '{response.text[:200]}...' (最初の200文字)")
                    
                    
                elif function_name == "update_objective":
                    objective_id = arguments["objective_id"]
                    url = f"{self.fastapi_base_url}/objectives/{objective_id}/"
                    data = {
                        "objective_value": arguments["objective_value"]
                    }
                    response = await client.put(url, json=data, headers=headers)
                    
                elif function_name == "delete_objective":
                    objective_id = arguments["objective_id"]
                    url = f"{self.fastapi_base_url}/objectives/{objective_id}/"
                    response = await client.delete(url, headers=headers)
                    
                elif function_name == "register_vital_data":
                    url = f"{self.fastapi_base_url}/vitaldata/register/"
                    
                    # data_nameからname_idを取得する必要があるため、まずVitalDataNameを検索
                    data_name = arguments["data_name"]
                    from settings import get_db
                    from models.vitaldataname import VitalDataName
                    session = next(get_db())
                    try:
                        data_name_obj = session.query(VitalDataName).filter(
                            VitalDataName.name == data_name
                        ).first()
                        if not data_name_obj:
                            return {
                                "success": False,
                                "error": f"データ名 '{data_name}' が見つかりません"
                            }
                        name_id = data_name_obj.id
                    finally:
                        session.close()
                    
                    data = {
                        "name_id": name_id,
                        "value": arguments["value"],
                        "date": arguments.get("date")
                    }
                    response = await client.post(url, json=data, headers=headers)
                    
                elif function_name == "get_vital_data":
                    url = f"{self.fastapi_base_url}/vitaldata/me/"
                    response = await client.get(url, headers=headers)
                    
                else:
                    return {
                        "success": False,
                        "error": f"未知のfunction: {function_name}"
                    }
                
                # レスポンス処理
                if response.status_code == 200:
                    result_data = response.json()
                    
                    # function_nameに応じてレスポンス形式を統一
                    if function_name == "get_objectives":
                        return {
                            "success": True,
                            "objectives": result_data,
                            "message": f"{len(result_data)}個の目標が見つかりました"
                        }
                    elif function_name == "get_vital_data":
                        return {
                            "success": True,
                            "data": result_data,
                            "message": f"{len(result_data)}件のデータが見つかりました"
                        }
                    else:
                        return {
                            "success": True,
                            "message": result_data.get("message", "操作が完了しました")
                        }
                else:
                    print(f"❌ DEBUG: APIエラー詳細")
                    print(f"  ステータスコード: {response.status_code}")
                    print(f"  レスポンスヘッダー: {dict(response.headers)}")
                    print(f"  レスポンステキスト: '{response.text}'")
                    
                    try:
                        error_detail = response.json().get("detail", "不明なエラー")
                        print(f"  JSONエラー詳細: {error_detail}")
                    except Exception as json_err:
                        error_detail = response.text
                        print(f"  JSON解析エラー: {json_err}")
                    
                    return {
                        "success": False,
                        "error": f"API呼び出しエラー（{response.status_code}）: {error_detail}"
                    }
                    
        except Exception as e:
            print(f"❌ DEBUG: Function calling例外")
            print(f"  例外タイプ: {type(e).__name__}")
            print(f"  例外メッセージ: {str(e)}")
            import traceback
            print(f"  スタックトレース:")
            traceback.print_exc()
            
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