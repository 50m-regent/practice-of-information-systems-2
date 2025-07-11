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
                data = db.query(VitalData).filter(VitalData.user_id == friend, VitalData.name_id == objective.id).order_by(VitalData.date.desc()).first()
                if data:
                    icon_base64 = db.query(User).filter(User.id == friend).first().icon
                    friends.append({
                        "friend_icon": icon_base64,
                        "friend_info": data.value
                    })

            result.append(ObjectiveResponse(
                objective_id=objective.id,
                data_name=objective.vitaldataname.name,
                start_date=objective.start_date,
                end_date=objective.end_date,
                objective_value=objective.value,
                my_value=db.query(VitalData).filter(VitalData.user_id == current_user.id, VitalData.name_id == objective.name_id).order_by(VitalData.date.desc()).first().value,
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