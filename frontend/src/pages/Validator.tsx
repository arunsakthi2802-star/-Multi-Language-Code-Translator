import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Cpu,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { LanguageInfo, ValidationResult, DiagnosticItem } from '../types';

export const Validator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [language, setLanguage] = useState(searchParams.get('lang') || 'python');
  const [code, setCode] = useState('def calculate_sum(a, b):\n    return a + b\n\nprint(calculate_sum(10, 20))\n');
  const [capabilities, setCapabilities] = useState<Record<string, any>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    api.getValidationCapabilities().then(setCapabilities).catch(console.error);
  }, []);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await api.validateCode(code, language);
      setValidationResult(res);
    } catch (err: any) {
      alert(err.message || 'Validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.id === language);
  const currentCap = capabilities[language];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Code Diagnostics & Static Validator
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Examines source code using native AST compilers, Node.js syntax checkers, and structural bracket analyzers.
          </p>
        </div>
        <button
          onClick={handleValidate}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Validating Syntax...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Validation
            </>
          )}
        </button>
      </div>

      {/* Compiler Capabilities Status */}
      <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-gray-300 font-semibold">Active Engine for {language.toUpperCase()}:</span>
          <span className="font-mono text-gray-400 bg-[#171a28] px-2 py-0.5 rounded border border-[#262a3f]">
            {currentCap?.engine || 'Static Analyzer'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Host Availability:</span>
          {currentCap?.available ? (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Toolchain Detected
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              Heuristic Fallback (Compiler Not Installed on Host)
            </span>
          )}
        </div>
      </div>

      {/* Editor & Diagnostics Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="bg-[#12141f] border border-[#232738] rounded-xl overflow-hidden flex flex-col h-[480px]">
          <div className="h-10 px-4 bg-[#151824] border-b border-[#232738] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#1b1f2e] border border-[#2d3248] rounded px-2.5 py-1 text-xs text-gray-200 focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {code.split('\n').length} lines
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={currentLang?.editor_mode || 'plaintext'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* Diagnostics Output */}
        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-5 flex flex-col h-[480px] overflow-hidden">
          <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Diagnostic Report
          </h3>

          {validationResult ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  validationResult.is_valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {validationResult.is_valid ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
                )}
                <div>
                  <h4 className="font-bold text-xs">
                    {validationResult.is_valid ? 'Syntax Verification Passed' : 'Syntax Verification Failed'}
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5">{validationResult.summary}</p>
                </div>
              </div>

              {/* Engine metadata */}
              <div className="text-[11px] text-gray-400 font-mono bg-[#161925] p-2.5 rounded-lg border border-[#232738]">
                <span>Validated with: </span>
                <span className="text-indigo-400 font-bold">{validationResult.engine}</span>
              </div>

              {/* Diagnostics List */}
              {validationResult.diagnostics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-300">Detailed Diagnostics:</h4>
                  {validationResult.diagnostics.map((diag, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        diag.severity === 'error'
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                          : diag.severity === 'warning'
                          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                          : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold uppercase flex items-center gap-1.5">
                          {diag.severity === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          {diag.severity === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          {diag.severity === 'info' && <Info className="w-3.5 h-3.5 text-indigo-400" />}
                          {diag.severity}
                        </span>
                        {diag.line && (
                          <span className="text-gray-400">
                            Line {diag.line}{diag.column ? `:${diag.column}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200">{diag.message}</p>
                      {diag.suggested_fix && (
                        <p className="text-[11px] text-gray-400 pt-1 border-t border-white/5">
                          Suggested fix: {diag.suggested_fix}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 opacity-30" />
              <p className="text-xs">Click "Run Validation" above to test the code against language grammar rules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
