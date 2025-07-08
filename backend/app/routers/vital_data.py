from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.vital_data import VitalDataResponse, StatisticsResponse, LifeLogResponse
from app.utils.auth import get_current_user
from settings import get_db
from models.users import User
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName

router = APIRouter(prefix="/vitaldata", tags=["Vital Data"])

@router.get("/me", response_model=List[VitalDataResponse])
async def get_my_vital_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vital_data = db.query(VitalData).join(VitalDataName).filter(
        VitalData.name_id == VitalDataName.id
    ).all()
    
    result = []
    for data in vital_data:
        data_name = db.query(VitalDataName).filter(VitalDataName.id == data.name_id).first()
        result.append(VitalDataResponse(
            name=data_name.name,
            value=data.value,
            date=data.date.strftime("%Y-%m-%d")
        ))
    
    return result

@router.get("/statistics", response_model=StatisticsResponse)
async def get_vital_statistics(
    vital_name: str, 
    age_group: Optional[int] = None, 
    sex: Optional[bool] = None, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    vital_name_obj = db.query(VitalDataName).filter(VitalDataName.name == vital_name).first()
    if not vital_name_obj:
        raise HTTPException(status_code=404, detail="Vital data type not found")
    
    avg_query = db.query(VitalData).filter(VitalData.name_id == vital_name_obj.id)
    if avg_query.first():
        average = sum([data.value for data in avg_query.all()]) / avg_query.count()
    else:
        average = 0
    
    user_data = db.query(VitalData).filter(
        VitalData.name_id == vital_name_obj.id
    ).order_by(VitalData.date.desc()).first()
    
    your_value = user_data.value if user_data else 0
    
    percentile = 50 if your_value >= average else 30
    
    return StatisticsResponse(
        average=average,
        your_value=your_value,
        percentile=percentile
    )

@router.get("/life-logs/", response_model=List[LifeLogResponse])
async def get_life_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vital_data = db.query(VitalData).join(VitalDataName).filter(
        VitalData.name_id == VitalDataName.id
    ).all()
    
    result = []
    for data in vital_data:
        data_name = db.query(VitalDataName).filter(VitalDataName.id == data.name_id).first()
        
        result.append(LifeLogResponse(
            data_name=data_name.name,
            is_public=data.is_public,
            register_date=data.date,
            graph=None
        ))
    
    return result