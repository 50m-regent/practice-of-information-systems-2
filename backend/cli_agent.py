#!/usr/bin/env python3
"""
健康データ管理システム CLIエージェント

このモジュールは、ユーザーがCLI経由でAIエージェントと対話できる
インターフェースを提供します。
"""

import os
import sys
from typing import Optional
from dotenv import load_dotenv
from search_manager import SearchManager
from config import MESSAGES, WELCOME_BANNER, HELP_TEXT, SUGGESTION_QUERIES

# .envファイルを読み込み
load_dotenv()


class CLIAgent:
    """
    CLIベースのAIエージェントインターフェース
    
    ユーザーからの自然言語での質問を受け付け、
    健康データベースから関連情報を検索して回答を提供します。
    """
    def __init__(self):
        self.search_manager: Optional[SearchManager] = None
        self.is_initialized = False
        
    def initialize(self, api_key: str) -> bool:
        """
        AIエージェントシステムを初期化
        
        Args:
            api_key (str): OpenAI APIキー
            
        Returns:
            bool: 初期化が成功した場合True
        """
        try:
            print(MESSAGES["SYSTEM_INIT"])
            self.search_manager = SearchManager(api_key)
            
            print(MESSAGES["DATA_UPLOAD"])
            success = self.search_manager.setup_search_system()
            
            if success:
                self.is_initialized = True
                print(MESSAGES["INIT_COMPLETE"])
                return True
            else:
                print(MESSAGES["INIT_FAILED"])
                return False
                
        except Exception as e:
            print(f"{MESSAGES['ERROR_PREFIX']} 初期化エラー: {e}")
            return False
    
    def show_welcome_message(self) -> None:
        """ウェルカムメッセージを表示"""
        print(WELCOME_BANNER)
    
    def show_help(self) -> None:
        """ヘルプメッセージを表示"""
        print(HELP_TEXT)
    
    def show_suggestions(self) -> None:
        """質問例を表示"""
        print("\n💡 質問例:")
        print("-" * 40)
        for i, suggestion in enumerate(SUGGESTION_QUERIES, 1):
            print(f"{i}. {suggestion}")
        print("-" * 40)
    
    def process_query(self, query: str) -> None:
        if not self.is_initialized or not self.search_manager:
            print("❌ システムが初期化されていません")
            return
        
        print(f"\n🔍 検索中: {query}")
        print("-" * 40)
        
        try:
            context = self.search_manager.get_conversation_context(query)
            result = self.search_manager.search(query, context)
            
            if result["success"]:
                print("🤖 AI応答:")
                print(result["response"])
                
                if result.get("sources"):
                    print(f"\n📄 参照したファイル数: {len(result['sources'])}")
            else:
                print(f"❌ 検索エラー: {result.get('error', '不明なエラー')}")
                
        except Exception as e:
            print(f"❌ 処理エラー: {e}")
        
        print("-" * 40)
    
    def run(self):
        # OpenAI API Key の確認
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("❌ OPENAI_API_KEY環境変数が設定されていません")
            print("以下のいずれかの方法でAPIキーを設定してください:")
            print("1. .envファイルを作成: cp .env.example .env")
            print("   その後、.envファイル内のOPENAI_API_KEYを設定")
            print("2. 環境変数で設定: export OPENAI_API_KEY='your-api-key-here'")
            return
        
        # システム初期化
        if not self.initialize(api_key):
            print("システムの初期化に失敗しました。終了します。")
            return
        
        # ウェルカムメッセージ
        self.show_welcome_message()
        
        # メインループ
        try:
            while True:
                try:
                    user_input = input("\n💬 質問を入力してください: ").strip()
                    
                    if not user_input:
                        continue
                    
                    # コマンド処理
                    if user_input.lower() in ['quit', 'exit', 'q']:
                        print("👋 システムを終了します")
                        break
                    elif user_input.lower() == 'help':
                        self.show_help()
                    elif user_input.lower() == 'clear':
                        os.system('clear' if os.name == 'posix' else 'cls')
                        self.show_welcome_message()
                    elif user_input.lower() == 'suggestions':
                        self.show_suggestions()
                    else:
                        # AI検索処理
                        self.process_query(user_input)
                
                except KeyboardInterrupt:
                    print("\n\n👋 システムを終了します")
                    break
                except EOFError:
                    print("\n\n👋 システムを終了します")
                    break
                    
        finally:
            # クリーンアップ
            if self.search_manager:
                print("🧹 リソースをクリーンアップしています...")
                # Vector Storeは保持する（削除しない）
                # self.search_manager.cleanup()


def main():
    agent = CLIAgent()
    agent.run()


if __name__ == "__main__":
    main()