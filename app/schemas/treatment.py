from pydantic import BaseModel, ConfigDict, constr
from typing import Optional, Literal

#=========================================================#
#                 TREATEMENT BASE SCHEMA                  #
#=========================================================#
class TreatmentBase(BaseModel):
    treatment_name: constr(min_length=1, max_length=30) 
    dosage: Optional[constr(max_length=15)] = None
    duration: Optional[constr(max_length=15)] = None 
    application_method: Optional[str] = None

#=========================================================#
#                      TREATEMENT CREATE SCHEMA           #
#=========================================================#
class TreatmentCreate(TreatmentBase):
    disease_id: int

#=========================================================#
#                      TREATEMENT UPDATE SCHEMA           #
#=========================================================#
class TreatmentUpdate(BaseModel):
    treatment_name: Optional[str] = None
    dosage: Optional[str] = None
    duration: Optional[str] = None
    application_method: Optional[str] = None

#=========================================================#
#                      TREATEMENT OUT SCHEMA              #
#=========================================================#
class TreatmentOut(TreatmentBase):
    treatment_id: int
    disease_id: int
    model_config = ConfigDict(from_attributes=True)