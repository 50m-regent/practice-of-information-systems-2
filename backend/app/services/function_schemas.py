"""
OpenAI Function Calling用のスキーマ定義
"""

# 目標作成用のfunction schema
CREATE_OBJECTIVE_SCHEMA = {
    "type": "function",
    "function": {
        "name": "create_objective",
        "description": "ユーザーの健康目標を作成する",
        "parameters": {
            "type": "object",
            "properties": {
                "data_name": {
                    "type": "string",
                    "description": "目標の種類（体重、血圧、歩数など）"
                },
                "start_date": {
                    "type": "string",
                    "description": "目標開始日（YYYY-MM-DD形式）"
                },
                "end_date": {
                    "type": "string",
                    "description": "目標終了日（YYYY-MM-DD形式）"
                },
                "objective_value": {
                    "type": "number",
                    "description": "目標値"
                }
            },
            "required": ["data_name", "start_date", "end_date", "objective_value"]
        }
    }
}

# 目標取得用のfunction schema
GET_OBJECTIVES_SCHEMA = {
    "type": "function",
    "function": {
        "name": "get_objectives",
        "description": "ユーザーの現在の健康目標一覧を取得する",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    }
}

# 目標更新用のfunction schema
UPDATE_OBJECTIVE_SCHEMA = {
    "type": "function",
    "function": {
        "name": "update_objective",
        "description": "既存の健康目標を更新する",
        "parameters": {
            "type": "object",
            "properties": {
                "objective_id": {
                    "type": "integer",
                    "description": "更新したい目標のID"
                },
                "objective_value": {
                    "type": "number",
                    "description": "新しい目標値"
                }
            },
            "required": ["objective_id", "objective_value"]
        }
    }
}

# 目標削除用のfunction schema
DELETE_OBJECTIVE_SCHEMA = {
    "type": "function",
    "function": {
        "name": "delete_objective",
        "description": "指定された健康目標を削除する",
        "parameters": {
            "type": "object",
            "properties": {
                "objective_id": {
                    "type": "integer",
                    "description": "削除したい目標のID"
                }
            },
            "required": ["objective_id"]
        }
    }
}

# バイタルデータ登録用のfunction schema
REGISTER_VITAL_DATA_SCHEMA = {
    "type": "function",
    "function": {
        "name": "register_vital_data",
        "description": "バイタルデータ（体重、血圧、歩数など）を登録する",
        "parameters": {
            "type": "object",
            "properties": {
                "data_name": {
                    "type": "string",
                    "description": "データの種類（体重、血圧、歩数など）"
                },
                "value": {
                    "type": "number",
                    "description": "測定値"
                },
                "date": {
                    "type": "string",
                    "description": "測定日時（YYYY-MM-DD HH:MM:SS形式）。省略時は現在時刻"
                }
            },
            "required": ["data_name", "value"]
        }
    }
}

# バイタルデータ取得用のfunction schema
GET_VITAL_DATA_SCHEMA = {
    "type": "function",
    "function": {
        "name": "get_vital_data",
        "description": "ユーザーのバイタルデータを取得する",
        "parameters": {
            "type": "object",
            "properties": {
                "data_name": {
                    "type": "string",
                    "description": "取得したいデータの種類（体重、血圧、歩数など）。省略時は全てのデータ"
                },
                "limit": {
                    "type": "integer",
                    "description": "取得する件数の上限。省略時は10件"
                }
            },
            "required": []
        }
    }
}

# 利用可能な全てのfunction schemas
ALL_FUNCTION_SCHEMAS = [
    CREATE_OBJECTIVE_SCHEMA,
    GET_OBJECTIVES_SCHEMA,
    UPDATE_OBJECTIVE_SCHEMA,
    DELETE_OBJECTIVE_SCHEMA,
    REGISTER_VITAL_DATA_SCHEMA,
    GET_VITAL_DATA_SCHEMA
]