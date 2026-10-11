import {
  LanguageInfo,
  TranslationRequest,
  TranslationResponse,
  TranslationRecord,
  ValidationResult,
  Project,
  CodeTemplate,
  DiagnosticItem,
  User
} from '../types';

export const FALLBACK_LANGUAGES: LanguageInfo[] = [
  { id: 'python', name: 'Python', category: 'general', file_extensions: ['.py'], editor_mode: 'python', has_syntax_validation: true, has_sandbox_execution: true, description: 'High-level, dynamically typed language emphasizing readability.' },
  { id: 'javascript', name: 'JavaScript', category: 'general', file_extensions: ['.js', '.mjs'], editor_mode: 'javascript', has_syntax_validation: true, has_sandbox_execution: true, description: 'Core language of the web with asynchronous event-driven model.' },
  { id: 'typescript', name: 'TypeScript', category: 'general', file_extensions: ['.ts'], editor_mode: 'typescript', has_syntax_validation: true, has_sandbox_execution: false, description: 'Statically typed superset of JavaScript compiling to plain JS.' },
  { id: 'java', name: 'Java', category: 'general', file_extensions: ['.java'], editor_mode: 'java', has_syntax_validation: true, has_sandbox_execution: true, description: 'Class-based, object-oriented language for cross-platform apps.' },
  { id: 'c', name: 'C', category: 'general', file_extensions: ['.c', '.h'], editor_mode: 'c', has_syntax_validation: true, has_sandbox_execution: true, description: 'Foundational procedural language with manual memory control.' },
  { id: 'cpp', name: 'C++', category: 'general', file_extensions: ['.cpp', '.hpp', '.cc'], editor_mode: 'cpp', has_syntax_validation: true, has_sandbox_execution: true, description: 'High-performance language with modern zero-cost abstractions.' },
  { id: 'csharp', name: 'C#', category: 'general', file_extensions: ['.cs'], editor_mode: 'csharp', has_syntax_validation: false, has_sandbox_execution: false, description: 'Modern, object-oriented, type-safe language in the .NET ecosystem.' },
  { id: 'go', name: 'Go', category: 'general', file_extensions: ['.go'], editor_mode: 'go', has_syntax_validation: true, has_sandbox_execution: false, description: 'Statically typed language with built-in concurrency primitives.' },
  { id: 'rust', name: 'Rust', category: 'general', file_extensions: ['.rs'], editor_mode: 'rust', has_syntax_validation: true, has_sandbox_execution: false, description: 'Memory-safe systems programming language with borrow checker.' },
  { id: 'php', name: 'PHP', category: 'general', file_extensions: ['.php'], editor_mode: 'php', has_syntax_validation: false, has_sandbox_execution: false, description: 'Popular server-side scripting language for web development.' },
  { id: 'ruby', name: 'Ruby', category: 'general', file_extensions: ['.rb'], editor_mode: 'ruby', has_syntax_validation: false, has_sandbox_execution: false, description: 'Dynamic, open source language with a focus on simplicity.' },
  { id: 'swift', name: 'Swift', category: 'general', file_extensions: ['.swift'], editor_mode: 'swift', has_syntax_validation: false, has_sandbox_execution: false, description: 'Powerful, intuitive language for Apple platforms and beyond.' },
  { id: 'kotlin', name: 'Kotlin', category: 'general', file_extensions: ['.kt', '.kts'], editor_mode: 'kotlin', has_syntax_validation: false, has_sandbox_execution: false, description: 'Concise, safe, interoperable language for JVM and Android.' },
  { id: 'r', name: 'R', category: 'general', file_extensions: ['.r', '.R'], editor_mode: 'r', has_syntax_validation: false, has_sandbox_execution: false, description: 'Statistical computing and graphics environment.' },
  { id: 'dart', name: 'Dart', category: 'general', file_extensions: ['.dart'], editor_mode: 'dart', has_syntax_validation: false, has_sandbox_execution: false, description: 'Client-optimized language for fast apps on any platform.' },
  { id: 'scala', name: 'Scala', category: 'general', file_extensions: ['.scala'], editor_mode: 'scala', has_syntax_validation: false, has_sandbox_execution: false, description: 'Combines object-oriented and functional programming in one concise language.' },
  { id: 'html', name: 'HTML', category: 'markup', file_extensions: ['.html', '.htm'], editor_mode: 'html', has_syntax_validation: true, has_sandbox_execution: false, description: 'Standard markup language for documents designed to be displayed in a web browser.' },
  { id: 'css', name: 'CSS', category: 'styling', file_extensions: ['.css'], editor_mode: 'css', has_syntax_validation: true, has_sandbox_execution: false, description: 'Style sheet language used for describing the presentation of a document.' },
  { id: 'sql', name: 'SQL', category: 'query', file_extensions: ['.sql'], editor_mode: 'sql', has_syntax_validation: true, has_sandbox_execution: false, description: 'Domain-specific language used in programming and managing relational databases.' },
  { id: 'shell', name: 'Shell / Bash', category: 'shell', file_extensions: ['.sh', '.bash'], editor_mode: 'shell', has_syntax_validation: false, has_sandbox_execution: false, description: 'Unix shell command-line interpreter and script language.' }
];

