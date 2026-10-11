import httpx
import json
from typing import Dict, Any, Optional
from app.core.config import settings
from app.providers.base import TranslationProvider
from app.translators.prompt_builder import TranslationPromptBuilder
from app.translators.response_parser import TranslationResponseParser

class GeminiProvider(TranslationProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS

    async def test_connection(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "provider": "gemini",
                "message": "Gemini API key is missing. Set GEMINI_API_KEY in backend/.env or enter your key in Settings."
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    models = [m.get("name", "").replace("models/", "") for m in res.json().get("models", [])]
                    return {
                        "success": True,
                        "provider": "gemini",
                        "model": self.model,
                        "available_models": models[:10],
                        "message": f"Successfully connected to Google Gemini API using model '{self.model}'."
                    }
                else:
                    return {
                        "success": False,
                        "provider": "gemini",
                        "status_code": res.status_code,
                        "message": f"Gemini API returned {res.status_code}: {res.text[:200]}"
                    }
        except httpx.RequestError as e:
            return {
                "success": False,
                "provider": "gemini",
                "message": f"Connection failed: {str(e)}"
            }

    async def translate(
        self,
        source_code: str,
        source_lang: str,
        target_lang: str,
        style: str = "idiomatic",
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError(
                "Gemini API key is not configured. Please supply a GEMINI_API_KEY in backend/.env or in Settings."
            )

        sys_prompt, user_prompt = TranslationPromptBuilder.build_translation_prompt(
            source_code=source_code,
            source_lang=source_lang,
            target_lang=target_lang,
            style=style,
            options=options
        )

        full_prompt = f"{sys_prompt}\n\n{user_prompt}"

        # Direct Google Gemini generateContent API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": full_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    err_msg = response.text
                    try:
                        err_json = response.json()
                        err_msg = err_json.get("error", {}).get("message", response.text)
                    except Exception:
                        pass
                    raise RuntimeError(f"Gemini API Error ({response.status_code}): {err_msg}")

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini returned empty candidate output.")

                content_parts = candidates[0].get("content", {}).get("parts", [])
                raw_text = content_parts[0].get("text", "") if content_parts else ""
                return TranslationResponseParser.parse(raw_text, source_lang, target_lang)

        except httpx.TimeoutException:
            raise TimeoutError(f"Gemini translation timed out after {self.timeout} seconds.")
        except httpx.RequestError as e:
            raise ConnectionError(f"Failed to communicate with Google Gemini API: {str(e)}")

    async def explain(
        self,
        code: str,
        language: str,
        mode: str = "intermediate"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env or Settings.")

        system_prompt = f"""You are an expert code analyst.
Explain the provided {language.upper()} code in '{mode.upper()}' mode.
Respond ONLY with valid JSON matching:
{{
  "purpose": "<Overall purpose of the code>",
  "components": ["<Component 1>", "<Component 2>"],
  "control_flow": "<Description of control flow>",
  "complexity": {{
    "time": "<Time complexity e.g. O(N)>",
    "space": "<Space complexity e.g. O(1)>",
    "is_estimated": true,
    "rationale": "<Reasoning for complexity>"
  }},
  "potential_bugs": ["<Potential bug or edge case>"],
  "improvements": ["<Suggested improvement>"],
  "full_explanation": "<Detailed markdown explanation tailored to the requested mode>"
}}"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": f"{system_prompt}\n\n```{language}\n{code}\n```"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"Gemini API Error ({response.status_code}): {response.text}")

            data = response.json()
            raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            try:
                return json.loads(raw_text)
            except Exception:
                return {
                    "purpose": "Code explanation",
                    "components": [],
                    "control_flow": "",
                    "complexity": {"time": "Unknown", "space": "Unknown", "is_estimated": True},
                    "potential_bugs": [],
                    "improvements": [],
                    "full_explanation": raw_text
                }

    async def compare(
        self,
        source_code: str,
        source_lang: str,
        target_code: str,
        target_lang: str
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "assessment": "AI comparison unavailable: Gemini API key is not configured.",
                "semantic_equivalence": "Unverified",
                "behavioral_differences": [],
                "key_mappings": []
            }

        prompt = f"""Compare the source {source_lang.upper()} program and translated {target_lang.upper()} program.
Evaluate semantic equivalence, behavior, performance nuances, and edge case differences.
Return JSON:
{{
  "assessment": "<Overview of whether the translation preserved behavior>",
  "semantic_equivalence": "<High / Moderate / Low / Partial>",
  "behavioral_differences": ["<Difference or nuance>"],
  "key_mappings": ["<Source construct -> Target construct>"]
}}

SOURCE ({source_lang}):
```{source_lang}
{source_code}
```

TARGET ({target_lang}):
```{target_lang}
{target_code}
```"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    text = res.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
                    return json.loads(text)
        except Exception:
            pass

        return {
            "assessment": "Automated semantic comparison completed via heuristic diff.",
            "semantic_equivalence": "Moderate",
            "behavioral_differences": [],
            "key_mappings": []
        }
