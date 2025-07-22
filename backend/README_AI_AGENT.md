# 健康データ管理AIエージェントシステム

## 概要
SQLiteデータベースからデータを取得し、OpenAIのVector Storeに保存して、AIエージェントと対話できるシステムです。

## 機能
- SQLiteデータベースからユーザー、バイタルデータ、目標データを取得
- OpenAI Vector Storeへのデータアップロード
- 自然言語による健康データの検索・質問応答
- CLIベースの対話インターフェース

## セットアップ

### 1. 環境変数の設定
OpenAI API Keyを設定してください：

**方法1: .envファイルを使用（推奨）**
```bash
# .env.exampleをコピー
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# OPENAI_API_KEY=your-openai-api-key-here
```

**方法2: 環境変数で直接設定**
```bash
export OPENAI_API_KEY='your-openai-api-key-here'
```

### 2. データベースの準備
マイグレーションとダミーデータの追加：

```bash
# テーブル作成
uv run alembic upgrade head

# ダミーデータ追加（既に実行済みの場合は不要）
uv run add_dummy_data.py
```

### 3. システム起動
```bash
uv run cli_agent.py
```

## 使用方法

### 基本コマンド
- `help` - ヘルプを表示
- `suggestions` - 質問例を表示
- `clear` - 画面をクリア
- `quit` または `exit` - システム終了

### 質問例
- 「登録されているユーザー一覧を教えて」
- 「田中太郎の最新のバイタルデータを見せて」
- 「体重の目標を設定しているユーザーは？」
- 「公開されているデータを一覧で見せて」
- 「最近の歩数データの傾向は？」
- 「睡眠時間の平均値は？」

## システム構成

### ファイル構成
- `cli_agent.py` - メインのCLIインターフェース
- `search_manager.py` - 検索機能管理
- `vector_store_manager.py` - Vector Store管理
- `database_manager.py` - データベースアクセス
- `add_dummy_data.py` - ダミーデータ生成
- `models/` - SQLAlchemyモデル定義

### データベーステーブル
- `users` - ユーザー情報
- `vitaldataname` - バイタルデータ項目名
- `vitaldata` - バイタルデータ実測値
- `objective` - 目標設定
- `otpcodes` - OTP認証コード

## 追加されたダミーデータ
- ユーザー4名（田中太郎、鈴木花子、山田一郎、佐藤由紀）
- バイタルデータ項目10種類（体重、身長、血圧、心拍数など）
- 30日分のバイタルデータ（380件）
- 目標設定4件
- OTPコード2件

## 注意事項
- OpenAI API Keyが必要です（.envファイルまたは環境変数で設定）
- 初回起動時にVector Storeの作成とデータアップロードが行われます
- Vector Storeは7日間のアクセスがない場合自動削除されます
- .envファイルは機密情報を含むため、gitにコミットしないでください