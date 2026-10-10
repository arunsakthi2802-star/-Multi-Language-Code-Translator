from fastapi import APIRouter
from app.sandbox.executor import SandboxExecutor, ExecutionRequest, ExecutionResponse

router = APIRouter(prefix="/execution", tags=["Code Execution"])

@router.get("/capabilities")
def get_execution_capabilities():
    return SandboxExecutor.get_capabilities()

@router.post("", response_model=ExecutionResponse)
async def execute_code(req: ExecutionRequest):
    return await SandboxExecutor.execute(req.language, req.code, req.stdin or "")
