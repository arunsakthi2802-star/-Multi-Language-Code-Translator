import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowLeftRight,
  Play,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Settings2,
  Sparkles,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Cpu,
  Clock,
  Layers
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LanguageInfo, TranslationResponse, TranslationOptions } from '../types';
import { useAuth } from '../context/AuthContext';

export const Translator: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Languages & State
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [sourceLang, setSourceLang] = useState('python');
  const [targetLang, setTargetLang] = useState('javascript');
  const [sourceCode, setSourceCode] = useState(
    '# Calculate factorial with recursion\ndef factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))\n'
  );
  const [targetCode, setTargetCode] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);

  // Status & Settings
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detectedLangInfo, setDetectedLangInfo] = useState<{ language: string; confidence: number } | null>(null);

  // Translation Options
  const [style, setStyle] = useState('idiomatic');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ollama' | 'rule_based'>('gemini');
  const [options, setOptions] = useState<TranslationOptions>({
    preserve_comments: true,
    add_explanatory_comments: false,
    type_annotations: true,
    prefer_stdlib: true,
    include_error_handling: false,
    add_unit_tests: false
  });
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Save Project Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const list = await api.getLanguages();
        setLanguages(list);
      } catch (err) {
        console.error('Failed to load language registry', err);
      }
    };
    fetchLanguages();
  }, []);

  // Load from template or history if query params exist
  useEffect(() => {
    const templateCode = searchParams.get('template_code');
    const templateLang = searchParams.get('template_lang');
    if (templateCode && templateLang) {
      setSourceCode(decodeURIComponent(templateCode));
      setSourceLang(templateLang);
    }

    const historyId = searchParams.get('history_id');
    if (historyId) {
      api.getTranslation(historyId).then((rec) => {
        setSourceLang(rec.source_language);
        setTargetLang(rec.target_language);
        setSourceCode(rec.source_code);
        setTargetCode(rec.translated_code || '');
      }).catch(console.error);
    }
  }, [searchParams]);

  // Auto-detect language suggestion
  const handleDetectLanguage = async () => {
    try {
      const res = await api.detectLanguage(sourceCode);
      setDetectedLangInfo(res);
      if (res.confidence >= 0.5 && res.language !== sourceLang) {
        setSourceLang(res.language);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    if (targetCode) {
      setSourceCode(targetCode);
      setTargetCode('');
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSourceCode(text);
      // Auto-set language based on extension
      const ext = '.' + file.name.split('.').pop();
      const matched = languages.find((l) => l.file_extensions.includes(ext.toLowerCase()));
      if (matched) {
        setSourceLang(matched.id);
      }
    };
    reader.readAsText(file);
  };

  // Download Target Code
  const handleDownload = (code: string, langId: string, prefix: string) => {
    const lang = languages.find((l) => l.id === langId);
    const ext = lang?.file_extensions[0] || '.txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prefix}_${langId}${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!targetCode) return;
    navigator.clipboard.writeText(targetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Execute Translation
  const handleTranslate = async () => {
    if (!sourceCode.trim()) {
      setErrorMessage('Source code cannot be empty.');
      return;
    }

    setIsTranslating(true);
    setErrorMessage(null);

    try {
      const res = await api.translate({
        source_code: sourceCode,
        source_language: sourceLang,
        target_language: targetLang,
        style,
        provider,
        options
      });
      setTranslationResult(res);
      setTargetCode(res.translated_code);
    } catch (err: any) {
      setErrorMessage(err.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Save Project
  const handleSaveProject = async () => {
    if (!projectName.trim()) return;
    try {
      await api.createProject({
        name: projectName.trim(),
        description: projectDescription,
        source_language: sourceLang,
        target_language: targetLang,
        source_code: sourceCode,
        translated_code: targetCode,
        tags: `${sourceLang},${targetLang}`
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveSuccess(false);
        setProjectName('');
        setProjectDescription('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    }
  };

  const currentSourceInfo = languages.find((l) => l.id === sourceLang);
  const currentTargetInfo = languages.find((l) => l.id === targetLang);

  return (
    <div className="flex flex-col h-full bg-[#0d0f15]">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-[#232738] bg-[#11131c] px-4 flex items-center justify-between gap-4">
        {/* Language selectors & Swap */}
        <div className="flex items-center gap-2">
          {/* Source Lang */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">From:</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-[#181c2b] border border-[#2c3147] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            title="Swap source and target languages"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-[#1a1e2e] transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Target Lang */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">To:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-[#181c2b] border border-[#2c3147] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Settings & Provider Selector */}
        <div className="flex items-center gap-2">
          {/* Provider */}
          <select
            value={provider}
            onChange={(e: any) => setProvider(e.target.value)}
            className="hidden sm:block bg-[#161925] border border-[#262b3d] rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
            title="Select translation engine"
          >
            <option value="gemini">Google Gemini (Default)</option>
            <option value="openai">OpenAI (gpt-4o-mini)</option>
            <option value="rule_based">Rule-Based Fallback</option>
            <option value="ollama">Ollama (Local Model)</option>
          </select>

          {/* Style */}
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="hidden md:block bg-[#161925] border border-[#262b3d] rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
            title="Translation Style"
          >
            <option value="idiomatic">Idiomatic</option>
            <option value="preserve_structure">Preserve Structure</option>
            <option value="beginner_friendly">Beginner-Friendly</option>
            <option value="performance">Performance-Oriented</option>
            <option value="oop">Object-Oriented</option>
            <option value="functional">Functional</option>
          </select>

          {/* Options toggle */}
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isOptionsOpen
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-[#181c2b] border-[#2c3147] text-gray-300 hover:bg-[#202538]'
            }`}
            title="Advanced Translation Options"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden lg:inline">Options</span>
          </button>

          {/* TRANSLATE BUTTON */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all ${
              isTranslating
                ? 'bg-indigo-700/60 text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.02]'
            }`}
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Translate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Options Bar (Collapsible) */}
      {isOptionsOpen && (
        <div className="bg-[#141724] border-b border-[#24283c] px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.preserve_comments}
              onChange={(e) => setOptions({ ...options, preserve_comments: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Preserve Comments
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.add_explanatory_comments}
              onChange={(e) => setOptions({ ...options, add_explanatory_comments: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Add Explanatory Comments
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.type_annotations}
              onChange={(e) => setOptions({ ...options, type_annotations: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Strict Type Annotations
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.prefer_stdlib}
              onChange={(e) => setOptions({ ...options, prefer_stdlib: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Prefer Standard Library
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.include_error_handling}
              onChange={(e) => setOptions({ ...options, include_error_handling: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Include Error Handling
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={options.add_unit_tests}
              onChange={(e) => setOptions({ ...options, add_unit_tests: e.target.checked })}
              className="rounded bg-[#1a1e2d] border-[#363a4e] text-indigo-600 focus:ring-0"
            />
            Generate Unit Tests
          </label>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor Split Pane */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#232738] overflow-hidden">
        {/* LEFT: Source Editor */}
        <div className="flex flex-col h-full bg-[#0d0f15]">
          {/* Source Toolbar */}
          <div className="h-9 px-3 bg-[#11131c] border-b border-[#232738] flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-gray-200 uppercase">{sourceLang}</span>
              <span>•</span>
              <span>{sourceCode.split('\n').length} lines</span>
              <span>•</span>
              <span>{sourceCode.length} chars</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDetectLanguage}
                title="Detect Language"
                className="px-2 py-1 rounded hover:bg-[#1a1e2e] text-indigo-400 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Detect
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload source file"
                className="p-1 rounded hover:bg-[#1a1e2e] hover:text-gray-200"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDownload(sourceCode, sourceLang, 'source')}
                title="Download source code"
                className="p-1 rounded hover:bg-[#1a1e2e] hover:text-gray-200"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSourceCode('')}
                title="Clear editor"
                className="p-1 rounded hover:bg-[#1a1e2e] hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Source Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={currentSourceInfo?.editor_mode || 'plaintext'}
              theme="vs-dark"
              value={sourceCode}
              onChange={(val) => setSourceCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* RIGHT: Target Editor */}
        <div className="flex flex-col h-full bg-[#0d0f15]">
          {/* Target Toolbar */}
          <div className="h-9 px-3 bg-[#11131c] border-b border-[#232738] flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-indigo-400 uppercase">{targetLang}</span>
              {translationResult && (
                <>
                  <span>•</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {translationResult.duration_ms}ms
                  </span>
                  <span>•</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-emerald-400" />
                    {translationResult.provider}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              {targetCode && (
                <>
                  <button
                    onClick={() => {
                      navigate(`/compare?source_lang=${sourceLang}&target_lang=${targetLang}`);
                    }}
                    title="Compare Side-by-Side"
                    className="px-2 py-1 rounded hover:bg-[#1a1e2e] text-indigo-400 font-medium flex items-center gap-1"
                  >
                    <GitCompare className="w-3 h-3" />
                    Diff
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/validator?lang=${targetLang}`);
                    }}
                    title="Validate Syntax"
                    className="px-2 py-1 rounded hover:bg-[#1a1e2e] text-emerald-400 font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Validate
                  </button>
                  <button
                    onClick={() => setIsSaveModalOpen(true)}
                    title="Save as Project"
                    className="p-1 rounded hover:bg-[#1a1e2e] hover:text-gray-200"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(targetCode, targetLang, 'translated')}
                    title="Download translated file"
                    className="p-1 rounded hover:bg-[#1a1e2e] hover:text-gray-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    title="Copy translated code"
                    className="px-2 py-1 rounded bg-[#1c2030] hover:bg-[#252a40] text-gray-200 font-medium flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Target Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={currentTargetInfo?.editor_mode || 'plaintext'}
              theme="vs-dark"
              value={targetCode}
              onChange={(val) => setTargetCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>
      </div>

      {/* Warnings & Conversion Notes Panel */}
      {translationResult && (
        <div className="border-t border-[#232738] bg-[#10121a] p-3 text-xs flex flex-col md:flex-row gap-4 items-start justify-between max-h-40 overflow-y-auto">
          {/* Notes */}
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Conversion Notes & Explanation:
            </p>
            <p className="text-gray-400">{translationResult.explanation}</p>
            {translationResult.conversion_notes?.map((note, idx) => (
              <p key={idx} className="text-gray-400 pl-4 border-l-2 border-indigo-500/40">
                {note}
              </p>
            ))}
          </div>

          {/* Warnings */}
          {translationResult.warnings && translationResult.warnings.length > 0 && (
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Caveats & Warnings:
              </p>
              {translationResult.warnings.map((w, idx) => (
                <p key={idx} className="text-amber-300/80 pl-4 border-l-2 border-amber-500/40">
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Project Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141724] border border-[#2a2f45] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                Save Translation Project
              </h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 font-bold"
              >
                ×
              </button>
            </div>

            {saveSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-emerald-400 text-xs font-semibold">
                Project saved successfully!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Factorial Algorithm Translation"
                    className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Short notes about this translation..."
                    rows={3}
                    className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-3 py-2 rounded-lg bg-[#1e2336] hover:bg-[#282e46] text-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProject}
                    disabled={!projectName.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
