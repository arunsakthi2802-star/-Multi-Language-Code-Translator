# Multi-Language Code Translator — AI-Powered Programming Language Conversion Platform

A production-style web application and developer-tool platform for translating, analyzing, validating, explaining, comparing, and safely testing source code across 20 programming languages.

Built with **FastAPI**, **React**, **TypeScript**, **Tailwind CSS**, **Monaco Editor**, and a provider-independent AI engine with deterministic rule-based fallbacks.

---

## 1. Project Overview

**CodePolyglot / Multi-Language Code Translator** allows software engineers to:
- Translate code between 20 programming languages while preserving algorithmic structure and idioms.
- Use **OpenAI-compatible APIs**, local **Ollama** models, or a deterministic **Rule-Based fallback engine**.
- Validate code syntax with host AST parsers (Python AST, Node.js `--check`, structural bracket analyzers).
- Deeply inspect and explain programs with 8 specialized analysis modes (Beginner, Intermediate, Advanced, Line-by-Line, Algorithm, Complexity, Functions, Data Structures).
- Compare source and translated code with line-level diff highlighting, unified patches, and AI semantic preservation assessments.
- Persist translations in a database with private user ownership, search, filtering, and retry capabilities.
- Organize translated applications into saved projects with tags, notes, and file downloads.
- Explore a rich library of common programming templates across multiple paradigms and difficulties.

---

## 2. Key Features

- **Dual Monaco Editor Workspace**: Side-by-side IDE experience with syntax highlighting, automatic indentation, folding, bracket matching, file upload, download, and copy.
- **Language Auto-Detection**: Heuristic language identification with confidence scoring.
- **Configurable Translation Styles**:
  - Idiomatic (target language best practices)
  - Preserve Structure (1:1 line mappings)
  - Beginner-Friendly (straightforward concepts)
  - Performance-Oriented (optimized execution)
  - Object-Oriented Conversion
  - Functional-Style Conversion
- **Fine-Grained Translation Flags**:
  - Preserve comments
  - Add explanatory comments
  - Generate strict type annotations
  - Prefer standard library
  - Include error handling
  - Generate unit tests
- **Deterministic Rule-Based Fallback Engine**:
  - Converts supported language pairs (Python <-> JavaScript/TypeScript, Python -> C) without requiring external AI API calls or paid credits.
  - Honestly detects and reports unsupported constructs.
- **Code Validation & Diagnostics**:
  - Python AST syntax compiler (built-in)
  - JavaScript / TypeScript syntax checker via Node.js `--check`
  - Structural bracket and balance analyzer
  - Host toolchain capability detection (reports whether compilers like GCC, Clang, Javac are installed)
- **Code Comparison & Semantic Assessment**:
  - Side-by-side and unified patch views
  - Line additions, deletions, and unchanged stats
  - AI semantic evaluation and caveat notes
- **Secure Authentication & Data Isolation**:
  - JWT tokens with bcrypt password hashing
  - User-isolated projects, settings, and translation records
  - Privacy option to disable persistent history storage
- **Interactive Dashboard**:
  - Real database metrics (total, successful, failed, projects)
  - Top source & target language charts via Recharts
  - Recent activity timeline with quick links

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8 & TypeScript
- **Styling**: Tailwind CSS v4 (dark IDE theme by default, accessible contrast)
- **Editor**: `@monaco-editor/react` (dual Monaco code editor)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Analytics**: Recharts
- **HTTP Client**: Native Fetch API with Bearer token authentication

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Data Validation**: Pydantic v2
- **ORM & DB**: SQLAlchemy 2.0 with SQLite (local development) and PostgreSQL compatibility
- **Security**: PyJWT, Bcrypt password hashing
- **Testing**: Pytest
- **HTTP Client**: HTTPX (async client for AI providers)

---

## 4. Supported Programming Languages

The application includes a built-in Language Registry supporting 20 languages:

