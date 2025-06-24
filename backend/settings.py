# settings.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./db.sqlite3"  # プロジェクトルート直下

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
