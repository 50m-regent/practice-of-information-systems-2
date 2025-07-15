# settings.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .envファイルを読み込む
load_dotenv()

DATABASE_URL = "sqlite:///./test.db"  # プロジェクトルート直下

# Alembic でも使う engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # ログを出すなら True
)

# アプリケーション用セッション
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# すべてのモデルがこれを継承する
Base = declarative_base()


# FastAPI の Depends() で使う
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SQLAlchemyのリレーションシップ解決のため、全てのモデルをインポート
def setup_models():
    """全てのモデルをインポートしてリレーションシップを解決する"""
    try:
        from models.users import User
        from models.vitaldata import VitalData
        from models.vitaldataname import VitalDataName
        from models.objective import Objective
        from models.otpcodes import OTPCode
        from models.uservitalcategory import UserVitalCategory
        from models.chat_conversation import ChatConversation, ChatMessage
        return True
    except Exception as e:
        print(f"モデルのインポートでエラーが発生しました: {e}")
        return False

# アプリケーション起動時にモデルを設定
setup_models()