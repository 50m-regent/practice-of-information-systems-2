from fastapi import APIRouter, HTTPException, Depends
from collections import defaultdict
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, and_
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

@router.get("/category", response_model=List[VitalDataCategoryResponse])
async def get_my_category(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vital_data = db.query(VitalDataName).join(UserVitalCategory).filter(VitalDataName.id == UserVitalCategory.vital_id, UserVitalCategory.user_id == current_user.id).all()

    result = []
    for data in vital_data:
        result.append(VitalDataCategoryResponse(
            id = data.id,
            name = data.name
        ))
    
    return result

@router.post("/register")
async def add_vital_data(request: RegisterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

@router.put("/create")
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
    
    existing_category_in_user = db.query(UserVitalCategory).filter(UserVitalCategory.vital_id == category_id, UserVitalCategory.user_id == current_user.id).first()
    if existing_category_in_user: #もしユーザーのカテゴリーにすでに存在する場合
        return {"message": "Category already exists"} 
    new_category = UserVitalCategory(
        user_id = current_user.id,
        vital_id = category_id,
        is_public=request.is_public,
        is_accumulating=request.is_accumulating
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return {"message": "New category created successfully"}

@router.get("/statistics", response_model=StatisticsResponse)
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
    max_birth_date = date(current_date.year - start_age, current_date.month, current_date.day)
    min_birth_date = date(current_date.year - end_age, current_date.month, current_date.day)

    base_filters = [
        VitalData.name_id == vital_name_obj.id,
        UserVitalCategory.is_public == True,
        User.date_of_birth >= min_birth_date,
        User.date_of_birth < max_birth_date,
    ]

    if sex is not None:
        base_filters.append(User.sex == sex)
    
    subquery = (
        db.query(
            VitalData.user_id,
            UserVitalCategory.is_accumulating,
            func.case(
                (UserVitalCategory.is_accumulating == True, func.current_date()), else_=func.max(VitalData.date)).label("target_date")
            )
        .join(UserVitalCategory, VitalData.user_id == UserVitalCategory.user_id)
        .join(User, UserVitalCategory.user_id == User.id)
        .filter(*base_filters)
        .group_by(VitalData.user_id, UserVitalCategory.is_accumulating)
        .subquery()
    )

    VD = aliased(VitalData)

    avg_query = (
        db.query(VD.user_id, subquery.c.is_accumulating, func.case(subquery.c.is_accumulating == True, func.sum(VD.value), else_=VD.value).label("calculated_value"))
        .join(UserVitalCategory, VD.user_id == UserVitalCategory.user_id)
        .join(User, UserVitalCategory.user_id == User.id)
        .join(subquery, and_(
            VD.user_id == subquery.c.user_id,
            func.case(
                (subquery.c.is_accumulating == True, func.date(VD.date) == subquery.c.target_date),
                else_=VD.date == subquery.c.target_date
            )
        ))
        .filter(*base_filters)
        .group_by(VD.user_id, subquery.c.is_accumulating)
    )
    
    average = avg_query.with_entities(func.avg(avg_query.subquery().c.calculated_value)).scalar()
    
    return StatisticsResponse(
        average=average
    )

@router.get("/me", response_model=List[VitalDataResponse])
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

@router.get("/life-logs", response_model=List[LifeLogGroupedResponse])
async def get_life_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # userのvitalデータと名前を結合
    vital_data = db.query(VitalData).join(VitalDataName).filter(
        VitalData.user_id == current_user.id,
        VitalData.name_id == VitalDataName.id
    ).order_by(VitalData.name_id, VitalData.date).all()

    grouped = defaultdict(list)

    for data in vital_data:
        grouped[data.vitaldataname.name].append({
            "x": data.date,
            "y": data.value
        })

    result = [
        {"data_name": name, "vitaldata_list": values}
        for name, values in grouped.items()
    ]

    return result