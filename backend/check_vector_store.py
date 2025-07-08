#!/usr/bin/env python3
"""
OpenAI Vector Store内容確認ツール

Vector Storeに格納されているファイルとその内容を確認します。
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI

# .envファイルを読み込み
load_dotenv()


class VectorStoreChecker:
    """Vector Storeの内容を確認するクラス"""
    
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
    
    def list_vector_stores(self) -> List[Dict[str, Any]]:
        """利用可能なVector Storeの一覧を取得"""
        try:
            vector_stores = self.client.vector_stores.list()
            stores = []
            for store in vector_stores.data:
                stores.append({
                    'id': store.id,
                    'name': store.name,
                    'file_counts': getattr(store, 'file_counts', {}),
                    'created_at': store.created_at,
                    'status': getattr(store, 'status', 'unknown')
                })
            return stores
        except Exception as e:
            print(f"❌ Vector Store一覧取得エラー: {e}")
            return []
    
    def get_vector_store_files(self, vector_store_id: str) -> List[Dict[str, Any]]:
        """指定されたVector Store内のファイル一覧を取得"""
        try:
            files = self.client.vector_stores.files.list(vector_store_id=vector_store_id)
            file_list = []
            for file in files.data:
                file_list.append({
                    'id': file.id,
                    'created_at': file.created_at,
                    'status': file.status,
                    'usage_bytes': getattr(file, 'usage_bytes', 0)
                })
            return file_list
        except Exception as e:
            print(f"❌ ファイル一覧取得エラー: {e}")
            return []
    
    def get_file_info(self, file_id: str) -> str:
        """ファイルの基本情報を取得"""
        try:
            file_info = self.client.files.retrieve(file_id)
            info = f"ファイル名: {file_info.filename}\n"
            info += f"用途: {file_info.purpose}\n"
            info += f"サイズ: {file_info.bytes} bytes\n"
            info += f"作成日時: {file_info.created_at}"
            return info
        except Exception as e:
            return f"❌ ファイル情報取得エラー: {e}"
    
    def search_sample(self, vector_store_id: str, query: str = "健康データの概要を教えて") -> str:
        """Vector Storeでサンプル検索を実行"""
        try:
            assistant = self.client.beta.assistants.create(
                name="Vector Store Test Assistant",
                instructions="提供されたデータの概要を簡潔に説明してください。",
                model="gpt-4o-mini",
                tools=[{"type": "file_search"}],
                tool_resources={
                    "file_search": {
                        "vector_store_ids": [vector_store_id]
                    }
                }
            )
            
            thread = self.client.beta.threads.create()
            
            self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=query
            )
            
            run = self.client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                assistant_id=assistant.id
            )
            
            result = "検索結果なし"
            if run.status == "completed":
                messages = self.client.beta.threads.messages.list(thread_id=thread.id)
                for message in messages.data:
                    if message.role == "assistant":
                        for content in message.content:
                            if content.type == "text":
                                result = content.text.value
                                break
                        break
            
            # クリーンアップ
            self.client.beta.assistants.delete(assistant.id)
            
            return result
            
        except Exception as e:
            return f"❌ 検索エラー: {e}"


def main():
    # OpenAI API Key確認
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY環境変数が設定されていません")
        return
    
    checker = VectorStoreChecker(api_key)
    
    print("🔍 OpenAI Vector Store内容確認ツール")
    print("=" * 50)
    
    # Vector Store一覧を表示
    print("\n📚 利用可能なVector Store:")
    stores = checker.list_vector_stores()
    
    if not stores:
        print("Vector Storeが見つかりません")
        return
    
    for i, store in enumerate(stores, 1):
        print(f"\n{i}. {store['name']} (ID: {store['id']})")
        print(f"   作成日時: {store['created_at']}")
        print(f"   ファイル数: {store['file_counts']}")
        print(f"   ステータス: {store['status']}")
    
    # 健康データのVector Storeを探す
    health_store = None
    for store in stores:
        if 'health' in store['name'].lower():
            health_store = store
            break
    
    if not health_store:
        print("\n⚠️  健康データのVector Storeが見つかりません")
        return
    
    print(f"\n🎯 '{health_store['name']}'の詳細情報:")
    print("-" * 40)
    
    # ファイル一覧を取得
    files = checker.get_vector_store_files(health_store['id'])
    print(f"📄 格納ファイル数: {len(files)}")
    
    if files:
        print(f"\n最初の5ファイルの詳細:")
        for i, file in enumerate(files[:5], 1):
            print(f"\n{i}. ファイルID: {file['id']}")
            print(f"   作成日時: {file['created_at']}")
            print(f"   ステータス: {file['status']}")
            print(f"   サイズ: {file['usage_bytes']} bytes")
            
            # ファイル情報を表示
            print("   ファイル情報:")
            file_info = checker.get_file_info(file['id'])
            print("   " + "\n   ".join(file_info.split('\n')))
    
    # サンプル検索を実行
    print(f"\n🔍 サンプル検索実行:")
    print("-" * 40)
    search_result = checker.search_sample(health_store['id'])
    print(search_result)


if __name__ == "__main__":
    main()