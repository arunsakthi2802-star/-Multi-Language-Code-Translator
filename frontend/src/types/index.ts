export interface LanguageInfo {
  id: string;
  name: string;
  category: 'general' | 'markup' | 'styling' | 'shell' | 'query';
  file_extensions: string[];
  editor_mode: string;
  has_syntax_validation: boolean;
  has_sandbox_execution: boolean;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserSettings {
  theme: string;
  default_source_language: string;
  default_target_language: string;
  save_history: boolean;
  preferred_translation_style: string;
  ai_provider: string;
  custom_model?: string;
  custom_base_url?: string;
}

export interface TranslationOptions {
  preserve_comments: boolean;
  add_explanatory_comments: boolean;
  type_annotations: boolean;
  prefer_stdlib: boolean;
  include_error_handling: boolean;
  add_unit_tests: boolean;
}

export interface TranslationRequest {
  source_code: string;
  source_language: string;
  target_language: string;
  style?: string;
  provider?: string;
  options?: TranslationOptions;
}

export interface TranslationResponse {
  id?: string;
  source_language: string;
  target_language: string;
  source_code: string;
  translated_code: string;
  provider: string;
  model_name?: string;
  status: string;
  warnings: string[];
  conversion_notes: string[];
  explanation?: string;
  suggested_tests: string[];
  duration_ms: number;
  created_at?: string;
}

export interface TranslationRecord {
  id: string;
  source_language: string;
  target_language: string;
  source_code: string;
  translated_code?: string;
  provider: string;
  model_name?: string;
  status: string;
  warnings?: string;
  explanation?: string;
  duration_ms: number;
  created_at: string;
}

export interface DiagnosticItem {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
  message: string;
  suggested_fix?: string;
  rule?: string;
}

export interface ValidationResult {
  is_valid: boolean;
  language: string;
  engine: string;
  capabilities_available: boolean;
  diagnostics: DiagnosticItem[];
  summary: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  source_language: string;
  target_language: string;
  source_code: string;
  translated_code?: string;
  notes?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  source_language: string;
  code: string;
  difficulty: string;
  category: string;
  expected_behavior?: string;
  is_public: boolean;
}

export interface ExplanationResponse {
  purpose: string;
  components: string[];
  control_flow: string;
  complexity: {
    time?: string;
    space?: string;
    is_estimated?: boolean;
    rationale?: string;
  };
  potential_bugs: string[];
  improvements: string[];
  full_explanation: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  old_line_no?: number;
  new_line_no?: number;
  content: string;
}

export interface ComparisonResult {
  source_language: string;
  target_language: string;
  diff_lines: DiffLine[];
  unified_diff: string;
  stats: {
    added: number;
    removed: number;
    unchanged: number;
    total_source_lines: number;
    total_target_lines: number;
  };
  ai_assessment?: {
    assessment: string;
    semantic_equivalence: string;
    behavioral_differences: string[];
    key_mappings: string[];
  };
}

export interface SystemStatus {
  status: string;
  service: string;
  database: string;
  ai_provider_configured: string;
  openai_key_present: boolean;
  sandbox_docker_available: boolean;
  node_compiler_available: boolean;
  environment: string;
  version: string;
}
