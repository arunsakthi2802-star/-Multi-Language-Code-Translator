import sys
from pathlib import Path

# Add backend directory to sys.path for Vercel Serverless Function runtime
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.main import app
except Exception as e:
    # Fallback minimal app if imported outside environment
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/v1/health")
    def health():
        return {"status": "ok", "error": str(e)}
