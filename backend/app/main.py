from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.models import * # ensure models registered before create_all

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.translations import router as translations_router
from app.api.v1.validation import router as validation_router
from app.api.v1.explanations import router as explanations_router
from app.api.v1.comparisons import router as comparisons_router
from app.api.v1.projects import router as projects_router
from app.api.v1.templates import router as templates_router
from app.api.v1.execution import router as execution_router
from app.api.v1.settings import router as settings_router
from app.api.v1.system import router as system_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Programming Language Conversion Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENV
    }

api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(translations_router, prefix=api_prefix)
app.include_router(validation_router, prefix=api_prefix)
app.include_router(explanations_router, prefix=api_prefix)
app.include_router(comparisons_router, prefix=api_prefix)
app.include_router(projects_router, prefix=api_prefix)
app.include_router(templates_router, prefix=api_prefix)
app.include_router(execution_router, prefix=api_prefix)
app.include_router(settings_router, prefix=api_prefix)
app.include_router(system_router, prefix=api_prefix)

# Unified Frontend Serving: Serve Vite production build directly from FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

POSSIBLE_DIST_DIRS = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent.parent / "static",
]

FRONTEND_DIST = None
for dist_path in POSSIBLE_DIST_DIRS:
    if dist_path.exists() and (dist_path / "index.html").exists():
        FRONTEND_DIST = dist_path
        break

if FRONTEND_DIST:
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = FRONTEND_DIST / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

