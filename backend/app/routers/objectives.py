from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.objective import (
    ObjectiveResponse, ObjectiveListResponse, 
    CreateObjectiveRequest, UpdateObjectiveRequest
)
from app.utils.auth import get_current_user
from settings import get_db
from models.users import User
from models.objective import Objective
from models.vitaldata import VitalData
from models.vitaldataname import VitalDataName
from models.uservitalcategory import UserVitalCategory
from sqlalchemy import func

router = APIRouter(prefix="/objectives", tags=["Objectives"])

@router.get("", response_model=List[ObjectiveResponse])
async def get_objectives(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    objectives_id = user.objective
    friends_id = user.friends
    result = []
    for obj in objectives_id:
        objective = db.query(Objective).join(VitalDataName).filter(Objective.id == obj, Objective.name_id == VitalDataName.id).first()
        if objective:
            friends = []
            for friend in friends_id:
                friend_category = db.query(UserVitalCategory).filter(
                    UserVitalCategory.user_id == friend,
                    UserVitalCategory.vital_id == objective.name_id
                ).first()
                
                if friend_category:
                    if friend_category.is_accumulating:
                        total_value = db.query(func.sum(VitalData.value)).filter(
                            VitalData.user_id == friend,
                            VitalData.name_id == objective.name_id,
                            VitalData.date >= objective.start_date,
                            VitalData.date <= objective.end_date
                        ).scalar()
                        friend_value = total_value if total_value is not None else None
                    else:
                        latest_data = db.query(VitalData).filter(
                            VitalData.user_id == friend,
                            VitalData.name_id == objective.name_id,
                            VitalData.date >= objective.start_date,
                            VitalData.date <= objective.end_date
                        ).order_by(VitalData.date.desc()).first()
                        friend_value = latest_data.value if latest_data else None
                    if friend_value is not None:
                        friend_user = db.query(User).filter(User.id == friend).first()
                        if friend_user:
                            friends.append({
                                "friend_icon": friend_user.icon,
                                "friend_info": friend_value
                            })

            user_category = db.query(UserVitalCategory).filter(
                UserVitalCategory.user_id == current_user.id,
                UserVitalCategory.vital_id == objective.name_id
            ).first()
            
            if not user_category:
                my_value = None
            elif user_category.is_accumulating:
                my_total = db.query(func.sum(VitalData.value)).filter(
                    VitalData.user_id == current_user.id,
                    VitalData.name_id == objective.name_id,
                    VitalData.date >= objective.start_date,
                    VitalData.date <= objective.end_date
                ).scalar()
                my_value = my_total if my_total is not None else None
            else:
                my_latest = db.query(VitalData).filter(
                    VitalData.user_id == current_user.id,
                    VitalData.name_id == objective.name_id,
                    VitalData.date >= objective.start_date,
                    VitalData.date <= objective.end_date
                ).order_by(VitalData.date.desc()).first()
                my_value = my_latest.value if my_latest is not None else None

            result.append(ObjectiveResponse(
                objective_id=objective.id,
                data_name=objective.vitaldataname.name,
                start_date=objective.start_date,
                end_date=objective.end_date,
                objective_value=objective.value,
                my_value=my_value,
                friends=friends
            ))
        
    return result

@router.put("")
async def create_objective(request: CreateObjectiveRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data_name_obj = db.query(VitalDataName).filter(VitalDataName.name == request.data_name).first()
    if not data_name_obj:
        raise HTTPException(status_code=404, detail="Data name not found")
    user = db.query(User).filter(User.id == current_user.id).first()
    obj_name_id = []
    for objective_id in user.objective:
        obj_name_id.append(db.query(Objective).filter(Objective.id == objective_id).first().name_id)
    if data_name_obj.id in obj_name_id:
        raise HTTPException(status_code=400, detail="Objective already exists for this data name ")

    objective = Objective(
        start_date=request.start_date,
        end_date=request.end_date,
        name_id=data_name_obj.id,
        value=request.objective_value
    )
    
    db.add(objective)
    db.commit()
    db.refresh(objective)
    user = db.query(User).filter(User.id == current_user.id).first()
    user.objective.append(objective.id)
    db.commit()
    
    return {"id": objective.id, "message": "Objective created"}

@router.put("/{objective_id}")
async def update_objective(
    objective_id: int, 
    request: UpdateObjectiveRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    objective.value = request.objective_value
    db.commit()
    
    return {"message": "Objective updated"}

@router.delete("/{objective_id}")
async def delete_objective(
    objective_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    db.delete(objective)
    db.commit()
    user = db.query(User).filter(User.id == current_user.id).first()
    user.objective.remove(objective_id)
    db.commit()
    
    return {"message": "Objective deleted"}