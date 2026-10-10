from typing import Dict, List, Optional
from pydantic import BaseModel

class LanguageInfo(BaseModel):
    id: str
    name: str
    category: str # 'general', 'markup', 'styling', 'shell', 'query'
    file_extensions: List[str]
    editor_mode: str # Monaco editor language identifier
    has_syntax_validation: bool
    has_sandbox_execution: bool
    description: str

LANGUAGES: Dict[str, LanguageInfo] = {
    "python": LanguageInfo(
        id="python",
        name="Python",
        category="general",
        file_extensions=[".py"],
        editor_mode="python",
        has_syntax_validation=True,
        has_sandbox_execution=True,
        description="High-level, dynamically typed language emphasizing readability."
    ),
    "javascript": LanguageInfo(
        id="javascript",
        name="JavaScript",
        category="general",
        file_extensions=[".js", ".mjs"],
        editor_mode="javascript",
        has_syntax_validation=True,
        has_sandbox_execution=True,
        description="Core language of the web with asynchronous event-driven model."
    ),
    "typescript": LanguageInfo(
        id="typescript",
        name="TypeScript",
        category="general",
        file_extensions=[".ts"],
        editor_mode="typescript",
        has_syntax_validation=True,
        has_sandbox_execution=False,
        description="Statically typed superset of JavaScript compiling to plain JS."
    ),
    "java": LanguageInfo(
        id="java",
        name="Java",
        category="general",
        file_extensions=[".java"],
        editor_mode="java",
        has_syntax_validation=True,
        has_sandbox_execution=True,
        description="Class-based, object-oriented language for cross-platform apps."
    ),
    "c": LanguageInfo(
        id="c",
        name="C",
        category="general",
        file_extensions=[".c", ".h"],
        editor_mode="c",
        has_syntax_validation=True,
        has_sandbox_execution=True,
        description="Low-level procedural language with direct memory control."
    ),
    "cpp": LanguageInfo(
        id="cpp",
        name="C++",
        category="general",
        file_extensions=[".cpp", ".hpp", ".cc"],
        editor_mode="cpp",
        has_syntax_validation=True,
        has_sandbox_execution=True,
        description="High-performance language supporting object-oriented and generic idioms."
    ),
    "csharp": LanguageInfo(
        id="csharp",
        name="C#",
        category="general",
        file_extensions=[".cs"],
        editor_mode="csharp",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Modern, type-safe, object-oriented language by Microsoft."
    ),
    "go": LanguageInfo(
        id="go",
        name="Go",
        category="general",
        file_extensions=[".go"],
        editor_mode="go",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Statically typed compiled language designed for concurrency and scalability."
    ),
    "rust": LanguageInfo(
        id="rust",
        name="Rust",
        category="general",
        file_extensions=[".rs"],
        editor_mode="rust",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Memory-safe, high-performance systems language with ownership model."
    ),
    "php": LanguageInfo(
        id="php",
        name="PHP",
        category="general",
        file_extensions=[".php"],
        editor_mode="php",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Widely-used server-side scripting language for web development."
    ),
    "ruby": LanguageInfo(
        id="ruby",
        name="Ruby",
        category="general",
        file_extensions=[".rb"],
        editor_mode="ruby",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Dynamic, open source programming language with a focus on simplicity."
    ),
    "kotlin": LanguageInfo(
        id="kotlin",
        name="Kotlin",
        category="general",
        file_extensions=[".kt", ".kts"],
        editor_mode="kotlin",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Concise, safe, interoperable language targeting the JVM and Android."
    ),
    "swift": LanguageInfo(
        id="swift",
        name="Swift",
        category="general",
        file_extensions=[".swift"],
        editor_mode="swift",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Powerful and intuitive programming language for iOS, macOS, and server."
    ),
    "dart": LanguageInfo(
        id="dart",
        name="Dart",
        category="general",
        file_extensions=[".dart"],
        editor_mode="dart",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Client-optimized language for fast apps on any platform (Flutter)."
    ),
    "r": LanguageInfo(
        id="r",
        name="R",
        category="general",
        file_extensions=[".r", ".R"],
        editor_mode="r",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Language and environment for statistical computing and graphics."
    ),
    "sql": LanguageInfo(
        id="sql",
        name="SQL",
        category="query",
        file_extensions=[".sql"],
        editor_mode="sql",
        has_syntax_validation=True,
        has_sandbox_execution=False,
        description="Standard language for storing, manipulating and retrieving database data."
    ),
    "bash": LanguageInfo(
        id="bash",
        name="Bash",
        category="shell",
        file_extensions=[".sh", ".bash"],
        editor_mode="shell",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Unix shell and command language for system automation."
    ),
    "powershell": LanguageInfo(
        id="powershell",
        name="PowerShell",
        category="shell",
        file_extensions=[".ps1"],
        editor_mode="powershell",
        has_syntax_validation=False,
        has_sandbox_execution=False,
        description="Task automation and configuration management framework by Microsoft."
    ),
    "html": LanguageInfo(
        id="html",
        name="HTML",
        category="markup",
        file_extensions=[".html", ".htm"],
        editor_mode="html",
        has_syntax_validation=True,
        has_sandbox_execution=False,
        description="Standard markup language for documents designed to be displayed in a web browser."
    ),
    "css": LanguageInfo(
        id="css",
        name="CSS",
        category="styling",
        file_extensions=[".css"],
        editor_mode="css",
        has_syntax_validation=True,
        has_sandbox_execution=False,
        description="Style sheet language used for describing the presentation of a document."
    ),
}

