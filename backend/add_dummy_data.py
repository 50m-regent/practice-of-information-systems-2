#!/usr/bin/env python3
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from settings import SessionLocal
from models.users import User
from models.vitaldataname import VitalDataName
from models.vitaldata import VitalData
from models.objective import Objective
from models.otpcodes import OTPCode
import random


def add_dummy_data():
    db = SessionLocal()
    
    try:
        print("🚀 ダミーデータの追加を開始します...")
        
        # VitalDataNameの追加
        vital_data_names = [
            "体重",
            "身長",
            "血圧（上）",
            "血圧（下）",
            "心拍数",
            "体温",
            "歩数",
            "睡眠時間",
            "水分摂取量",
            "カロリー摂取量"
        ]
        
        print("📊 バイタルデータ名を追加中...")
        for name in vital_data_names:
            existing = db.query(VitalDataName).filter(VitalDataName.name == name).first()
            if not existing:
                vital_name = VitalDataName(name=name)
                db.add(vital_name)
        
        db.commit()
        
        # ユーザーの追加
        users_data = [
            {
                "email": "tanaka.taro@example.com",
                "username": "田中太郎",
                "date_of_birth": datetime(1990, 5, 15),
                "sex": True,  # True: 男性
                "friends": [2, 3],
                "objective": [1, 2, 7]  # 体重、身長、歩数の目標
            },
            {
                "email": "suzuki.hanako@example.com", 
                "username": "鈴木花子",
                "date_of_birth": datetime(1985, 8, 22),
                "sex": False,  # False: 女性
                "friends": [1, 3, 4],
                "objective": [1, 5, 8]  # 体重、心拍数、睡眠時間の目標
            },
            {
                "email": "yamada.ichiro@example.com",
                "username": "山田一郎",
                "date_of_birth": datetime(1992, 12, 3),
                "sex": True,
                "friends": [1, 2],
                "objective": [3, 4, 7]  # 血圧、心拍数、歩数の目標
            },
            {
                "email": "sato.yuki@example.com",
                "username": "佐藤由紀",
                "date_of_birth": datetime(1988, 3, 10),
                "sex": False,
                "friends": [2],
                "objective": [1, 9, 10]  # 体重、水分摂取量、カロリー摂取量の目標
            }
        ]
        
        print("👥 ユーザーデータを追加中...")
        for user_data in users_data:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(**user_data)
                db.add(user)
        
        db.commit()
        
        # バイタルデータの追加
        print("📈 バイタルデータを追加中...")
        base_date = datetime.now() - timedelta(days=30)
        
        # 各ユーザーのバイタルデータを生成
        for user_id in range(1, 5):  # 4人のユーザー
            for day in range(30):  # 30日分のデータ
                current_date = base_date + timedelta(days=day)
                
                # 体重データ
                weight = 60 + user_id * 5 + random.uniform(-2, 2)
                vital_data = VitalData(
                    date=current_date,
                    name_id=1,  # 体重
                    value=round(weight, 1),
                    is_accumulating=False,
                    is_public=True
                )
                db.add(vital_data)
                
                # 歩数データ
                steps = random.randint(5000, 15000)
                vital_data = VitalData(
                    date=current_date,
                    name_id=7,  # 歩数
                    value=steps,
                    is_accumulating=True,
                    is_public=user_id <= 2  # 最初の2人だけ公開
                )
                db.add(vital_data)
                
                # 睡眠時間データ
                sleep_hours = 6 + random.uniform(0, 3)
                vital_data = VitalData(
                    date=current_date,
                    name_id=8,  # 睡眠時間
                    value=round(sleep_hours, 1),
                    is_accumulating=False,
                    is_public=False
                )
                db.add(vital_data)
                
                # 心拍数データ（週1回程度）
                if day % 7 == 0:
                    heart_rate = 60 + random.randint(-10, 20)
                    vital_data = VitalData(
                        date=current_date,
                        name_id=5,  # 心拍数
                        value=heart_rate,
                        is_accumulating=False,
                        is_public=True
                    )
                    db.add(vital_data)
        
        # 目標データの追加
        print("🎯 目標データを追加中...")
        objectives_data = [
            {
                "start_date": datetime.now() - timedelta(days=20),
                "end_date": datetime.now() + timedelta(days=40),
                "name_id": 1,  # 体重
                "value": 65.0
            },
            {
                "start_date": datetime.now() - timedelta(days=15),
                "end_date": datetime.now() + timedelta(days=45),
                "name_id": 7,  # 歩数
                "value": 10000.0
            },
            {
                "start_date": datetime.now() - timedelta(days=10),
                "end_date": datetime.now() + timedelta(days=50),
                "name_id": 8,  # 睡眠時間
                "value": 8.0
            },
            {
                "start_date": datetime.now() - timedelta(days=25),
                "end_date": datetime.now() + timedelta(days=35),
                "name_id": 5,  # 心拍数
                "value": 70.0
            }
        ]
        
        for obj_data in objectives_data:
            objective = Objective(**obj_data)
            db.add(objective)
        
        # OTPコードの追加（テスト用）
        print("🔐 OTPコードを追加中...")
        otp_codes = [
            {"id": 1, "otp_code": "123456", "expires_at": datetime.now() + timedelta(minutes=5), "is_used": False},
            {"id": 2, "otp_code": "789012", "expires_at": datetime.now() + timedelta(minutes=10), "is_used": False}
        ]
        
        for otp_data in otp_codes:
            existing = db.query(OTPCode).filter(OTPCode.id == otp_data["id"]).first()
            if not existing:
                otp_code = OTPCode(**otp_data)
                db.add(otp_code)
        
        db.commit()
        
        # データ確認
        print("\n📊 追加されたデータの確認:")
        print(f"ユーザー数: {db.query(User).count()}")
        print(f"バイタルデータ名数: {db.query(VitalDataName).count()}")
        print(f"バイタルデータ数: {db.query(VitalData).count()}")
        print(f"目標数: {db.query(Objective).count()}")
        print(f"OTPコード数: {db.query(OTPCode).count()}")
        
        print("\n✅ ダミーデータの追加が完了しました！")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_dummy_data()