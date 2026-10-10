import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Sparkles,
  Play,
  Clock,
  Bug,
  Lightbulb,
  FileText,
  ListTree,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { LanguageInfo, ExplanationResponse } from '../types';

export const Explainer: React.FC = () => {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [language, setLanguage] = useState('python');
  const [mode, setMode] = useState('intermediate');
  const [code, setCode] = useState(
    'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n'
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
  }, []);

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please provide code to explain.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.explainCode(code, language, mode);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Explanation failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.id === language);

  const modes = [
    { id: 'beginner', label: 'Beginner', desc: 'Simple intuition & analogies' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Idioms & software design' },
    { id: 'advanced', label: 'Advanced', desc: 'Memory & compiler mechanics' },
    { id: 'line-by-line', label: 'Line-by-Line', desc: 'Statement breakdown' },
    { id: 'algorithm-focused', label: 'Algorithm', desc: 'Invariants & data flows' },
    { id: 'complexity', label: 'Complexity', desc: 'Big-O Time & Space limits' },
    { id: 'functions', label: 'Functions', desc: 'Module & signature analysis' },
    { id: 'data-structures', label: 'Data Structures', desc: 'State representations' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Code Explainer & Architectural Analysis
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Break down algorithmic complexity, data structures, edge cases, and paradigms across 8 specialized explanation modes.
          </p>
        </div>
        <button
          onClick={handleExplain}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Analyzing Code...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Generate Explanation
            </>
          )}
        </button>
      </div>

      {/* Mode selection buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              mode === m.id
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                : 'bg-[#12141f] border-[#232738] text-gray-400 hover:border-[#353a54] hover:text-gray-200'
            }`}
          >
            <p className="font-semibold text-xs text-gray-200">{m.label}</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Editor & Language Selector */}
      <div className="bg-[#12141f] border border-[#232738] rounded-xl overflow-hidden flex flex-col h-80">
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
            Mode: <span className="text-indigo-400 capitalize">{mode}</span>
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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Structured Output Cards */}
      {result && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Purpose */}
            <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Program Purpose
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">{result.purpose}</p>
            </div>

            {/* Complexity */}
            <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Computational Complexity
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-[#232738] pb-1">
                  <span className="text-gray-400">Time Complexity:</span>
                  <span className="font-mono text-emerald-400 font-bold">{result.complexity?.time || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-[#232738] pb-1">
                  <span className="text-gray-400">Space Complexity:</span>
                  <span className="font-mono text-indigo-400 font-bold">{result.complexity?.space || 'N/A'}</span>
                </div>
                {result.complexity?.rationale && (
                  <p className="text-[11px] text-gray-400 pt-1">{result.complexity.rationale}</p>
                )}
              </div>
            </div>

            {/* Potential Bugs / Edge Cases */}
            <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Bug className="w-3.5 h-3.5" />
                Edge Cases & Pitfalls
              </h3>
              {result.potential_bugs && result.potential_bugs.length > 0 ? (
                <ul className="text-xs text-amber-200/80 space-y-1 list-disc list-inside">
                  {result.potential_bugs.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No critical edge cases identified.</p>
              )}
            </div>
          </div>

          {/* Full Markdown Walkthrough */}
          <div className="bg-[#12141f] border border-[#232738] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <ListTree className="w-4 h-4 text-indigo-400" />
              Detailed Walkthrough & Analysis
            </h3>
            <div className="prose prose-invert max-w-none text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans bg-[#161925] p-4 rounded-xl border border-[#232738]">
              {result.full_explanation}
            </div>

            {/* Improvements */}
            {result.improvements && result.improvements.length > 0 && (
              <div className="pt-4 border-t border-[#232738]">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Recommended Optimizations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.improvements.map((imp, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#181c2b] border border-[#2a2f45] text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