def get_language(lang_id: str) -> Optional[LanguageInfo]:
    if not lang_id:
        return None
    return LANGUAGES.get(lang_id.lower().strip())

def list_languages() -> List[LanguageInfo]:
    return list(LANGUAGES.values())

def detect_language(code: str) -> dict:
    """
    Heuristic rule-based detection with confidence score.
    Returns { language: str, confidence: float, candidates: list }
    """
    code_stripped = code.strip()
    if not code_stripped:
        return {"language": "python", "confidence": 0.0, "candidates": []}

    scores: Dict[str, float] = {k: 0.0 for k in LANGUAGES.keys()}

    # Distinctive signatures
    # Python
    if "def " in code and ":" in code:
        scores["python"] += 3.0
    if "import " in code and ("from " in code or "math" in code or "sys" in code or "os" in code):
        scores["python"] += 2.0
    if "print(" in code and not ";" in code:
        scores["python"] += 2.5
    if "elif " in code or "None" in code or "True" in code or "False" in code:
        scores["python"] += 2.0

    # JavaScript / TypeScript
    if "console.log(" in code:
        scores["javascript"] += 3.0
        scores["typescript"] += 3.0
    if "const " in code or "let " in code:
        scores["javascript"] += 2.5
        scores["typescript"] += 2.5
    if "function " in code and ("{" in code):
        scores["javascript"] += 2.0
        scores["typescript"] += 2.0
    if "interface " in code or ": string" in code or ": number" in code or ": boolean" in code or "type " in code:
        scores["typescript"] += 4.0

    # Java
    if "public class " in code or "public static void main" in code:
        scores["java"] += 5.0
    if "System.out.println(" in code:
        scores["java"] += 4.0

    # C / C++
    if "#include <stdio.h>" in code or "printf(" in code:
        scores["c"] += 4.0
    if "#include <iostream>" in code or "std::cout" in code:
        scores["cpp"] += 5.0

    # C#
    if "using System;" in code or "Console.WriteLine(" in code or "namespace " in code:
        scores["csharp"] += 5.0

    # Go
    if "package main" in code or "fmt.Println(" in code or "func " in code and not "{" in code:
        scores["go"] += 5.0

    # Rust
    if "fn main()" in code or "println!(" in code or "let mut " in code:
        scores["rust"] += 5.0

    # PHP
    if "<?php" in code or "echo $" in code or "function " in code and "$" in code:
        scores["php"] += 5.0

    # Ruby
    if "def " in code and "end" in code and not ":" in code:
        scores["ruby"] += 4.0
    if "puts " in code or "elsif " in code:
        scores["ruby"] += 3.0

    # SQL
    sql_keywords = ["SELECT ", "FROM ", "WHERE ", "INSERT INTO ", "CREATE TABLE ", "UPDATE "]
    if any(k in code.upper() for k in sql_keywords):
        scores["sql"] += 4.5

    # HTML
    if "<!DOCTYPE html>" in code or "<html" in code or ("<div" in code and "</div>" in code):
        scores["html"] += 5.0

    # CSS
    if "{" in code and "}" in code and (":" in code and ";" in code) and ("margin:" in code or "color:" in code or "background:" in code):
        scores["css"] += 4.0

    # Bash / PowerShell
    if code.startswith("#!/bin/bash") or code.startswith("#!/bin/sh") or "echo " in code:
        scores["bash"] += 3.0
    if "Write-Host" in code or "Get-Process" in code or "$PSVersionTable" in code:
        scores["powershell"] += 5.0

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_lang, best_score = sorted_scores[0]

    confidence = min(round(best_score / 5.0, 2), 0.95) if best_score > 0 else 0.2
    if confidence == 0.2:
        best_lang = "python"

    return {
        "language": best_lang,
        "confidence": confidence,
        "candidates": [{"language": lang, "score": s} for lang, s in sorted_scores[:3] if s > 0]
    }
