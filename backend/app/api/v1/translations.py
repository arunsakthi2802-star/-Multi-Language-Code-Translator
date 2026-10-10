from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.session import get_db
from app.models.models import Translation, User, Project
from app.schemas.schemas import (
    TranslationRequest, TranslationResponse, TranslationRecordOut
)
from app.api.dependencies import get_current_user, get_current_user_optional
from app.services.translation_service import TranslationService
from app.translators.language_registry import list_languages, detect_language, get_language

router = APIRouter(prefix="/translations", tags=["Translations"])

@router.get("/languages")
def get_languages():
    return list_languages()

@router.post("/detect-language")
def detect_code_language(payload: dict):
    code = payload.get("code", "")
    return detect_language(code)

@router.post("", response_model=TranslationResponse)
async def create_translation(
    req: TranslationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    try:
        return await TranslationService.translate(req, db, current_user)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except (ConnectionError, TimeoutError) as ce:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=str(ce))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("", response_model=List[TranslationRecordOut])
def get_user_translations(
    source_language: Optional[str] = None,
    target_language: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_order: str = Query("newest", pattern="^(newest|oldest)$"),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Translation).filter(Translation.user_id == current_user.id)

    if source_language:
        query = query.filter(Translation.source_language == source_language.lower())
    if target_language:
        query = query.filter(Translation.target_language == target_language.lower())
    if status_filter:
        query = query.filter(Translation.status == status_filter)
    if search:
        query = query.filter(Translation.source_code.ilike(f"%{search}%") | Translation.translated_code.ilike(f"%{search}%"))

    if sort_order == "oldest":
        query = query.order_by(Translation.created_at.asc())
    else:
        query = query.order_by(Translation.created_at.desc())

    return query.offset(skip).limit(limit).all()

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total translations
    total = db.query(func.count(Translation.id)).filter(Translation.user_id == current_user.id).scalar() or 0
    success = db.query(func.count(Translation.id)).filter(Translation.user_id == current_user.id, Translation.status.in_(["completed", "partial"])).scalar() or 0
    failed = db.query(func.count(Translation.id)).filter(Translation.user_id == current_user.id, Translation.status == "failed").scalar() or 0
    saved_projects = db.query(func.count(Project.id)).filter(Project.user_id == current_user.id).scalar() or 0

    # Source language frequency
    source_freq = (
        db.query(Translation.source_language, func.count(Translation.id))
        .filter(Translation.user_id == current_user.id)
        .group_by(Translation.source_language)
        .order_by(desc(func.count(Translation.id)))
        .limit(5)
        .all()
    )

    # Target language frequency
    target_freq = (
        db.query(Translation.target_language, func.count(Translation.id))
        .filter(Translation.user_id == current_user.id)
        .group_by(Translation.target_language)
        .order_by(desc(func.count(Translation.id)))
        .limit(5)
        .all()
    )

    # Recent translations (last 5)
    recent = (
        db.query(Translation)
        .filter(Translation.user_id == current_user.id)
        .order_by(Translation.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_translations": total,
        "successful_translations": success,
        "failed_translations": failed,
        "saved_projects": saved_projects,
        "top_source_languages": [{"language": row[0], "count": row[1]} for row in source_freq],
        "top_target_languages": [{"language": row[0], "count": row[1]} for row in target_freq],
        "recent_translations": [TranslationRecordOut.model_validate(t) for t in recent]
    }

@router.get("/{translation_id}", response_model=TranslationRecordOut)
def get_translation(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Translation).filter(Translation.id == translation_id, Translation.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Translation record not found.")
    return record

@router.delete("/{translation_id}")
def delete_translation(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Translation).filter(Translation.id == translation_id, Translation.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Translation record not found.")
    db.delete(record)
    db.commit()
    return {"message": "Translation deleted successfully."}

@router.delete("")
def clear_all_translations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Translation).filter(Translation.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All translation history deleted."}

@router.post("/{translation_id}/retry", response_model=TranslationResponse)
async def retry_translation(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Translation).filter(Translation.id == translation_id, Translation.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Translation record not found.")

    req = TranslationRequest(
        source_code=record.source_code,
        source_language=record.source_language,
        target_language=record.target_language
    )
    return await TranslationService.translate(req, db, current_user)
