#!/usr/bin/env python3
"""
ダミーデータ削減ツール

データベース内のダミーデータを50件程度まで削減します。
"""

from sqlalchemy.orm import Session
from settings import SessionLocal
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.objective import Objective
from models.otpcodes import OTPCode


class DataReducer:
    """データを削減するクラス"""
    
    def __init__(self):
        self.session = SessionLocal()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()
    
    def get_data_counts(self) -> dict:
        """現在のデータ件数を取得"""
        return {
            'users': self.session.query(User).count(),
            'vital_data': self.session.query(VitalData).count(),
            'vital_data_names': self.session.query(VitalDataName).count(),
            'objectives': self.session.query(Objective).count(),
            'otp_codes': self.session.query(OTPCode).count()
        }
    
    def reduce_data(self, target_count: int = 50):
        """データを指定件数まで削減"""
        print("📊 現在のデータ件数:")
        counts = self.get_data_counts()
        for table, count in counts.items():
            print(f"  {table}: {count}件")
        
        total_current = sum(counts.values())
        print(f"\n合計: {total_current}件")
        
        if total_current <= target_count:
            print(f"既に{target_count}件以下です。削減の必要はありません。")
            return
        
        print(f"\n🎯 目標: 合計{target_count}件程度まで削減")
        
        # 各テーブルの削減目標を計算
        # 比率を保ちながら削減
        reduction_ratio = target_count / total_current
        
        targets = {}
        for table, count in counts.items():
            if count > 0:
                targets[table] = max(1, int(count * reduction_ratio))
        
        print("\n📉 削減目標:")
        for table, target in targets.items():
            current = counts[table]
            print(f"  {table}: {current}件 → {target}件 ({current - target}件削除)")
        
        # 実際の削減処理
        try:
            # VitalData（バイタルデータ）を削減
            if counts['vital_data'] > targets.get('vital_data', 0):
                vital_data_to_keep = targets.get('vital_data', 10)
                # 最新のN件を残して削除（dateフィールドでソート）
                vital_data_ids = self.session.query(VitalData.id).order_by(VitalData.date.desc()).limit(vital_data_to_keep).all()
                keep_ids = [id[0] for id in vital_data_ids]
                
                deleted_count = self.session.query(VitalData).filter(~VitalData.id.in_(keep_ids)).delete(synchronize_session=False)
                print(f"✅ VitalData: {deleted_count}件削除")
            
            # Objectives（目標データ）を削減
            if counts['objectives'] > targets.get('objectives', 0):
                objectives_to_keep = targets.get('objectives', 10)
                objective_ids = self.session.query(Objective.id).order_by(Objective.start_date.desc()).limit(objectives_to_keep).all()
                keep_ids = [id[0] for id in objective_ids]
                
                deleted_count = self.session.query(Objective).filter(~Objective.id.in_(keep_ids)).delete(synchronize_session=False)
                print(f"✅ Objectives: {deleted_count}件削除")
            
            # Users（ユーザー）を削減
            if counts['users'] > targets.get('users', 0):
                users_to_keep = targets.get('users', 5)
                user_ids = self.session.query(User.id).order_by(User.id.desc()).limit(users_to_keep).all()
                keep_ids = [id[0] for id in user_ids]
                
                deleted_count = self.session.query(User).filter(~User.id.in_(keep_ids)).delete(synchronize_session=False)
                print(f"✅ Users: {deleted_count}件削除")
            
            # OTPCodes（OTPコード）を削減
            if counts['otp_codes'] > targets.get('otp_codes', 0):
                otp_to_keep = targets.get('otp_codes', 5)
                otp_ids = self.session.query(OTPCode.id).order_by(OTPCode.id.desc()).limit(otp_to_keep).all()
                keep_ids = [id[0] for id in otp_ids]
                
                deleted_count = self.session.query(OTPCode).filter(~OTPCode.id.in_(keep_ids)).delete(synchronize_session=False)
                print(f"✅ OTPCodes: {deleted_count}件削除")
            
            # VitalDataName（バイタルデータ名）は必要最小限残す
            if counts['vital_data_names'] > 10:
                # 使用されているもの以外は削除
                used_names = self.session.query(VitalData.vital_data_name_id).distinct().all()
                used_name_ids = [id[0] for id in used_names if id[0] is not None]
                
                if used_name_ids:
                    deleted_count = self.session.query(VitalDataName).filter(~VitalDataName.id.in_(used_name_ids)).delete(synchronize_session=False)
                    print(f"✅ VitalDataNames: {deleted_count}件削除（未使用のもの）")
            
            # 変更をコミット
            self.session.commit()
            print("\n✅ データ削減完了")
            
            # 削減後の件数確認
            print("\n📊 削減後のデータ件数:")
            new_counts = self.get_data_counts()
            for table, count in new_counts.items():
                print(f"  {table}: {count}件")
            
            total_new = sum(new_counts.values())
            print(f"\n合計: {total_new}件 ({total_current - total_new}件削減)")
            
        except Exception as e:
            print(f"❌ データ削減エラー: {e}")
            self.session.rollback()
            raise


def main():
    print("🗂️ ダミーデータ削減ツール")
    print("=" * 50)
    
    with DataReducer() as reducer:
        reducer.reduce_data(target_count=50)


if __name__ == "__main__":
    main()