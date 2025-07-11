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
        age_group: Optional[int] = None,
        sex: Optional[bool] = None,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    vital_name_obj = db.query(VitalDataName).filter(VitalDataName.name == vital_name).first()
    if not vital_name_obj:
        raise HTTPException(status_code=404, detail="Vital data type not found")

    base_filters = [
        VitalData.name_id == vital_name_obj.id,
        UserVitalCategory.is_public == True
    ]

    if age_group is not None:
        base_filters.append(User.age >= age_group)
        base_filters.append(User.age < age_group + 10)

    if sex is not None:
        base_filters.append(User.sex == sex)
    
    subquery = (
        db.query(
            VitalData.user_id,
            func.max(VitalData.date).label("latest_date")
        )
        .join(UserVitalCategory, VitalData.user_id == UserVitalCategory.user_id)
        .join(User, UserVitalCategory.user_id == User.id)
        .filter(
            *base_filters
        )
        .group_by(VitalData.user_id)
        .subquery()
    )

    VD = aliased(VitalData)

    avg_query = (
        db.query(VD)
        .join(UserVitalCategory, VD.user_id == UserVitalCategory.user_id)
        .join(User, UserVitalCategory.user_id == User.id)
        .join(subquery, and_(
            VD.user_id == subquery.c.user_id,
            VD.date == subquery.c.latest_date
        ))
        .filter(
            *base_filters
        )
    )
    
    if not avg_query:
        average = -1
    else:
        average = avg_query.with_entities(func.avg(VD.value)).scalar()
    
    user_data = db.query(VitalData).filter(
        VitalData.name_id == vital_name_obj.id
    ).order_by(VitalData.date.desc()).first()
    
    your_value = user_data.value if user_data else -1
    values = [avg_query.value for avg_query in avg_query.all()]
    percentile = stats.percentileofscore(values, your_value, kind='rank') if values else -1
    
    return StatisticsResponse(
        average=average,
        your_value=your_value,
        percentile=percentile
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