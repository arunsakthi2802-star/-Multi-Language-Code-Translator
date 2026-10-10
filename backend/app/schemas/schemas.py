from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# AUTH
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

# TRANSLATION
class TranslationOptions(BaseModel):
    preserve_comments: bool = True
    add_explanatory_comments: bool = False
    type_annotations: bool = True
    prefer_stdlib: bool = True
    include_error_handling: bool = False
    add_unit_tests: bool = False

class TranslationRequest(BaseModel):
    source_code: str = Field(..., min_length=1, max_length=100000)
    source_language: str
    target_language: str
    style: str = "idiomatic"
    provider: Optional[str] = None # openai, ollama, rule_based
    options: Optional[TranslationOptions] = Field(default_factory=TranslationOptions)

class TranslationResponse(BaseModel):
    id: Optional[str] = None
    source_language: str
    target_language: str
    source_code: str
    translated_code: str
    provider: str
    model_name: Optional[str] = None
    status: str
    warnings: List[str] = []
    conversion_notes: List[str] = []
    explanation: Optional[str] = None
    suggested_tests: List[str] = []
    duration_ms: int = 0
    created_at: Optional[datetime] = None

class TranslationRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    source_language: str
    target_language: str
    source_code: str
    translated_code: Optional[str]
    provider: str
    model_name: Optional[str]
    status: str
    warnings: Optional[str]
    explanation: Optional[str]
    duration_ms: int
    created_at: datetime

# PROJECT
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    source_language: str
    target_language: str
    source_code: str
    translated_code: Optional[str] = ""
    notes: Optional[str] = ""
    tags: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    source_language: Optional[str] = None
    target_language: Optional[str] = None
    source_code: Optional[str] = None
    translated_code: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None

class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str]
    source_language: str
    target_language: str
    source_code: str
    translated_code: Optional[str]
    notes: Optional[str]
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime

# TEMPLATE
class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    source_language: str
    code: str
    difficulty: str
    category: str
    expected_behavior: Optional[str]
    is_public: bool

# EXPLANATION
class ExplanationRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=100000)
    language: str
    mode: str = "intermediate"

class ExplanationResponse(BaseModel):
    purpose: str
    components: List[str] = []
    control_flow: str = ""
    complexity: Dict[str, Any] = {}
    potential_bugs: List[str] = []
    improvements: List[str] = []
    full_explanation: str

# SETTINGS
class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    default_source_language: Optional[str] = None
    default_target_language: Optional[str] = None
    save_history: Optional[bool] = None
    preferred_translation_style: Optional[str] = None
    ai_provider: Optional[str] = None
    custom_model: Optional[str] = None
    custom_base_url: Optional[str] = None

class UserSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    theme: str
    default_source_language: str
    default_target_language: str
    save_history: bool
    preferred_translation_style: str
    ai_provider: str
    custom_model: Optional[str]
    custom_base_url: Optional[str]

# COMPARISON
class ComparisonRequest(BaseModel):
    source_code: str
    source_language: str
    target_code: str
    target_language: str
    request_ai_assessment: bool = True
