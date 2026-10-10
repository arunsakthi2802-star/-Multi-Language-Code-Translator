from fastapi import APIRouter
from pydantic import BaseModel
from app.validators.validator_service import CodeValidatorService, ValidationResult

router = APIRouter(prefix="/validation", tags=["Validation"])

class ValidateRequest(BaseModel):
    code: str
    language: str

@router.get("/capabilities")
def get_validation_capabilities():
    return CodeValidatorService.get_capabilities()

@router.post("", response_model=ValidationResult)
def validate_code(req: ValidateRequest):
    return CodeValidatorService.validate(req.code, req.language)