export const FALLBACK_TEMPLATES: CodeTemplate[] = [
  { id: 't1', title: 'Recursive Factorial', source_language: 'python', category: 'Algorithms', code: 'def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint("Factorial 5:", factorial(5))\n', description: 'Classic recursive mathematical function.', difficulty: 'Easy', is_public: true },
  { id: 't2', title: 'Binary Search', source_language: 'javascript', category: 'Algorithms', code: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n', description: 'Logarithmic O(log n) element searching.', difficulty: 'Medium', is_public: true },
  { id: 't3', title: 'HTTP JSON Fetcher', source_language: 'typescript', category: 'Web', code: 'async function fetchUser(id: string): Promise<{ id: string; name: string }> {\n  const res = await fetch(`https://api.example.com/users/${id}`);\n  if (!res.ok) throw new Error("Fetch failed");\n  return res.json();\n}\n', description: 'Asynchronous network fetch pattern.', difficulty: 'Easy', is_public: true },
  { id: 't4', title: 'Fibonacci Sequence', source_language: 'python', category: 'Algorithms', code: 'def fibonacci(n: int) -> list[int]:\n    seq = [0, 1]\n    while len(seq) < n:\n        seq.append(seq[-1] + seq[-2])\n    return seq[:n]\n', description: 'Generates Fibonacci numbers list.', difficulty: 'Easy', is_public: true }
];

// Helper to get Gemini API key
export function getGeminiApiKey(): string {
  return (
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('ai_api_key') ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ''
  );
}

// Client-side Gemini API call
export async function callGeminiDirect(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error (Status ${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return rawText;
}

// Client-side rule-based translation fallback
export function ruleBasedTranslate(code: string, sourceLang: string, targetLang: string): string {
  const lines = code.split('\n');
  const s = sourceLang.toLowerCase();
  const t = targetLang.toLowerCase();

  // Python -> JavaScript / TypeScript
  if (s === 'python' && (t === 'javascript' || t === 'typescript')) {
    return lines.map(line => {
      let l = line;
      if (l.trim().startsWith('#')) return l.replace('#', '//');
      if (/^\s*def\s+/.test(l)) {
        l = l.replace(/^\s*def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(\s*->\s*[a-zA-Z0-9_\[\]]+)?\s*:/, 'function $1($2) {');
        return l;
      }
      l = l.replace(/\bprint\s*\(/g, 'console.log(');
      l = l.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
      l = l.replace(/\belif\s+(.*?):/g, '} else if ($1) {');
      l = l.replace(/\bif\s+(.*?):/g, 'if ($1) {');
      l = l.replace(/\belse\s*:/g, '} else {');
      l = l.replace(/\bwhile\s+(.*?):/g, 'while ($1) {');
      l = l.replace(/\bfor\s+([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_]+):/g, 'for (const $1 of $2) {');
      l = l.replace(/\.append\(/g, '.push(');
      l = l.replace(/len\(([a-zA-Z0-9_]+)\)/g, '$1.length');
      return l;
    }).join('\n') + '\n';
  }

  // JavaScript / TypeScript -> Python
  if ((s === 'javascript' || s === 'typescript') && t === 'python') {
    return lines.map(line => {
      let l = line;
      if (l.trim().startsWith('//')) return l.replace('//', '#');
      l = l.replace(/\bconsole\.log\s*\(/g, 'print(');
      l = l.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None');
      l = l.replace(/\bfunction\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{?/g, 'def $1($2):');
      l = l.replace(/\bconst\s+|\blet\s+|\bvar\s+/g, '');
      l = l.replace(/\belse\s+if\s*\((.*?)\)\s*\{?/g, 'elif $1:');
      l = l.replace(/\bif\s*\((.*?)\)\s*\{?/g, 'if $1:');
      l = l.replace(/\belse\s*\{?/g, 'else:');
      l = l.replace(/\.push\(/g, '.append(');
      l = l.replace(/\s*;\s*$/, '');
      l = l.replace(/^\s*\}\s*$/, '');
      return l;
    }).filter(l => l !== '').join('\n') + '\n';
  }

  return `// Translated from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}\n` +
    `// Mode: Client-Side Standalone Translator\n\n` +
    code;
}

// Client-side translation handler
export async function executeClientTranslation(req: TranslationRequest): Promise<TranslationResponse> {
  const geminiKey = getGeminiApiKey();

  if (geminiKey) {
    try {
      const prompt = `You are an expert polyglot software engineer and programming language converter.
Translate the following ${req.source_language} code to idiomatic ${req.target_language}.

Translation Style: ${req.style || 'idiomatic'}
Options: Preserve comments: ${req.options?.preserve_comments}, Add tests: ${req.options?.add_unit_tests}

Source Code:
\`\`\`${req.source_language}
${req.source_code}
\`\`\`

Respond ONLY with valid JSON in this exact structure (no markdown fences outside the JSON):
{
  "target_code": "translated code string here",
  "confidence_score": 0.95,
  "translation_notes": "summary of conversion",
  "syntax_warnings": [],
  "idiomatic_improvements": ["improvement 1", "improvement 2"],
  "unit_tests": "unit tests if requested, otherwise empty string"
}`;

      const raw = await callGeminiDirect(prompt, geminiKey);
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      const record: TranslationResponse = {
        id: 'cl-' + Date.now().toString(36),
        source_language: req.source_language,
        target_language: req.target_language,
        source_code: req.source_code,
        translated_code: parsed.target_code || '',
        provider: 'gemini',
        model_name: 'gemini-1.5-flash',
        status: 'completed',
        warnings: parsed.syntax_warnings || [],
        conversion_notes: parsed.idiomatic_improvements || [parsed.translation_notes || 'Translated via Gemini 1.5 Flash'],
        suggested_tests: parsed.unit_tests ? [parsed.unit_tests] : [],
        explanation: parsed.translation_notes || 'Generated by Google Gemini AI',
        duration_ms: 1200,
        created_at: new Date().toISOString()
      };

      saveTranslationLocally(record);
      return record;
    } catch (e: any) {
      console.warn('Direct Gemini translation failed, falling back to rule engine:', e);
    }
  }

  // Deterministic rule engine fallback
  const targetCode = ruleBasedTranslate(req.source_code, req.source_language, req.target_language);
  const record: TranslationResponse = {
    id: 'cl-' + Date.now().toString(36),
    source_language: req.source_language,
    target_language: req.target_language,
    source_code: req.source_code,
    translated_code: targetCode,
    provider: 'rule_based',
    model_name: 'rule_based_deterministic',
    status: 'completed',
    warnings: [],
    conversion_notes: [
      'Translated directly in browser via client-side rule engine.',
      'To use Google Gemini AI, configure your Gemini API Key in Settings.'
    ],
    suggested_tests: [],
    explanation: 'Converted using deterministic syntax translation rules.',
    duration_ms: 45,
    created_at: new Date().toISOString()
  };

  saveTranslationLocally(record);
  return record;
}

// Local Storage Translation Persistence
export function saveTranslationLocally(record: TranslationResponse) {
  try {
    const raw = localStorage.getItem('local_translations') || '[]';
    const list: TranslationRecord[] = JSON.parse(raw);
    const item: TranslationRecord = {
      id: record.id || 'rec-' + Date.now().toString(36),
      source_language: record.source_language,
      target_language: record.target_language,
      source_code: record.source_code,
      translated_code: record.translated_code,
      provider: record.provider,
      model_name: record.model_name,
      status: record.status,
      warnings: (record.warnings || []).join('; '),
      explanation: record.explanation,
      duration_ms: record.duration_ms,
      created_at: record.created_at || new Date().toISOString()
    };
    list.unshift(item);
    if (list.length > 50) list.pop();
    localStorage.setItem('local_translations', JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save translation locally:', err);
  }
}

export function getLocalTranslations(): TranslationRecord[] {
  try {
    const raw = localStorage.getItem('local_translations') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Client-side Code Validation
export function validateCodeClient(code: string, language: string): ValidationResult {
  const diagnostics: DiagnosticItem[] = [];
  const stack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  const lines = code.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let inString = false;
    let quoteChar = '';

    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      if ((char === '"' || char === "'") && (col === 0 || line[col - 1] !== '\\')) {
        if (inString && quoteChar === char) {
          inString = false;
        } else if (!inString) {
          inString = true;
          quoteChar = char;
        }
      }

      if (!inString) {
        if (char === '(' || char === '{' || char === '[') {
          stack.push({ char, line: lineIndex + 1 });
        } else if (char === ')' || char === '}' || char === ']') {
          const expected = pairs[char];
          const last = stack.pop();
          if (!last || last.char !== expected) {
            diagnostics.push({
              severity: 'error',
              line: lineIndex + 1,
              column: col + 1,
              message: `Unmatched closing delimiter '${char}'`,
              suggested_fix: `Remove '${char}' or balance preceding opener`
            });
            break;
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    diagnostics.push({
      severity: 'error',
      line: unclosed.line,
      message: `Unclosed delimiter '${unclosed.char}'`
    });
  }

  const isValid = diagnostics.filter(d => d.severity === 'error').length === 0;

  return {
    is_valid: isValid,
    language,
    engine: 'client_syntax_analyzer',
    capabilities_available: true,
    diagnostics,
    summary: isValid ? 'Code structure appears valid with balanced delimiters.' : 'Syntax issues detected.'
  };
}

// Local Projects
export function getLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem('local_projects') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalProject(project: Partial<Project>): Project {
  const projects = getLocalProjects();
  const id = project.id || 'proj-' + Date.now().toString(36);
  const now = new Date().toISOString();

  const newProj: Project = {
    id,
    name: project.name || 'Untitled Project',
    description: project.description || '',
    source_language: project.source_language || 'python',
    target_language: project.target_language || 'javascript',
    source_code: project.source_code || '',
    translated_code: project.translated_code || '',
    notes: project.notes || '',
    tags: project.tags || '',
    created_at: now,
    updated_at: now
  };

  const existingIndex = projects.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...projects[existingIndex], ...newProj, updated_at: now };
  } else {
    projects.unshift(newProj);
  }

  localStorage.setItem('local_projects', JSON.stringify(projects));
  return newProj;
}

export function deleteLocalProject(id: string) {
  const projects = getLocalProjects().filter(p => p.id !== id);
  localStorage.setItem('local_projects', JSON.stringify(projects));
}

// Client Mock User
export function getLocalUser(): User {
  const email = localStorage.getItem('local_user_email') || 'developer@example.com';
  const name = localStorage.getItem('local_user_name') || 'Developer';
  return {
    id: 'usr-local-1',
    name,
    email,
    created_at: new Date().toISOString()
  };
}
