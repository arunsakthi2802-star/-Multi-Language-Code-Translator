import time
import json
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Translation, User
from app.schemas.schemas import TranslationRequest, TranslationResponse
from app.providers.gemini import GeminiProvider
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.providers.ollama import OllamaProvider
from app.providers.rule_based import RuleBasedTranslationProvider
from app.translators.language_registry import get_language

class TranslationService:
    @classmethod
    async def translate(
        cls,
        req: TranslationRequest,
        db: Session,
        current_user: Optional[User] = None
    ) -> TranslationResponse:
        start_time = time.time()
        
        # Language validation
        source_info = get_language(req.source_language)
        target_info = get_language(req.target_language)
        if not source_info:
            raise ValueError(f"Unsupported source language: '{req.source_language}'.")
        if not target_info:
            raise ValueError(f"Unsupported target language: '{req.target_language}'.")

        # Determine effective provider
        # User settings preference or request override or system default
        provider_name = req.provider or (
            current_user.settings.ai_provider if current_user and current_user.settings and current_user.settings.ai_provider else settings.AI_PROVIDER
        )

        translated_code = ""
        warnings: List[str] = []
        conversion_notes: List[str] = []
        explanation = ""
        suggested_tests: List[str] = []
        model_name = None
        status = "completed"

        if provider_name == "rule_based":
            # Check if pair supported
            if not RuleBasedTranslationProvider.is_pair_supported(req.source_language, req.target_language):
                raise ValueError(
                    f"Rule-based engine only supports Python <-> JavaScript/TypeScript and Python -> C. "
                    f"Please switch provider to Gemini, OpenAI or Ollama to translate from {source_info.name} to {target_info.name}."
                )
            result = RuleBasedTranslationProvider.translate(
                req.source_code,
                req.source_language,
                req.target_language,
                req.options.dict() if req.options else {}
            )
            translated_code = result.translated_code
            warnings = result.warnings
            conversion_notes = result.notes
            explanation = "Deterministic rule-based translation applied."
            status = "partial" if result.is_partial else "completed"
            model_name = "rule_based_engine_v1"

        elif provider_name == "gemini":
            gemini_provider = GeminiProvider(
                model=current_user.settings.custom_model if current_user and current_user.settings and current_user.settings.custom_model else None
            )
            try:
                res = await gemini_provider.translate(
                    source_code=req.source_code,
                    source_lang=source_info.name,
                    target_lang=target_info.name,
                    style=req.style,
                    options=req.options.dict() if req.options else {}
                )
                translated_code = res.get("translated_code", "")
                warnings = res.get("warnings", [])
                conversion_notes = res.get("conversion_notes", [])
                explanation = res.get("explanation", "")
                suggested_tests = res.get("suggested_tests", [])
                model_name = gemini_provider.model
            except Exception as e:
                # Fallback to rule based if possible
                if RuleBasedTranslationProvider.is_pair_supported(req.source_language, req.target_language):
                    try:
                        rb_res = RuleBasedTranslationProvider.translate(
                            req.source_code, req.source_language, req.target_language, req.options.dict() if req.options else {}
                        )
                        translated_code = rb_res.translated_code
                        warnings = [f"Gemini provider failed ({str(e)}). Used deterministic rule-based fallback instead."] + rb_res.warnings
                        conversion_notes = rb_res.notes
                        explanation = "Fell back to rule-based engine due to Gemini error."
                        provider_name = "rule_based_fallback"
                        model_name = "rule_based_v1"
                        status = "partial" if rb_res.is_partial else "completed"
                    except Exception:
                        raise RuntimeError(f"Translation failed: {str(e)}")
                else:
                    raise RuntimeError(f"Gemini Translation failed: {str(e)}")

        elif provider_name == "ollama":
            ollama_provider = OllamaProvider(
                base_url=current_user.settings.custom_base_url if current_user and current_user.settings else None,
                model=current_user.settings.custom_model if current_user and current_user.settings else None
            )
            try:
                res = await ollama_provider.translate(
                    source_code=req.source_code,
                    source_lang=source_info.name,
                    target_lang=target_info.name,
                    style=req.style,
                    options=req.options.dict() if req.options else {}
                )
                translated_code = res.get("translated_code", "")
                warnings = res.get("warnings", [])
                conversion_notes = res.get("conversion_notes", [])
                explanation = res.get("explanation", "")
                suggested_tests = res.get("suggested_tests", [])
                model_name = ollama_provider.model
            except Exception as e:
                status = "failed"
                raise RuntimeError(f"Ollama translation failed: {str(e)}")

        else: # openai
            ai_provider = OpenAICompatibleProvider(
                base_url=current_user.settings.custom_base_url if current_user and current_user.settings and current_user.settings.custom_base_url else None,
                model=current_user.settings.custom_model if current_user and current_user.settings and current_user.settings.custom_model else None
            )
            try:
                res = await ai_provider.translate(
                    source_code=req.source_code,
                    source_lang=source_info.name,
                    target_lang=target_info.name,
                    style=req.style,
                    options=req.options.dict() if req.options else {}
                )
                translated_code = res.get("translated_code", "")
                warnings = res.get("warnings", [])
                conversion_notes = res.get("conversion_notes", [])
                explanation = res.get("explanation", "")
                suggested_tests = res.get("suggested_tests", [])
                model_name = ai_provider.model
            except Exception as e:
                # Check if rule based fallback is available
                if RuleBasedTranslationProvider.is_pair_supported(req.source_language, req.target_language):
                    try:
                        rb_res = RuleBasedTranslationProvider.translate(
                            req.source_code, req.source_language, req.target_language, req.options.dict() if req.options else {}
                        )
                        translated_code = rb_res.translated_code
                        warnings = [f"AI provider failed ({str(e)}). Used deterministic rule-based fallback instead."] + rb_res.warnings
                        conversion_notes = rb_res.notes
                        explanation = "Fell back to rule-based engine due to AI provider error."
                        provider_name = "rule_based_fallback"
                        model_name = "rule_based_v1"
                        status = "partial" if rb_res.is_partial else "completed"
                    except Exception:
                        raise RuntimeError(f"Translation failed: {str(e)}")
                else:
                    raise RuntimeError(f"AI Translation failed: {str(e)}")

        duration_ms = int((time.time() - start_time) * 1000)

        # Persist in DB if user is authenticated and has save_history enabled
        record_id = None
        if current_user:
            save_history = True
            if current_user.settings and current_user.settings.save_history is False:
                save_history = False
            
            if save_history:
                record = Translation(
                    user_id=current_user.id,
                    source_language=source_info.id,
                    target_language=target_info.id,
                    source_code=req.source_code,
                    translated_code=translated_code,
                    provider=provider_name,
                    model_name=model_name,
                    status=status,
                    warnings=json.dumps(warnings) if warnings else None,
                    explanation=explanation,
                    duration_ms=duration_ms
                )
                db.add(record)
                db.commit()
                db.refresh(record)
                record_id = record.id

        return TranslationResponse(
            id=record_id,
            source_language=source_info.id,
            target_language=target_info.id,
            source_code=req.source_code,
            translated_code=translated_code,
            provider=provider_name,
            model_name=model_name,
            status=status,
            warnings=warnings,
            conversion_notes=conversion_notes,
            explanation=explanation,
            suggested_tests=suggested_tests,
            duration_ms=duration_ms
        )
