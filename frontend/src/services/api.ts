import {
  LanguageInfo,
  TranslationRequest,
  TranslationResponse,
  TranslationRecord,
  ValidationResult,
  Project,
  CodeTemplate,
  ExplanationResponse,
  ComparisonResult,
  UserSettings,
  SystemStatus
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // System
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/system/status');
  }

  // Languages
  async getLanguages(): Promise<LanguageInfo[]> {
    return this.request<LanguageInfo[]>('/translations/languages');
  }

  async detectLanguage(code: string): Promise<{ language: string; confidence: number; candidates: any[] }> {
    return this.request('/translations/detect-language', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  // Translations
  async translate(req: TranslationRequest): Promise<TranslationResponse> {
    return this.request<TranslationResponse>('/translations', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async getTranslations(params: {
    source_language?: string;
    target_language?: string;
    status_filter?: string;
    search?: string;
    sort_order?: string;
    limit?: number;
  } = {}): Promise<TranslationRecord[]> {
    const query = new URLSearchParams();
    if (params.source_language) query.append('source_language', params.source_language);
    if (params.target_language) query.append('target_language', params.target_language);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    if (params.search) query.append('search', params.search);
    if (params.sort_order) query.append('sort_order', params.sort_order);
    if (params.limit) query.append('limit', params.limit.toString());

    return this.request<TranslationRecord[]>(`/translations?${query.toString()}`);
  }

  async getTranslation(id: string): Promise<TranslationRecord> {
    return this.request<TranslationRecord>(`/translations/${id}`);
  }

  async retryTranslation(id: string): Promise<TranslationResponse> {
    return this.request<TranslationResponse>(`/translations/${id}/retry`, {
      method: 'POST'
    });
  }

  async deleteTranslation(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/translations/${id}`, {
      method: 'DELETE'
    });
  }

  async clearAllTranslations(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/translations', {
      method: 'DELETE'
    });
  }

  async getDashboardStats(): Promise<any> {
    return this.request<any>('/translations/stats');
  }

  // Validation
  async validateCode(code: string, language: string): Promise<ValidationResult> {
    return this.request<ValidationResult>('/validation', {
      method: 'POST',
      body: JSON.stringify({ code, language })
    });
  }

  async getValidationCapabilities(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/validation/capabilities');
  }

  // Explanations
  async explainCode(code: string, language: string, mode: string = 'intermediate'): Promise<ExplanationResponse> {
    return this.request<ExplanationResponse>('/explanations', {
      method: 'POST',
      body: JSON.stringify({ code, language, mode })
    });
  }

  // Comparisons
  async compareCode(
    source_code: string,
    source_language: string,
    target_code: string,
    target_language: string,
    request_ai_assessment: boolean = true
  ): Promise<ComparisonResult> {
    return this.request<ComparisonResult>('/comparisons', {
      method: 'POST',
      body: JSON.stringify({
        source_code,
        source_language,
        target_code,
        target_language,
        request_ai_assessment
      })
    });
  }

  // Projects
  async getProjects(search?: string, language?: string): Promise<Project[]> {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    if (language) q.append('language', language);
    return this.request<Project[]>(`/projects?${q.toString()}`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  }

  async duplicateProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/duplicate`, {
      method: 'POST'
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Templates
  async getTemplates(category?: string, language?: string): Promise<CodeTemplate[]> {
    const q = new URLSearchParams();
    if (category) q.append('category', category);
    if (language) q.append('language', language);
    return this.request<CodeTemplate[]>(`/templates?${q.toString()}`);
  }

  // Execution
  async getExecutionCapabilities(): Promise<any> {
    return this.request<any>('/execution/capabilities');
  }

  async executeCode(language: string, code: string, stdin?: string): Promise<any> {
    return this.request<any>('/execution', {
      method: 'POST',
      body: JSON.stringify({ language, code, stdin })
    });
  }

  // Settings
  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/settings');
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async testConnection(payload: { provider: string; api_key?: string; base_url?: string; model?: string }): Promise<any> {
    return this.request<any>('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiService();
