
from pydantic import BaseModel,ConfigDict
from typing import List, Optional
from app.schemas.disease_requirement import RequirementOut
from app.schemas.treatment import TreatmentOut

#=========================================================#
#                   DISEASE BASE SCHEMA                   #
#=========================================================#
class DiseaseBase(BaseModel):
    name: str
    description: str
    urgency_level: str
    symtoms: str
    image_url: Optional[str] = None
    #requirement_type: str
    #requirement_detail: str
    icon_name: str
    color_hex: Optional[str] = None   #one color at a time

#=========================================================#
#                   DISEASE CREATE SCHEMA                 #
#=========================================================#
class DiseaseCreate(DiseaseBase):
    pass

#=========================================================#
#                   DISEASE UPDATE SCHEMA                 #
#=========================================================#
class DiseaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    urgency_level: Optional[str] = None
    image_url: Optional[str] = None
    #requirement_type: Optional[str] = None
    #requirement_detail: Optional[str] = None
    icon_name: Optional[str] = None
    color_hex: Optional[str] = None
    

#=========================================================#
#                   DISEASE OUT SCHEMA                    #
#=========================================================#
class DiseaseOut(DiseaseBase):
    disease_id: int
    requirement: List[RequirementOut] = []
    treatments: List[TreatmentOut] = []
    
    model_config = ConfigDict(from_attributes=True)