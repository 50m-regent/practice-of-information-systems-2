"""
内部API呼び出し用のヘルパー関数
Function calling経由でAPIを呼び出すためのサービス
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.users import User
from models.objective import Objective
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.uservitalcategory import UserVitalCategory


class InternalAPIService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    async def create_objective(
        self,
        data_name: str,
        start_date: str,
        end_date: str,
        objective_value: float
    ) -> Dict[str, Any]:
        """目標を作成する"""
        try:
            # 日付文字列をdatetimeに変換
            start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # VitalDataNameを取得
            data_name_obj = self.db.query(VitalDataName).filter(
                VitalDataName.name == data_name
            ).first()
            
            if not data_name_obj:
                return {
                    "success": False,
                    "error": f"データ名 '{data_name}' が見つかりません"
                }
            
            # 既存の目標をチェック（コメントアウト - 重複を許可）
            # user = self.db.query(User).filter(User.id == self.user.id).first()
            # if user.objective:
            #     for objective_id in user.objective:
            #         existing_obj = self.db.query(Objective).filter(
            #             Objective.id == objective_id
            #         ).first()
            #         if existing_obj and existing_obj.name_id == data_name_obj.id:
            #             return {
            #                 "success": False,
            #                 "error": f"'{data_name}' の目標は既に存在します"
            #             }
            
            # 目標を作成
            objective = Objective(
                start_date=start_datetime,
                end_date=end_datetime,
                name_id=data_name_obj.id,
                value=objective_value
            )
            
            self.db.add(objective)
            self.db.commit()
            self.db.refresh(objective)
            
            # ユーザーの目標リストに追加
            # セッションから最新のユーザー情報を取得
            user = self.db.query(User).filter(User.id == self.user.id).first()
            if user.objective is None:
                user.objective = []
            user.objective.append(objective.id)
            self.db.commit()
            
            return {
                "success": True,
                "objective_id": objective.id,
                "message": f"'{data_name}' の目標を作成しました"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"目標作成中にエラーが発生しました: {str(e)}"
            }

    async def get_objectives(self) -> Dict[str, Any]:
        """目標一覧を取得する"""
        try:
            user = self.db.query(User).filter(User.id == self.user.id).first()
            if not user.objective:
                return {
                    "success": True,
                    "objectives": [],
                    "message": "現在設定されている目標はありません"
                }
            
            objectives = []
            for obj_id in user.objective:
                objective = self.db.query(Objective).join(VitalDataName).filter(
                    Objective.id == obj_id,
                    Objective.name_id == VitalDataName.id
                ).first()
                
                if objective:
                    # 現在の値を取得
                    current_data = self.db.query(VitalData).filter(
                        VitalData.user_id == self.user.id,
                        VitalData.name_id == objective.name_id
                    ).order_by(VitalData.date.desc()).first()
                    
                    objectives.append({
                        "objective_id": objective.id,
                        "data_name": objective.vitaldataname.name,
                        "start_date": objective.start_date.isoformat(),
                        "end_date": objective.end_date.isoformat(),
                        "objective_value": objective.value,
                        "current_value": current_data.value if current_data else None
                    })
            
            return {
                "success": True,
                "objectives": objectives,
                "message": f"{len(objectives)}個の目標が見つかりました"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"目標取得中にエラーが発生しました: {str(e)}"
            }

    async def update_objective(
        self,
        objective_id: int,
        objective_value: float
    ) -> Dict[str, Any]:
        """目標を更新する"""
        try:
            objective = self.db.query(Objective).filter(
                Objective.id == objective_id
            ).first()
            
            if not objective:
                return {
                    "success": False,
                    "error": f"ID {objective_id} の目標が見つかりません"
                }
            
            # ユーザーの目標かチェック
            user = self.db.query(User).filter(User.id == self.user.id).first()
            if not user.objective or objective_id not in user.objective:
                return {
                    "success": False,
                    "error": "この目標を更新する権限がありません"
                }
            
            objective.value = objective_value
            self.db.commit()
            
            return {
                "success": True,
                "message": f"目標値を {objective_value} に更新しました"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"目標更新中にエラーが発生しました: {str(e)}"
            }

    async def delete_objective(self, objective_id: int) -> Dict[str, Any]:
        """目標を削除する"""
        try:
            objective = self.db.query(Objective).filter(
                Objective.id == objective_id
            ).first()
            
            if not objective:
                return {
                    "success": False,
                    "error": f"ID {objective_id} の目標が見つかりません"
                }
            
            # ユーザーの目標かチェック
            user = self.db.query(User).filter(User.id == self.user.id).first()
            if not user.objective or objective_id not in user.objective:
                return {
                    "success": False,
                    "error": "この目標を削除する権限がありません"
                }
            
            # 目標を削除
            self.db.delete(objective)
            user.objective.remove(objective_id)
            self.db.commit()
            
            return {
                "success": True,
                "message": "目標を削除しました"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"目標削除中にエラーが発生しました: {str(e)}"
            }

    async def register_vital_data(
        self,
        data_name: str,
        value: float,
        date: Optional[str] = None
    ) -> Dict[str, Any]:
        """バイタルデータを登録する"""
        try:
            # 日付の処理
            if date:
                date_obj = datetime.fromisoformat(date.replace('Z', '+00:00'))
            else:
                date_obj = datetime.utcnow()
            
            # VitalDataNameを取得
            data_name_obj = self.db.query(VitalDataName).filter(
                VitalDataName.name == data_name
            ).first()
            
            if not data_name_obj:
                return {
                    "success": False,
                    "error": f"データ名 '{data_name}' が見つかりません"
                }
            
            # バイタルデータを作成
            vital_data = VitalData(
                user_id=self.user.id,
                date=date_obj,
                name_id=data_name_obj.id,
                value=value
            )
            
            self.db.add(vital_data)
            self.db.commit()
            self.db.refresh(vital_data)
            
            return {
                "success": True,
                "data_id": vital_data.id,
                "message": f"'{data_name}' のデータを登録しました"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"データ登録中にエラーが発生しました: {str(e)}"
            }

    async def get_vital_data(
        self,
        data_name: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """バイタルデータを取得する"""
        try:
            query = self.db.query(VitalData).filter(
                VitalData.user_id == self.user.id
            )
            
            if data_name:
                data_name_obj = self.db.query(VitalDataName).filter(
                    VitalDataName.name == data_name
                ).first()
                if not data_name_obj:
                    return {
                        "success": False,
                        "error": f"データ名 '{data_name}' が見つかりません"
                    }
                query = query.filter(VitalData.name_id == data_name_obj.id)
            
            vital_data_list = query.join(VitalDataName).order_by(
                VitalData.date.desc()
            ).limit(limit).all()
            
            data = []
            for vital_data in vital_data_list:
                data.append({
                    "id": vital_data.id,
                    "data_name": vital_data.vitaldataname.name,
                    "value": vital_data.value,
                    "date": vital_data.date.isoformat()
                })
            
            return {
                "success": True,
                "data": data,
                "message": f"{len(data)}件のデータが見つかりました"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"データ取得中にエラーが発生しました: {str(e)}"
            }