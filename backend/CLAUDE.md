思考や推論は英語で行い、ユーザへの出力は日本語で行って下さい。
分からないことがあれば、必ず一旦作業を止め、その旨をユーザに伝えてくだい。

# ライブラリの利用について
現在、uvの仮想環境上で作業を行っています。
uv add <package_name>でライブラリの追加を行ってください。
プログラムの実行は、uv run <filename>で行って下さい。 

# 概要
SQLiteで構築したデータベースの内容を取得して、それをOpenAIのVector Storeに保存し、Responses APIを使用して検索結果を取得するようにしてほしいです。
ORMとしてはSQL Alchemyを使用し、SQLiteのデータベースを操作します。
Vector StoreとResponses APIはOpenAIのAPIを使用します。ドキュメントとして下記のURLを適宜必ず参照してください。

今から行ってほしい作業内容として、
1. 上記の概要を満たし、CLIベースでエージェントと対話できるエージェントシステムの構築
2. 各データベースへの適当なダミーデータの追加

を順番に行ってほしいです。まずは1のタスクを完了させてください。

# ドキュメント
- Vector Stores
  - https://platform.openai.com/docs/api-reference/vector-stores
- Responses API
  - https://platform.openai.com/docs/api-reference/introduction

# テーブル定義
## User
| 物理名           | 型           | 論理名        | キー      |
|---------------|-------------|------------|---------|
| id            | Int         | id         | PRIMARY |
| email         | String      | メールアドレス    |         |
| username      | String      | ネーム        |         |
| date_of_birth | Datetime    | 生年月日       |         |
| sex           | Bool        | 性別         |         |
| friends       | List[Int]   | 友人のidリスト   |         |
| objective     | List[Int]   | 目標のIDのリスト  |         |
| icon          | LargeBinary | アイコン画像のデータ |         |
| height        | Float       | 身長         |         |

## OtpCodes
| 物理名        | 型        | 論理名             | キー               |
|------------|----------|-----------------|------------------|
| id         | Int      | ユーザid           | PRIMARY, FOREIGN |
| otp_code   | String   | 送信されたワンタイムパスワード |                  |
| expires_at | Datetime | 有効期限            |                  |
| is_used    | Bool     | 使用済みフラグ         |                  |

## VitalData
| 物理名     | 型        | 論理名                | キー      |
|---------|----------|--------------------|---------|
| id      | Int      | 1回のデータ登録に対するid     | PRIMARY |
| user_id | Int      | ユーザid              | FOREIGN |
| date    | Datetime | 登録時刻               |         |
| name_id | Int      | VitalDataNameの属性id | FOREIGN |
| value   | Float    | 属性の値               |         |

## VitalDataName
| 物理名  | 型      | 論理名        | キー      |
|------|--------|------------|---------|
| id   | Int    | データ名に対するid | PRIMARY |
| name | String | データ名（血圧）とか |         |

## UserVitalCategory
| 物理名             | 型    | 論理名                                  | キー      |
|-----------------|------|--------------------------------------|---------|
| id              | Int  | vitalnameとuserの関係id                  | PRIMARY |
| user_id         | Int  | ユーザid                                | FOREIGN |
| vital_id        | Int  | VitalNameのid                         | FOREIGN |
| is_public       | Bool | 公開してよいか                              |         |
| is_accumulating | Bool | 蓄積させるか（いったんUserごとに変えられるようになってるけど許して） |         |

## Objective
| 物理名        | 型        | 論理名                | キー      |
|------------|----------|--------------------|---------|
| id         | Int      | 目標id               | PRIMARY |
| start_date | Datetime | 目標の開始時期            |         |
| end_date   | Datetime | 目標の終了時期            |         |
| name_id    | Int      | VitalDataNameの属性id | FOREIGN |
| value      | Float    | 属性の値               |         |