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

# Register API v1 routes
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