| Language | Category | File Extension | Editor ID | Host Validation Support |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | General | `.py` | `python` | Python AST (Built-in) |
| **JavaScript** | General | `.js`, `.mjs` | `javascript` | Node.js `--check` |
| **TypeScript** | General | `.ts` | `typescript` | Node.js / Parser |
| **Java** | General | `.java` | `java` | javac (if installed) / Parser |
| **C** | General | `.c`, `.h` | `c` | GCC/Clang (if installed) / Parser |
| **C++** | General | `.cpp`, `.hpp` | `cpp` | G++/Clang++ (if installed) / Parser |
| **C#** | General | `.cs` | `csharp` | Structural Parser |
| **Go** | General | `.go` | `go` | go vet (if installed) / Parser |
| **Rust** | General | `.rs` | `rust` | rustc (if installed) / Parser |
| **PHP** | General | `.php` | `php` | Structural Parser |
| **Ruby** | General | `.rb` | `ruby` | Structural Parser |
| **Kotlin** | General | `.kt`, `.kts` | `kotlin` | Structural Parser |
| **Swift** | General | `.swift` | `swift` | Structural Parser |
| **Dart** | General | `.dart` | `dart` | Structural Parser |
| **R** | General | `.r` | `r` | Structural Parser |
| **SQL** | Query | `.sql` | `sql` | SQL Keyword Validator |
| **Bash** | Shell | `.sh`, `.bash` | `shell` | Shell Syntax Validator |
| **PowerShell** | Shell | `.ps1` | `powershell` | PowerShell Analyzer |
| **HTML** | Markup | `.html`, `.htm` | `html` | HTML Tag Validator |
| **CSS** | Styling | `.css` | `css` | CSS Property & Bracket Validator |

---

## 5. Folder Structure

```
ID_117 PROJECT/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py       # Auth & DB dependencies
│   │   │   └── v1/
│   │   │       ├── auth.py           # Login, Register, User profile
│   │   │       ├── translations.py   # Translation endpoints & stats
│   │   │       ├── validation.py     # Code syntax validation
│   │   │       ├── explanations.py   # AI code explanation
│   │   │       ├── comparisons.py    # Line diff & semantic comparison
│   │   │       ├── projects.py       # Project CRUD & duplicates
│   │   │       ├── templates.py      # Example code templates
│   │   │       ├── execution.py      # Sandbox execution
│   │   │       ├── settings.py       # Provider diagnostics & settings
│   │   │       └── system.py         # System health & status
│   │   ├── core/
│   │   │   ├── config.py             # Settings & .env loading
│   │   │   └── security.py           # Bcrypt & JWT tokens
│   │   ├── db/
│   │   │   └── session.py            # SQLite / SQLAlchemy engine
│   │   ├── models/
│   │   │   └── models.py             # User, Translation, Project, etc.
│   │   ├── providers/
│   │   │   ├── base.py               # Abstract provider interface
│   │   │   ├── openai_compatible.py  # OpenAI API client
│   │   │   ├── ollama.py             # Local Ollama client
│   │   │   └── rule_based.py         # Deterministic translation engine
│   │   ├── sandbox/
│   │   │   └── executor.py           # Docker isolation policy
│   │   ├── translators/
│   │   │   ├── language_registry.py  # 20 supported languages & detector
│   │   │   ├── prompt_builder.py     # Translation prompt builder
│   │   │   └── response_parser.py    # Robust JSON parser
│   │   ├── validators/
│   │   │   └── validator_service.py  # Multi-language static validator
│   │   └── main.py                   # FastAPI application entry point
│   ├── tests/
│   │   └── test_backend.py           # Pytest test suite
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx     # Shell layout
│   │   │       ├── Header.tsx        # System status & user menu
│   │   │       └── Sidebar.tsx       # Collapsible navigation
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # JWT authentication state
│   │   │   └── ThemeContext.tsx      # Dark / light theme toggle
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Real usage metrics & charts
│   │   │   ├── Translator.tsx        # Dual Monaco translator
│   │   │   ├── Explainer.tsx         # AI multi-mode code explainer
│   │   │   ├── Validator.tsx         # Diagnostics & syntax checker
│   │   │   ├── Comparison.tsx        # Diff & semantic evaluation
│   │   │   ├── History.tsx           # Translation records & filters
│   │   │   ├── Projects.tsx          # Saved projects workspace
│   │   │   ├── Templates.tsx         # Algorithm & template library
│   │   │   ├── Settings.tsx          # AI settings & connection test
│   │   │   ├── Login.tsx             # User login
│   │   │   └── Register.tsx          # User registration
│   │   ├── services/
│   │   │   └── api.ts                # API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Routing
│   │   ├── index.css                 # Design system tokens & Tailwind
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── venv/                             # Python virtual environment
├── run_local.ps1                     # One-click Windows runner
├── .gitignore
└── README.md
```

---

## 6. Windows Local Execution Instructions

### Prerequisites
- **Python**: 3.11 or newer (Python 3.14+ supported)
- **Node.js**: v18 or newer (v24+ tested)
- **npm**: v9+ (npm 11+ tested)

