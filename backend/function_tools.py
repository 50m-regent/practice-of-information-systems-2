"""
Function calling用のツール定義
OpenAI Responses APIで使用するfunction callingツールを定義
"""

def get_function_tools():
    """
    Responses APIで使用するツールの定義を返す
    """
    return [
        {
            "type": "function",
            "name": "create_objective",
            "description": "ユーザーの目標を作成する",
            "parameters": {
                "type": "object",
                "properties": {
                    "data_name": {
                        "type": "string",
                        "description": "目標のデータ名（例：体重、血圧など）"
                    },
                    "start_date": {
                        "type": "string",
                        "description": "目標開始日（ISO 8601形式：YYYY-MM-DD）"
                    },
                    "end_date": {
                        "type": "string",
                        "description": "目標終了日（ISO 8601形式：YYYY-MM-DD）"
                    },
                    "objective_value": {
                        "type": "number",
                        "description": "目標値"
                    }
                },
                "required": ["data_name", "start_date", "end_date", "objective_value"]
            }
        },
        {
            "type": "function",
            "name": "get_objectives",
            "description": "ユーザーの目標一覧を取得する",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        },
        {
            "type": "function",
            "name": "update_objective",
            "description": "既存の目標を更新する",
            "parameters": {
                "type": "object",
                "properties": {
                    "objective_id": {
                        "type": "integer",
                        "description": "更新する目標のID"
                    },
                    "objective_value": {
                        "type": "number",
                        "description": "新しい目標値"
                    }
                },
                "required": ["objective_id", "objective_value"]
            }
        },
        {
            "type": "function",
            "name": "delete_objective",
            "description": "目標を削除する",
            "parameters": {
                "type": "object",
                "properties": {
                    "objective_id": {
                        "type": "integer",
                        "description": "削除する目標のID"
                    }
                },
                "required": ["objective_id"]
            }
        },
        {
            "type": "function",
            "name": "register_vital_data",
            "description": "バイタルデータを登録する",
            "parameters": {
                "type": "object",
                "properties": {
                    "data_name": {
                        "type": "string",
                        "description": "データ名（例：体重、血圧など）"
                    },
                    "value": {
                        "type": "number",
                        "description": "登録するデータの値"
                    },
                    "date": {
                        "type": "string",
                        "description": "データの日付（ISO 8601形式：YYYY-MM-DD）。省略時は現在時刻"
                    }
                },
                "required": ["data_name", "value"]
            }
        },
        {
            "type": "function",
            "name": "get_vital_data",
            "description": "バイタルデータを取得する",
            "parameters": {
                "type": "object",
                "properties": {
                    "data_name": {
                        "type": "string",
                        "description": "取得するデータ名（省略時は全てのデータ）"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "取得する件数の上限（デフォルト：10）"
                    }
                },
                "required": []
            }
        }
    ]