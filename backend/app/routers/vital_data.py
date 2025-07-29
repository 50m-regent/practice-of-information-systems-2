from fastapi import APIRouter, HTTPException, Depends
from collections import defaultdict
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, and_, case
from typing import List, Optional
from app.schemas.vital_data import CreateCategoryRequest, RegisterRequest, VitalDataCategoryResponse, VitalDataResponse, StatisticsResponse, LifeLogGroupedResponse, VitalPoint
from app.utils.auth import get_current_user
from settings import get_db
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.uservitalcategory import UserVitalCategory
from datetime import datetime, date

router = APIRouter(prefix="/vitaldata", tags=["Vital Data"])

@router.get("/category/", response_model=List[VitalDataCategoryResponse])
async def get_my_category(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 获取所有可用的健康数据类型
    all_vital_types = db.query(VitalDataName).all()
    
    result = []
    for vital_type in all_vital_types:
        result.append(VitalDataCategoryResponse(
            id = vital_type.id,
            name = vital_type.name
        ))
    
    return result

@router.post("/register/")
async def add_vital_data(request: RegisterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查用户是否已经有这个类型的设置
    existing_category = db.query(UserVitalCategory).filter(
        UserVitalCategory.vital_id == request.name_id,
        UserVitalCategory.user_id == current_user.id
    ).first()
    
    # 如果用户还没有这个类型的设置，创建一个默认设置
    if not existing_category:
        new_category = UserVitalCategory(
            user_id=current_user.id,
            vital_id=request.name_id,
            is_public=True,  # 默认公开
            is_accumulating=False  # 默认不累积
        )
        db.add(new_category)
    
    # 创建健康数据记录
    vital_data = VitalData(
        name_id=request.name_id,
        user_id=current_user.id,
        date=request.date,
        value=request.value
    )
    db.add(vital_data)
    db.commit()
    db.refresh(vital_data)

    return {"message": "Vital data added successfully"}

@router.put("/create/")
async def create_new_category(
    request: CreateCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_category = db.query(VitalDataName).filter(VitalDataName.name == request.vitaldataname).first()
    if not existing_category: #もし全体のカテゴリーに存在しない場合新しいカテゴリーを作成
        new_category_name = VitalDataName(
            name=request.vitaldataname,
        )
        db.add(new_category_name)
        db.commit()
        db.refresh(new_category_name)
        category_id = new_category_name.id
    else:
        category_id = existing_category.id
    
    # 注意：这里不再自动创建 UserVitalCategory 记录
    # 用户需要手动点击数据类型来注册到自己的账户
    
    return {"message": "New category created successfully"}

@router.post("/register-category/")
async def register_category_to_user(
    request: CreateCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 查找数据类型
    existing_category = db.query(VitalDataName).filter(VitalDataName.name == request.vitaldataname).first()
    if not existing_category:
        raise HTTPException(status_code=404, detail="Vital data type not found")
    
    # 检查用户是否已经注册了这个类型
    existing_category_in_user = db.query(UserVitalCategory).filter(
        UserVitalCategory.vital_id == existing_category.id,
        UserVitalCategory.user_id == current_user.id
    ).first()
    
    if existing_category_in_user:
        return {"message": "Category already registered"}
    
    # 为用户注册这个数据类型
    new_category = UserVitalCategory(
        user_id=current_user.id,
        vital_id=existing_category.id,
        is_public=request.is_public,
        is_accumulating=request.is_accumulating
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return {"message": "Category registered successfully"}

@router.get("/statistics/", response_model=StatisticsResponse)
async def get_statistics(
        vital_name: str,
        start_age: int,
        end_age: int,
        sex: Optional[bool] = None,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    vital_name_obj = db.query(VitalDataName).filter(VitalDataName.name == vital_name).first()
    if not vital_name_obj:
        raise HTTPException(status_code=404, detail="Vital data type not found")

    current_date = date.today()
    max_birth_date = datetime(current_date.year - start_age, current_date.month, current_date.day)
    min_birth_date = datetime(current_date.year - end_age, current_date.month, current_date.day)

    # 基本クエリ: 条件に合うユーザーとカテゴリ設定を取得
    user_categories = (
        db.query(
            User.id.label("user_id"),
            UserVitalCategory.is_accumulating.label("is_accumulating")
        )
        .join(UserVitalCategory, User.id == UserVitalCategory.user_id)
        .filter(
            UserVitalCategory.vital_id == vital_name_obj.id,
            UserVitalCategory.is_public == True,
            User.date_of_birth >= min_birth_date,
            User.date_of_birth < max_birth_date
        )
    )
  
    if sex is not None:
        user_categories = user_categories.filter(User.sex == sex)
    
    user_categories = user_categories.all()
    print("User categories query:", user_categories)  # デバッグ用ログ出力
    if not user_categories:
        return StatisticsResponse(average=None)
    
    # 各ユーザーの計算値を取得
    calculated_values = []
    
    for user_id, is_accumulating in user_categories:
        if is_accumulating:
            # 累積の場合：最新日付の全ての値の合計
            latest_date = (
                db.query(func.max(VitalData.date))
                .filter(
                    VitalData.user_id == user_id,
                    VitalData.name_id == vital_name_obj.id
                )
                .scalar()
            )
            
            if latest_date:
                total_value = (
                    db.query(func.sum(VitalData.value))
                    .filter(
                        VitalData.user_id == user_id,
                        VitalData.name_id == vital_name_obj.id,
                        func.date(VitalData.date) == func.date(latest_date)
                    )
                    .scalar()
                )
                if total_value is not None:
                    calculated_values.append(total_value)
        else:
            # 非累積の場合：最新の値
            latest_value = (
                db.query(VitalData.value)
                .filter(
                    VitalData.user_id == user_id,
                    VitalData.name_id == vital_name_obj.id
                )
                .order_by(VitalData.date.desc())
                .first()
            )
            if latest_value:
                calculated_values.append(latest_value[0])
    
    # 平均値を計算
    if calculated_values:
        average = sum(calculated_values) / len(calculated_values)
    else:
        average = None
    
    return StatisticsResponse(
        average=average
    )

@router.get("/me/", response_model=List[VitalDataResponse])
async def get_my_vital_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vital_data = db.query(VitalData).join(VitalDataName).filter(
        VitalData.name_id == VitalDataName.id,
        VitalData.user_id == current_user.id
    ).order_by(VitalData.date.desc()).limit(10).all()
    
    result = []
    for data in vital_data:
        result.append(VitalDataResponse(
            name=data.vitaldataname.name,
            value=data.value,
            date=data.date
        ))
    
    return result

@router.get("/life-logs/", response_model=List[LifeLogGroupedResponse])
async def get_life_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 获取用户注册的所有数据类型
    user_categories = db.query(VitalDataName).join(UserVitalCategory).filter(
        VitalDataName.id == UserVitalCategory.vital_id, 
        UserVitalCategory.user_id == current_user.id
    ).all()
    
    result = []
    
    for category in user_categories:
        # 获取该类型的数据记录
        vital_data = db.query(VitalData).filter(
            VitalData.user_id == current_user.id,
            VitalData.name_id == category.id
        ).order_by(VitalData.date).all()
        
        # 转换为图表数据格式
        vitaldata_list = [
            {"x": data.date, "y": data.value}
            for data in vital_data
        ]
        
        result.append({
            "data_name": category.name,
            "vitaldata_list": vitaldata_list
        })
    
    return result

@router.get("/my-categories/", response_model=List[VitalDataCategoryResponse])
async def get_my_registered_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 获取用户已注册的健康数据类型
    user_categories = db.query(VitalDataName).join(UserVitalCategory).filter(
        VitalDataName.id == UserVitalCategory.vital_id, 
        UserVitalCategory.user_id == current_user.id
    ).all()

    result = []
    for category in user_categories:
        result.append(VitalDataCategoryResponse(
            id = category.id,
            name = category.name
        ))
    
    return result