### One-Click Startup (PowerShell)
From the project root directory, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\run_local.ps1
```

---

### Manual Step-by-Step Startup

#### Terminal 1: Backend (FastAPI)
1. Navigate to the project root:
   ```powershell
   cd "C:\Users\aruns\OneDrive\Desktop\arsha resources\ID_117 PROJECT"
   ```
2. Activate or create virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r backend\requirements.txt
   ```
4. Configure `.env` in `backend/.env` (see Environment Configuration below).
5. Start the FastAPI development server:
   ```powershell
   cd backend
   ..\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   Backend URL: `http://127.0.0.1:8000`  
   OpenAPI Swagger UI: `http://127.0.0.1:8000/docs`

---

#### Terminal 2: Frontend (Vite + React)
1. Open a second PowerShell terminal in the project root:
   ```powershell
   cd "C:\Users\aruns\OneDrive\Desktop\arsha resources\ID_117 PROJECT\frontend"
   ```
2. Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   Frontend Application: `http://127.0.0.1:5173`

---

## 7. Environment Configuration (`.env`)

In `backend/.env`:
```ini
ENV=development
SECRET_KEY=your-secure-jwt-signing-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./translator.db

# AI Provider Configuration ('openai', 'ollama', or 'rule_based')
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=codellama

REQUEST_TIMEOUT_SECONDS=45
MAX_SOURCE_CODE_SIZE_BYTES=100000

# Isolated Sandbox Execution
ENABLE_SANDBOX=false
EXECUTION_TIMEOUT_SECONDS=5
EXECUTION_MEMORY_LIMIT_MB=128
```

---

## 8. AI Provider & Fallback Details

### 1. OpenAI / OpenAI-Compatible
- Used when `AI_PROVIDER=openai` and an API key is provided.
- Produces idiomatic target code with conversion explanations, warnings, and optional unit tests.

### 2. Deterministic Rule-Based Fallback
- Operates locally without external API keys or network requests.
- Converts supported language pairs (Python <-> JavaScript, Python <-> TypeScript, Python -> C) for common constructs:
  - Variables, simple types, and arithmetic
  - Function definitions and return statements
  - Conditionals (`if`, `elif`, `else`)
  - Loops (`while`, `for in range()`, `for item in collection`)
  - List manipulation (`.append()`, `.push()`, length conversions)
  - Comments preservation
- Flags partial conversions and unsupported constructs with honest warning notices.

### 3. Ollama (Local Models)
- Connects to a locally running Ollama server (`http://localhost:11434`).
- Can use models such as `codellama`, `qwen2.5-coder`, or `deepseek-coder`.

---

## 9. Automated Testing

### Backend Tests
Run the Pytest suite from the workspace root:
```powershell
$env:PYTHONPATH="C:\Users\aruns\OneDrive\Desktop\arsha resources\ID_117 PROJECT\backend"
.\venv\Scripts\pytest.exe backend\tests -v
```
**Test Coverage Includes:**
- System status and health check
- 20-language registry and auto-detection heuristic
- Rule-based translation engine
- Python AST syntax validator
- JavaScript / Node.js compiler syntax validator
- Unbalanced bracket detection
- Authentication and registration flow
- User-specific project CRUD operations
- Built-in template retrieval

### Frontend Build & Typecheck
Verify TypeScript compilation and Vite bundling:
```powershell
cd frontend
npm run build
```

---

## 10. Code Execution & Security Policy

Arbitrary code execution on the host machine is strictly disabled by default.
- If Docker is installed and `ENABLE_SANDBOX=true`, code execution is routed into ephemeral, non-root, network-isolated Docker containers with memory and CPU bounds.
- If Docker is not detected, execution requests return a clear security policy message stating that sandbox execution is disabled.
- The platform never executes user code directly inside the host operating system.

---

## 11. Known Limitations

1. **External AI Quota**: When the OpenAI API key has 0 remaining credits (HTTP 429), the platform automatically falls back to the deterministic rule-based engine for supported language pairs and displays an honest limitation warning.
2. **Compiler Diagnostics**: Full compilation checks for C/C++/Java require native compilers (`gcc`, `clang`, `javac`) to be installed on the host OS. When absent, the validator runs structural bracket and grammar analysis and accurately reports compiler absence.
3. **Sandbox Execution**: Requires Docker Desktop on Windows. When Docker is not installed, the sandbox capability reports `sandbox_docker_available: false` and safely disables execution.

# -Multi-Language-Code-Translator
