"""
健康データ管理システムのデータベースアクセス管理モジュール

このモジュールは、SQLiteデータベースから健康データを取得し、
Vector Store用のデータ形式に変換する機能を提供します。
"""

from sqlalchemy.orm import Session
from settings import SessionLocal
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.objective import Objective
from models.otpcodes import OTPCode
from typing import List, Dict, Any, Optional
import json


class DatabaseManager:
    """
    データベースアクセスを管理するクラス
    
    SQLiteデータベースからユーザー、バイタルデータ、目標データを取得し、
    AI検索システム用のデータ形式に変換する機能を提供します。
    """
    def __init__(self) -> None:
        """データベースセッションを初期化"""
        self.session = SessionLocal()
    
    def __enter__(self) -> 'DatabaseManager':
        """コンテキストマネージャのエントリーポイント"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """コンテキストマネージャの終了処理（セッションクローズ）"""
        self.session.close()
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """
        全ユーザーデータを取得
        
        Returns:
            List[Dict[str, Any]]: ユーザー情報の辞書のリスト
        """
        users = self.session.query(User).all()
        return [self._user_to_dict(user) for user in users]
    
    def get_all_vital_data(self) -> List[Dict[str, Any]]:
        """
        全バイタルデータを取得（データ名を含む）
        
        Returns:
            List[Dict[str, Any]]: バイタルデータ情報の辞書のリスト
        """
        vital_data = self.session.query(VitalData).join(VitalDataName).all()
        return [self._vital_data_to_dict(vd) for vd in vital_data]
    
    def get_all_objectives(self) -> List[Dict[str, Any]]:
        """
        全目標データを取得（データ名を含む）
        
        Returns:
            List[Dict[str, Any]]: 目標情報の辞書のリスト
        """
        objectives = self.session.query(Objective).join(VitalDataName).all()
        return [self._objective_to_dict(obj) for obj in objectives]
    
    def get_all_data_for_vectorization(self) -> List[Dict[str, Any]]:
        """
        AI検索用にすべてのデータをベクトル化可能な形式で取得
        
        データベースの全データ（ユーザー、バイタルデータ、目標）を
        OpenAI Vector Store用のテキスト形式に変換します。
        
        Returns:
            List[Dict[str, Any]]: ベクトル化用データのリスト
                - type: データタイプ ('user', 'vital_data', 'objective')
                - id: データID
                - content: 検索可能なテキストコンテンツ
                - metadata: 元データの辞書
        """
        all_data = []
        
        # ユーザーデータの変換
        users = self.get_all_users()
        for user in users:
            all_data.append({
                'type': 'user',
                'id': user['id'],
                'content': f"ユーザー {user['username']} (ID: {user['id']}) - メール: {user['email']}, 生年月日: {user['date_of_birth']}, 性別: {user['sex']}, 友達: {user['friends']}, 目標: {user['objective']}",
                'metadata': user
            })
        
        # バイタルデータの変換
        vital_data = self.get_all_vital_data()
        for vd in vital_data:
            all_data.append({
                'type': 'vital_data',
                'id': vd['id'],
                'content': f"バイタルデータ - {vd['name']}: {vd['value']} (日付: {vd['date']}, 累積: {vd['is_accumulating']}, 公開: {vd['is_public']})",
                'metadata': vd
            })
        
        # 目標データの変換
        objectives = self.get_all_objectives()
        for obj in objectives:
            all_data.append({
                'type': 'objective',
                'id': obj['id'],
                'content': f"目標 - {obj['name']}: {obj['value']} (開始: {obj['start_date']}, 終了: {obj['end_date']})",
                'metadata': obj
            })
        
        return all_data
    
    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        return {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
            'sex': user.sex,
            'friends': user.friends,
            'objective': user.objective
        }
    
    def _vital_data_to_dict(self, vital_data: VitalData) -> Dict[str, Any]:
        return {
            'id': vital_data.id,
            'date': vital_data.date.isoformat(),
            'name_id': vital_data.name_id,
            'name': vital_data.name.name if vital_data.name else None,
            'value': vital_data.value,
            'is_accumulating': vital_data.is_accumulating,
            'is_public': vital_data.is_public
        }
    
    def _objective_to_dict(self, objective: Objective) -> Dict[str, Any]:
        return {
            'id': objective.id,
            'start_date': objective.start_date.isoformat(),
            'end_date': objective.end_date.isoformat(),
            'name_id': objective.name_id,
            'name': objective.name.name if objective.name else None,
            'value': objective.value
        }