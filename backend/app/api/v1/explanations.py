from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.schemas import ExplanationRequest, ExplanationResponse
from app.models.models import User
from app.api.dependencies import get_current_user_optional
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.providers.ollama import OllamaProvider
from app.core.config import settings

router = APIRouter(prefix="/explanations", tags=["Code Explanation"])

@router.post("", response_model=ExplanationResponse)
async def explain_code(
    req: ExplanationRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    provider_name = (
        current_user.settings.ai_provider if current_user and current_user.settings and current_user.settings.ai_provider else settings.AI_PROVIDER
    )

    try:
        if provider_name == "ollama":
            provider = OllamaProvider(
                base_url=current_user.settings.custom_base_url if current_user and current_user.settings else None,
                model=current_user.settings.custom_model if current_user and current_user.settings else None
            )
            data = await provider.explain(req.code, req.language, req.mode)
        else:
            provider = OpenAICompatibleProvider(
                base_url=current_user.settings.custom_base_url if current_user and current_user.settings else None,
                model=current_user.settings.custom_model if current_user and current_user.settings else None
            )
            data = await provider.explain(req.code, req.language, req.mode)

        return ExplanationResponse(
            purpose=data.get("purpose", "Analysis of code structure"),
            components=data.get("components", []),
            control_flow=data.get("control_flow", ""),
            complexity=data.get("complexity", {}),
            potential_bugs=data.get("potential_bugs", []),
            improvements=data.get("improvements", []),
            full_explanation=data.get("full_explanation", "Explanation generated.")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Code explanation failed: {str(e)}"
        )
