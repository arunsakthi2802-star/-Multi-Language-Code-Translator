from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class TranslationProvider(ABC):
    @abstractmethod
    async def translate(
        self,
        source_code: str,
        source_lang: str,
        target_lang: str,
        style: str = "idiomatic",
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Translates source code to target language.
        Returns dict with: translated_code, explanation, conversion_notes, warnings, suggested_tests
        """
        pass

    @abstractmethod
    async def explain(
        self,
        code: str,
        language: str,
        mode: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Explains code in the requested mode.
        """
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """
        Performs genuine health check on the provider.
        """
        pass
