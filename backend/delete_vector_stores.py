#!/usr/bin/env python3
"""
OpenAI Vector Store削除ツール

既存のVector Storeを全て削除します。
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI

# .envファイルを読み込み
load_dotenv()


class VectorStoreDeleter:
    """Vector Storeを削除するクラス"""
    
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
    
    def delete_vector_store(self, vector_store_id: str, name: str) -> bool:
        """指定されたVector Storeを削除"""
        try:
            self.client.vector_stores.delete(vector_store_id)
            print(f"✅ Vector Store '{name}' (ID: {vector_store_id}) を削除しました")
            return True
        except Exception as e:
            print(f"❌ Vector Store '{name}' (ID: {vector_store_id}) の削除に失敗: {e}")
            return False
    
    def delete_all_vector_stores(self) -> None:
        """全てのVector Storeを削除"""
        stores = self.list_vector_stores()
        
        if not stores:
            print("削除するVector Storeがありません")
            return
        
        print(f"🗑️ {len(stores)}個のVector Storeを削除します...\n")
        
        success_count = 0
        for store in stores:
            if self.delete_vector_store(store['id'], store['name']):
                success_count += 1
        
        print(f"\n📊 削除結果: {success_count}/{len(stores)} 個のVector Storeを削除しました")
    
    def delete_health_data_store_only(self) -> None:
        """health_data_storeのみを削除"""
        stores = self.list_vector_stores()
        
        health_stores = [store for store in stores if 'health' in store['name'].lower()]
        
        if not health_stores:
            print("health_data_storeが見つかりません")
            return
        
        for store in health_stores:
            self.delete_vector_store(store['id'], store['name'])


def main():
    # OpenAI API Key確認
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY環境変数が設定されていません")
        return
    
    deleter = VectorStoreDeleter(api_key)
    
    print("🗑️ OpenAI Vector Store削除ツール")
    print("=" * 50)
    
    # 現在のVector Store一覧を表示
    stores = deleter.list_vector_stores()
    
    if not stores:
        print("削除するVector Storeがありません")
        return
    
    print(f"\n📚 現在のVector Store ({len(stores)}個):")
    for i, store in enumerate(stores, 1):
        print(f"{i}. {store['name']} (ID: {store['id']})")
        if hasattr(store['file_counts'], '__dict__'):
            print(f"   ファイル数: {store['file_counts']}")
        print(f"   ステータス: {store['status']}")
    
    # 削除オプション選択
    print("\n削除オプションを選択してください:")
    print("1. health_data_storeのみ削除")
    print("2. 全てのVector Storeを削除") 
    print("3. キャンセル")
    
    try:
        choice = input("\n選択 (1-3): ").strip()
        
        if choice == "1":
            print("\n🎯 health_data_storeを削除します...")
            deleter.delete_health_data_store_only()
        elif choice == "2":
            print("\n⚠️ 全てのVector Storeを削除します...")
            confirm = input("本当に削除しますか？ (yes/no): ").strip().lower()
            if confirm in ['yes', 'y']:
                deleter.delete_all_vector_stores()
            else:
                print("削除をキャンセルしました")
        elif choice == "3":
            print("削除をキャンセルしました")
        else:
            print("無効な選択です")
            
    except KeyboardInterrupt:
        print("\n\n削除をキャンセルしました")


if __name__ == "__main__":
    main()