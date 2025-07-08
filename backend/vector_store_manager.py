"""
OpenAI Vector Store管理モジュール

このモジュールは、OpenAI Vector Storeの作成、データアップロード、
検索機能を提供します。
"""

import os
import tempfile
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from database_manager import DatabaseManager
from config import DEFAULT_VECTOR_STORE_NAME, VECTOR_STORE_EXPIRES_DAYS, DEFAULT_MODEL, MESSAGES


class VectorStoreManager:
    """
    OpenAI Vector Storeを管理するクラス
    
    データベースのデータをVector Storeにアップロードし、
    AI検索システムで利用可能にする機能を提供します。
    """
    def __init__(self, api_key: str) -> None:
        """
        Vector Storeマネージャを初期化
        
        Args:
            api_key (str): OpenAI APIキー
        """
        self.client = OpenAI(api_key=api_key)
        self.vector_store_id: Optional[str] = None
    
    def create_or_get_vector_store(self, name: str = DEFAULT_VECTOR_STORE_NAME) -> str:
        """
        Vector Storeを作成または既存のものを取得
        
        同名のVector Storeが既に存在する場合はそれを使用し、
        ない場合は新しく作成します。
        
        Args:
            name (str): Vector Store名（デフォルト: "health_data_store"）
            
        Returns:
            str: Vector StoreのID
            
        Raises:
            Exception: Vector Storeの作成または取得に失敗した場合
        """
        try:
            # 既存のVector Storeを検索
            vector_stores = self.client.vector_stores.list()
            
            for store in vector_stores.data:
                if store.name == name:
                    self.vector_store_id = store.id
                    print(f"{MESSAGES['SUCCESS_PREFIX']} 既存のVector Store '{name}' (ID: {store.id}) を使用します")
                    return store.id
            
            # 新しいVector Storeを作成
            vector_store = self.client.vector_stores.create(
                name=name,
                expires_after={
                    "anchor": "last_active_at",
                    "days": VECTOR_STORE_EXPIRES_DAYS
                }
            )
            
            self.vector_store_id = vector_store.id
            print(f"{MESSAGES['SUCCESS_PREFIX']} 新しいVector Store '{name}' (ID: {vector_store.id}) を作成しました")
            return vector_store.id
            
        except Exception as e:
            print(f"{MESSAGES['ERROR_PREFIX']} Vector Store作成エラー: {e}")
            raise
    
    def upload_database_to_vector_store(self) -> bool:
        """
        データベースのデータをVector Storeにアップロード
        
        Returns:
            bool: アップロードが成功した場合True
        """
        temp_files = []
        
        try:
            if not self.vector_store_id:
                print(f"{MESSAGES['ERROR_PREFIX']} Vector Store IDが設定されていません")
                return False
            
            # データベースからデータを取得
            with DatabaseManager() as db:
                data = db.get_all_data_for_vectorization()
            
            if not data:
                print(f"{MESSAGES['WARNING_PREFIX']} データベースにデータがありません")
                return False
            
            print(f"📄 {len(data)}件のデータをアップロード準備中...")
            
            # 一時ファイルを作成
            for item in data:
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                        content = f"# {item['type'].upper()} ID: {item['id']}\n\n{item['content']}\n\nメタデータ:\n{json.dumps(item['metadata'], ensure_ascii=False, indent=2)}"
                        f.write(content)
                        temp_files.append(f.name)
                except Exception as e:
                    print(f"{MESSAGES['WARNING_PREFIX']} ファイル作成エラー (ID: {item.get('id', 'unknown')}): {e}")
                    continue
            
            if not temp_files:
                print(f"{MESSAGES['ERROR_PREFIX']} アップロード可能なファイルがありません")
                return False
            
            # Vector Storeにアップロード
            file_handles = []
            try:
                for file_path in temp_files:
                    file_handles.append(open(file_path, 'rb'))
                
                file_batch = self.client.vector_stores.file_batches.upload_and_poll(
                    vector_store_id=self.vector_store_id,
                    files=file_handles
                )
                
                print(f"{MESSAGES['SUCCESS_PREFIX']} ファイルバッチのアップロード完了: {file_batch.status}")
                print(f"📊 ファイル数: {file_batch.file_counts}")
                
                return file_batch.status == "completed"
                
            finally:
                # ファイルハンドルをクローズ
                for file_handle in file_handles:
                    try:
                        file_handle.close()
                    except Exception:
                        pass
            
        except Exception as e:
            print(f"{MESSAGES['ERROR_PREFIX']} データアップロードエラー: {e}")
            return False
            
        finally:
            # 一時ファイルをクリーンアップ
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except Exception as e:
                    print(f"{MESSAGES['WARNING_PREFIX']} 一時ファイル削除エラー ({temp_file}): {e}")
    
    def search_vector_store(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            if not self.vector_store_id:
                raise ValueError("Vector Storeが設定されていません")
            
            # Responses APIを使用
            response = self.client.responses.create(
                model=DEFAULT_MODEL,
                input=query,
                instructions="あなたは健康データの検索アシスタントです。提供されたデータから関連する情報を見つけて、日本語で回答してください。",
                tools=[{
                    "type": "file_search",
                    "vector_store_ids": [self.vector_store_id]
                }]
            )
            
            result = []
            if hasattr(response, 'output') and response.output:
                if hasattr(response.output, 'content') and response.output.content:
                    for content in response.output.content:
                        if content.type == "text":
                            result.append({
                                "content": content.text.value,
                                "annotations": getattr(content.text, 'annotations', [])
                            })
                elif hasattr(response.output, 'text'):
                    result.append({
                        "content": response.output.text,
                        "annotations": []
                    })
                else:
                    result.append({
                        "content": str(response.output),
                        "annotations": []
                    })
            
            return result
                
        except Exception as e:
            print(f"検索エラー: {e}")
            return []
    
    def delete_vector_store(self):
        if self.vector_store_id:
            try:
                self.client.vector_stores.delete(self.vector_store_id)
                print(f"Vector Store (ID: {self.vector_store_id}) を削除しました")
            except Exception as e:
                print(f"Vector Store削除エラー: {e}")
    
    def list_vector_stores(self):
        try:
            vector_stores = self.client.vector_stores.list()
            print("利用可能なVector Stores:")
            for store in vector_stores.data:
                print(f"- {store.name} (ID: {store.id})")
        except Exception as e:
            print(f"Vector Store一覧取得エラー: {e}")