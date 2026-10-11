from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserSettings
from app.schemas.schemas import UserSettingsUpdate, UserSettingsOut
from app.api.dependencies import get_current_user
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.providers.ollama import OllamaProvider
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=UserSettingsOut)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        db.commit()
        db.refresh(user_settings)
        return user_settings
    return current_user.settings

@router.put("", response_model=UserSettingsOut)
def update_user_settings(
    req: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = current_user.settings
    if not s:
        s = UserSettings(user_id=current_user.id)
        db.add(s)

    if req.theme is not None:
        s.theme = req.theme
    if req.default_source_language is not None:
        s.default_source_language = req.default_source_language
    if req.default_target_language is not None:
        s.default_target_language = req.default_target_language
    if req.save_history is not None:
        s.save_history = req.save_history
    if req.preferred_translation_style is not None:
        s.preferred_translation_style = req.preferred_translation_style
    if req.ai_provider is not None:
        s.ai_provider = req.ai_provider
    if req.custom_model is not None:
        s.custom_model = req.custom_model
    if req.custom_base_url is not None:
        s.custom_base_url = req.custom_base_url

    db.commit()
    db.refresh(s)
    return s

from app.providers.gemini import GeminiProvider

@router.post("/test-connection")
async def test_provider_connection(payload: dict):
    provider = payload.get("provider", "gemini")
    api_key = payload.get("api_key") # optional override for test
    base_url = payload.get("base_url")
    model = payload.get("model")

    if provider == "gemini":
        p = GeminiProvider(api_key=api_key, model=model)
        return await p.test_connection()
    elif provider == "openai":
        p = OpenAICompatibleProvider(api_key=api_key, base_url=base_url, model=model)
        return await p.test_connection()
    elif provider == "ollama":
        p = OllamaProvider(base_url=base_url, model=model)
        return await p.test_connection()
    elif provider == "rule_based":
        return {
            "success": True,
            "provider": "rule_based",
            "message": "Deterministic rule-based translation engine is built-in and always available."
        }
    else:
        return {
            "success": False,
            "provider": provider,
            "message": f"Unknown provider: {provider}"
        }
