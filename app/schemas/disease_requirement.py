from pydantic import BaseModel, ConfigDict

#=========================================================#
#           DISEASE REQUIREMENT BASE SCHEMA               #
#=========================================================#
class RequirementBase(BaseModel):
    requirement: str

#=========================================================#
#           DISEASE REQUIREMENT CREATE SCHEMA             #
#=========================================================#
class RequirementCreate(RequirementBase):
    disease_id: int

#=========================================================#
#           DISEASE REQUIREMENT OUT SCHEMA                #
#=========================================================#
class RequirementOut(RequirementBase):
    requirement_id: int
    disease_id: int

    model_config = ConfigDict(from_attributes=True)