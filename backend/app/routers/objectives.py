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

@router.get("/", response_model=List[ObjectiveResponse])
async def get_objectives(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    objectives = db.query(Objective).join(VitalDataName).filter(
        Objective.name_id == VitalDataName.id
    ).all()
    
    result = []
    for obj in objectives:
        data_name = db.query(VitalDataName).filter(VitalDataName.id == obj.name_id).first()
        
        friends = []
        
        result.append(ObjectiveResponse(
            objective_id=obj.id,
            start_date=obj.start_date,
            end_date=obj.end_date,
            my_value=obj.value,
            data_name=data_name.name,
            friends=friends
        ))
    
    return result

@router.get("/list", response_model=List[ObjectiveListResponse])
async def get_my_objectives(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    objectives = db.query(Objective).join(VitalDataName).filter(
        Objective.name_id == VitalDataName.id
    ).all()
    
    result = []
    for obj in objectives:
        data_name = db.query(VitalDataName).filter(VitalDataName.id == obj.name_id).first()
        
        progress = 0
        current_data = db.query(VitalData).filter(
            VitalData.name_id == obj.name_id,
            VitalData.date >= obj.start_date,
            VitalData.date <= obj.end_date
        ).all()
        
        if current_data:
            progress = sum([data.value for data in current_data])
        
        result.append(ObjectiveListResponse(
            id=obj.id,
            name=data_name.name,
            start=obj.start_date.strftime("%Y-%m-%d"),
            end=obj.end_date.strftime("%Y-%m-%d"),
            objective_value=obj.value,
            progress=progress
        ))
    
    return result

@router.post("/")
async def create_objective(request: CreateObjectiveRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data_name_obj = db.query(VitalDataName).filter(VitalDataName.name == request.data_name).first()
    if not data_name_obj:
        raise HTTPException(status_code=404, detail="Data name not found")
    
    objective = Objective(
        start_date=request.start_date,
        end_date=request.end_date,
        name_id=data_name_obj.id,
        value=request.objective_value
    )
    
    db.add(objective)
    db.commit()
    db.refresh(objective)
    
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
    
    return {"message": "Objective deleted"}