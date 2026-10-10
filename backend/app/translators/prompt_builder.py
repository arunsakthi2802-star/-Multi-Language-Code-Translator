from typing import Dict, Any, Optional

class TranslationPromptBuilder:
    @staticmethod
    def build_translation_prompt(
        source_code: str,
        source_lang: str,
        target_lang: str,
        style: str = "idiomatic",
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        options = options or {}
        preserve_comments = options.get("preserve_comments", True)
        add_explanatory_comments = options.get("add_explanatory_comments", False)
        type_annotations = options.get("type_annotations", True)
        prefer_stdlib = options.get("prefer_stdlib", True)
        include_error_handling = options.get("include_error_handling", False)
        add_unit_tests = options.get("add_unit_tests", False)

        system_instructions = f"""You are a master multi-language compiler and polyglot software engineer.
Your task is to accurately translate source code from {source_lang.upper()} to {target_lang.upper()}.

CRITICAL RULES:
1. Preserve the program's algorithmic behavior, logic, and output fidelity.
2. Respect the idiomatic style and conventions of {target_lang}.
3. Map standard library functions and data structures to the appropriate equivalents in {target_lang}.
4. Handle language differences (e.g. 0-indexed vs 1-indexed, static vs dynamic typing, memory management) accurately.
5. Do NOT invent phantom libraries or nonexistent functions. Use standard libraries whenever possible.
6. If any feature cannot be mapped 100% cleanly, note this in the 'warnings' and provide the best idiomatic equivalent.
7. Style preference: {style} (options: 'preserve_structure', 'idiomatic', 'beginner_friendly', 'performance', 'oop', 'functional').
8. Preserve comments: {preserve_comments}.
9. Add explanatory comments: {add_explanatory_comments}.
10. Generate strict type annotations: {type_annotations}.
11. Prefer standard library: {prefer_stdlib}.
12. Include error handling where idiomatic: {include_error_handling}.
13. Generate basic unit tests: {add_unit_tests}.

OUTPUT FORMAT:
You MUST respond ONLY with a valid JSON object matching this schema, without markdown formatting or surrounding backticks:
{{
  "source_language": "{source_lang}",
  "target_language": "{target_lang}",
  "translated_code": "<The complete translated code in {target_lang}>",
  "explanation": "<Clear, concise summary of the translated code and conversion approach>",
  "conversion_notes": ["<Key architectural or algorithmic mapping decision>"],
  "warnings": ["<Any caveats, potential runtime differences, or dependencies required>"],
  "suggested_tests": ["<Brief description or code of test case verifying correctness>"]
}}
"""

        user_content = f"""SOURCE CODE ({source_lang.upper()}):
```{source_lang}
{source_code}
```

Translate the above code into {target_lang.upper()} following all instructions. Return strictly the raw JSON object."""

        return system_instructions, user_content
