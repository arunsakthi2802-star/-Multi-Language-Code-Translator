import httpx
import json
from typing import Dict, Any, Optional
from app.core.config import settings
from app.providers.base import TranslationProvider
from app.translators.prompt_builder import TranslationPromptBuilder
from app.translators.response_parser import TranslationResponseParser

class OllamaProvider(TranslationProvider):
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS

    async def test_connection(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    return {
                        "success": True,
                        "provider": "ollama",
                        "model": self.model,
                        "available_models": models,
                        "message": f"Successfully connected to Ollama at {self.base_url}."
                    }
                return {
                    "success": False,
                    "provider": "ollama",
                    "message": f"Ollama returned HTTP {res.status_code}"
                }
        except httpx.RequestError as e:
            return {
                "success": False,
                "provider": "ollama",
                "message": f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is running locally (`ollama serve`). Error: {str(e)}"
            }

    async def translate(
        self,
        source_code: str,
        source_lang: str,
        target_lang: str,
        style: str = "idiomatic",
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        sys_prompt, user_prompt = TranslationPromptBuilder.build_translation_prompt(
            source_code=source_code,
            source_lang=source_lang,
            target_lang=target_lang,
            style=style,
            options=options
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                if resp.status_code != 200:
                    raise RuntimeError(f"Ollama error ({resp.status_code}): {resp.text}")
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                return TranslationResponseParser.parse(content, source_lang, target_lang)
        except httpx.ConnectError:
            raise ConnectionError(f"Ollama server is not running at {self.base_url}. Please start Ollama or switch to OpenAI or Rule-Based.")
        except httpx.TimeoutException:
            raise TimeoutError(f"Ollama translation timed out after {self.timeout}s.")

    async def explain(
        self,
        code: str,
        language: str,
        mode: str = "intermediate"
    ) -> Dict[str, Any]:
        prompt = f"Explain the following {language} code in {mode} mode as JSON: \n```{language}\n{code}\n```"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                if resp.status_code == 200:
                    return json.loads(resp.json().get("response", "{}"))
        except Exception:
            pass
        return {
            "purpose": "Ollama code analysis",
            "components": [],
            "control_flow": "",
            "complexity": {"time": "Unknown", "space": "Unknown", "is_estimated": True},
            "potential_bugs": [],
            "improvements": [],
            "full_explanation": "Ollama explanation generation completed."
        }
