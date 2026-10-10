import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  XCircle,
  Activity,
  Save,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { UserSettings, LanguageInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    theme: 'dark',
    default_source_language: 'python',
    default_target_language: 'javascript',
    save_history: true,
    preferred_translation_style: 'idiomatic',
    ai_provider: 'openai',
    custom_model: 'gpt-4o-mini',
    custom_base_url: 'https://api.openai.com/v1'
  });

  // Test Connection
  const [testProvider, setTestProvider] = useState('openai');
  const [testKey, setTestKey] = useState('');
  const [testBaseUrl, setTestBaseUrl] = useState('');
  const [testModel, setTestModel] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    if (user) {
      api.getSettings().then(setSettings).catch(console.error);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) {
      setSaveStatus('Local settings updated. Sign in to sync across devices.');
      return;
    }
    try {
      await api.updateSettings(settings);
      setSaveStatus('Preferences saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.testConnection({
        provider: testProvider,
        api_key: testKey || undefined,
        base_url: testBaseUrl || undefined,
        model: testModel || undefined
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          System & AI Engine Configuration
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure translation providers, model endpoints, test real-time connectivity, and customize your editor workflow.
        </p>
      </div>

      {/* AI Provider Health Check & Test Tool */}
      <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            AI Provider Diagnostics & Test Connection
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">Live Endpoint Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Provider</label>
            <select
              value={testProvider}
              onChange={(e) => setTestProvider(e.target.value)}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
            >
              <option value="openai">OpenAI / Compatible</option>
              <option value="ollama">Ollama (Local Daemon)</option>
              <option value="rule_based">Rule-Based Engine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Base URL (Optional override)
            </label>
            <input
              type="text"
              value={testBaseUrl}
              onChange={(e) => setTestBaseUrl(e.target.value)}
              placeholder={testProvider === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Model Name</label>
            <input
              type="text"
              value={testModel}
              onChange={(e) => setTestModel(e.target.value)}
              placeholder={testProvider === 'ollama' ? 'codellama' : 'gpt-4o-mini'}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {testProvider === 'openai' && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Test Custom API Key (Leave blank to test server-configured key)
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 font-mono focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              API keys are never stored in browser localStorage or transmitted in plaintext.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {testLoading ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                Testing Endpoint...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                Test Connection
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testResult.message}</p>
              {testResult.available_models && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Detected Models: {testResult.available_models.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Preferences Form */}
      <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            User Preferences & Defaults
          </h2>
          {saveStatus && (
            <span className="text-xs text-emerald-400 font-semibold">{saveStatus}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Default Source Language
            </label>
            <select
              value={settings.default_source_language || 'python'}
              onChange={(e) => setSettings({ ...settings, default_source_language: e.target.value })}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Default Target Language
            </label>
            <select
              value={settings.default_target_language || 'javascript'}
              onChange={(e) => setSettings({ ...settings, default_target_language: e.target.value })}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Default Translation Style
            </label>
            <select
              value={settings.preferred_translation_style || 'idiomatic'}
              onChange={(e) => setSettings({ ...settings, preferred_translation_style: e.target.value })}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200"
            >
              <option value="idiomatic">Idiomatic</option>
              <option value="preserve_structure">Preserve Structure</option>
              <option value="beginner_friendly">Beginner-Friendly</option>
              <option value="performance">Performance-Oriented</option>
              <option value="oop">Object-Oriented</option>
              <option value="functional">Functional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Default AI Engine
            </label>
            <select
              value={settings.ai_provider || 'openai'}
              onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value })}
              className="w-full bg-[#181c2b] border border-[#2b3046] rounded-lg px-3 py-2 text-xs text-gray-200"
            >
              <option value="openai">OpenAI (Server / gpt-4o-mini)</option>
              <option value="rule_based">Rule-Based Fallback</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
            <input
              type="checkbox"
              checked={settings.save_history ?? true}
              onChange={(e) => setSettings({ ...settings, save_history: e.target.checked })}
              className="rounded bg-[#181c2b] border-[#2b3046] text-indigo-600 focus:ring-0"
            />
            <span>
              Persist translation history in database (disable if translating sensitive proprietary code)
            </span>
          </label>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
