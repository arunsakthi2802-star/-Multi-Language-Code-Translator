import shutil
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    # Genuine DB check
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    has_docker = shutil.which("docker") is not None
    has_node = shutil.which("node") is not None

    return {
        "status": "online" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "database": "connected" if db_ok else "disconnected",
        "ai_provider_configured": settings.AI_PROVIDER,
        "openai_key_present": bool(settings.OPENAI_API_KEY),
        "sandbox_docker_available": has_docker,
        "node_compiler_available": has_node,
        "environment": settings.ENV,
        "version": "1.0.0"
    }
