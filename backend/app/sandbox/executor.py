import subprocess
import shutil
import tempfile
import os
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.config import settings

class ExecutionRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""

class ExecutionResponse(BaseModel):
    success: bool
    status: str # 'completed', 'error', 'timeout', 'disabled'
    stdout: str
    stderr: str
    exit_code: Optional[int] = None
    duration_ms: int = 0
    message: str

class SandboxExecutor:
    @classmethod
    def get_capabilities(cls) -> Dict[str, Any]:
        docker_available = shutil.which("docker") is not None
        enabled = settings.ENABLE_SANDBOX and docker_available

        return {
            "sandbox_enabled": enabled,
            "docker_installed": docker_available,
            "supported_languages": ["python", "javascript", "c", "cpp", "java"] if enabled else [],
            "status_message": (
                "Isolated Docker sandbox is active." if enabled else
                "Docker is not detected or ENABLE_SANDBOX is false. Execution is safely disabled by policy to prevent unisolated host execution."
            ),
            "limits": {
                "timeout_seconds": settings.EXECUTION_TIMEOUT_SECONDS,
                "memory_limit_mb": settings.EXECUTION_MEMORY_LIMIT_MB,
                "network_disabled": True
            }
        }

    @classmethod
    async def execute(cls, language: str, code: str, stdin: str = "") -> ExecutionResponse:
        caps = cls.get_capabilities()
        if not caps["sandbox_enabled"]:
            return ExecutionResponse(
                success=False,
                status="disabled",
                stdout="",
                stderr="",
                exit_code=None,
                duration_ms=0,
                message="Code execution is disabled: isolated Docker sandbox is not configured on this host. Unsandboxed host execution is strictly prohibited for security."
            )

        lang = language.lower().strip()
        if lang not in caps["supported_languages"]:
            return ExecutionResponse(
                success=False,
                status="disabled",
                stdout="",
                stderr="",
                exit_code=None,
                duration_ms=0,
                message=f"Language '{lang}' is not supported in the sandbox environment."
            )

        # Docker container images
        image_map = {
            "python": ("python:3.11-alpine", ["python", "/app/code.py"]),
            "javascript": ("node:20-alpine", ["node", "/app/code.js"]),
            "c": ("gcc:latest", ["sh", "-c", "gcc /app/code.c -o /app/out && /app/out"]),
            "cpp": ("gcc:latest", ["sh", "-c", "g++ /app/code.cpp -o /app/out && /app/out"]),
            "java": ("openjdk:17-alpine", ["sh", "-c", "cd /app && javac Main.java && java Main"]),
        }

        image, cmd = image_map[lang]
        ext_map = {"python": ".py", "javascript": ".js", "c": ".c", "cpp": ".cpp", "java": ".java"}
        filename = "Main.java" if lang == "java" else f"code{ext_map[lang]}"

        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            start_time = time.time()
            docker_cmd = [
                "docker", "run", "--rm",
                "--network", "none",
                "--memory", f"{settings.EXECUTION_MEMORY_LIMIT_MB}m",
                "--cpus", "0.5",
                "-v", f"{temp_dir}:/app:ro",
                image,
                *cmd
            ]

            try:
                proc = subprocess.run(
                    docker_cmd,
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=settings.EXECUTION_TIMEOUT_SECONDS
                )
                duration = int((time.time() - start_time) * 1000)
                return ExecutionResponse(
                    success=(proc.returncode == 0),
                    status="completed" if proc.returncode == 0 else "error",
                    stdout=proc.stdout[:10000],
                    stderr=proc.stderr[:10000],
                    exit_code=proc.returncode,
                    duration_ms=duration,
                    message="Execution completed in isolated container."
                )
            except subprocess.TimeoutExpired:
                duration = int((time.time() - start_time) * 1000)
                return ExecutionResponse(
                    success=False,
                    status="timeout",
                    stdout="",
                    stderr=f"Execution timed out after {settings.EXECUTION_TIMEOUT_SECONDS} seconds.",
                    exit_code=-1,
                    duration_ms=duration,
                    message="Process exceeded execution time limit."
                )
            except Exception as e:
                duration = int((time.time() - start_time) * 1000)
                return ExecutionResponse(
                    success=False,
                    status="error",
                    stdout="",
                    stderr=str(e),
                    exit_code=1,
                    duration_ms=duration,
                    message=f"Sandbox error: {str(e)}"
                )
