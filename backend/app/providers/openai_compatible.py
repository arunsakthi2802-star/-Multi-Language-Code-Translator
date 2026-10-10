import httpx
import json
from typing import Dict, Any, Optional
from app.core.config import settings
from app.providers.base import TranslationProvider
from app.translators.prompt_builder import TranslationPromptBuilder
from app.translators.response_parser import TranslationResponseParser

class OpenAICompatibleProvider(TranslationProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = (base_url or settings.OPENAI_BASE_URL).rstrip("/")
        self.model = model or settings.OPENAI_MODEL
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS

    async def test_connection(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "provider": "openai",
                "message": "OpenAI API key is missing. Please configure OPENAI_API_KEY in settings or .env file."
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/models", headers=headers)
                if res.status_code == 200:
                    return {
                        "success": True,
                        "provider": "openai",
                        "model": self.model,
                        "message": f"Successfully connected to {self.base_url} using model {self.model}."
                    }
                else:
                    return {
                        "success": False,
                        "provider": "openai",
                        "status_code": res.status_code,
                        "message": f"API returned status {res.status_code}: {res.text[:200]}"
                    }
        except httpx.RequestError as e:
            return {
                "success": False,
                "provider": "openai",
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
            raise ValueError("OpenAI API key is not configured. Please supply an API key in settings or use the Rule-Based fallback.")

        sys_prompt, user_prompt = TranslationPromptBuilder.build_translation_prompt(
            source_code=source_code,
            source_lang=source_lang,
            target_lang=target_lang,
            style=style,
            options=options
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code != 200:
                    # If response_format json_object is not supported by model, retry without it
                    if "response_format" in response.text:
                        del payload["response_format"]
                        retry_resp = await client.post(
                            f"{self.base_url}/chat/completions",
                            headers=headers,
                            json=payload
                        )
                        if retry_resp.status_code == 200:
                            content = retry_resp.json()["choices"][0]["message"]["content"]
                            return TranslationResponseParser.parse(content, source_lang, target_lang)
                    
                    err_msg = response.text
                    try:
                        err_json = response.json()
                        err_msg = err_json.get("error", {}).get("message", response.text)
                    except Exception:
                        pass
                    raise RuntimeError(f"OpenAI API Error ({response.status_code}): {err_msg}")

                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return TranslationResponseParser.parse(content, source_lang, target_lang)

        except httpx.TimeoutException:
            raise TimeoutError(f"Translation request timed out after {self.timeout} seconds.")
        except httpx.RequestError as e:
            raise ConnectionError(f"Failed to communicate with OpenAI API: {str(e)}")

    async def explain(
        self,
        code: str,
        language: str,
        mode: str = "intermediate"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OpenAI API key is not configured. Please supply an API key in settings.")

        system_prompt = f"""You are an expert code analyst and programming educator.
Explain the provided {language.upper()} code in '{mode.upper()}' mode.
Modes available:
- 'beginner': Simple terms, no overly academic jargon, step-by-step intuition
- 'intermediate': Pragmatic engineering analysis, idioms, clean structure
- 'advanced': In-depth memory/performance, paradigms, subtleties
- 'line-by-line': Detailed walkthrough of each block/line
- 'algorithm-focused': Algorithm logic, invariant, invariants, data transformations
- 'complexity': Explicit Big-O time and space complexity with formal explanation
- 'functions': Function-by-function breakdown
- 'data-structures': Analysis of data models and structures

Respond ONLY with valid JSON matching:
{{
  "purpose": "<Overall purpose of the code>",
  "components": ["<Component or key section 1>", "<Component 2>"],
  "control_flow": "<Description of control flow and logic path>",
  "complexity": {{
    "time": "<Time complexity e.g. O(N) or Not applicable>",
    "space": "<Space complexity e.g. O(1) or Not applicable>",
    "is_estimated": true,
    "rationale": "<Reasoning for complexity>"
  }},
  "potential_bugs": ["<Potential bug or edge case>"],
  "improvements": ["<Suggested improvement or best practice>"],
  "full_explanation": "<Detailed markdown explanation tailored to the requested mode>"
}}"""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"```{language}\n{code}\n```"}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            if response.status_code != 200:
                raise RuntimeError(f"OpenAI API Error ({response.status_code}): {response.text}")

            content = response.json()["choices"][0]["message"]["content"]
            try:
                return json.loads(content)
            except Exception:
                return {
                    "purpose": "Code explanation",
                    "components": [],
                    "control_flow": "",
                    "complexity": {"time": "Unknown", "space": "Unknown", "is_estimated": True, "rationale": ""},
                    "potential_bugs": [],
                    "improvements": [],
                    "full_explanation": content
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
                "assessment": "AI comparison unavailable: OpenAI API key is not configured.",
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
}}"""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"SOURCE ({source_lang}):\n```{source_lang}\n{source_code}\n```\n\nTARGET ({target_lang}):\n```{target_lang}\n{target_code}\n```"}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    return json.loads(resp.json()["choices"][0]["message"]["content"])
        except Exception as e:
            pass

        return {
            "assessment": "Automated semantic comparison could not be completed with external provider.",
            "semantic_equivalence": "Unknown",
            "behavioral_differences": [],
            "key_mappings": []
        }
