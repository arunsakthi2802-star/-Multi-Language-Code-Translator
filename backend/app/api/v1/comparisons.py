from typing import Optional
from fastapi import APIRouter, Depends
from app.schemas.schemas import ComparisonRequest
from app.models.models import User
from app.api.dependencies import get_current_user_optional
from app.services.comparison_service import ComparisonService, ComparisonResult
from app.providers.gemini import GeminiProvider
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.core.config import settings

router = APIRouter(prefix="/comparisons", tags=["Code Comparison"])

@router.post("", response_model=ComparisonResult)
async def compare_code(
    req: ComparisonRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    ai_assessment = None
    if req.request_ai_assessment:
        try:
            provider_name = (
                current_user.settings.ai_provider if current_user and current_user.settings and current_user.settings.ai_provider else settings.AI_PROVIDER
            )
            if provider_name == "gemini":
                provider = GeminiProvider(
                    model=current_user.settings.custom_model if current_user and current_user.settings and current_user.settings.custom_model else None
                )
            else:
                provider = OpenAICompatibleProvider(
                    base_url=current_user.settings.custom_base_url if current_user and current_user.settings else None,
                    model=current_user.settings.custom_model if current_user and current_user.settings else None
                )
            ai_assessment = await provider.compare(
                req.source_code, req.source_language, req.target_code, req.target_language
            )
        except Exception:
            ai_assessment = {
                "assessment": "Semantic evaluation skipped or provider unavailable.",
                "semantic_equivalence": "Unverified",
                "behavioral_differences": [],
                "key_mappings": []
            }

    return ComparisonService.compare_code(
        source_code=req.source_code,
        source_lang=req.source_language,
        target_code=req.target_code,
        target_lang=req.target_language,
        ai_assessment=ai_assessment
    )
