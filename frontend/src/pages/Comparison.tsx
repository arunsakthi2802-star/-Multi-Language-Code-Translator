import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ComparisonResult, LanguageInfo } from '../types';

export const Comparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);

  const [sourceLang, setSourceLang] = useState(searchParams.get('source_lang') || 'python');
  const [targetLang, setTargetLang] = useState(searchParams.get('target_lang') || 'javascript');
  const [sourceCode, setSourceCode] = useState(
    'def multiply(a, b):\n    # Multiply numbers\n    result = a * b\n    return result\n'
  );
  const [targetCode, setTargetCode] = useState(
    'function multiply(a, b) {\n    // Multiply numbers\n    const result = a * b;\n    return result;\n}\n'
  );

  const [diffResult, setDiffResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    handleCompare();
  }, []);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await api.compareCode(sourceCode, sourceLang, targetCode, targetLang, true);
      setDiffResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUnified = () => {
    if (!diffResult) return;
    navigator.clipboard.writeText(diffResult.unified_diff);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  const handleDownloadDiff = () => {
    if (!diffResult) return;
    const blob = new Blob([diffResult.unified_diff], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diff_${sourceLang}_to_${targetLang}.patch`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Code Comparison & Semantic Evaluation
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Compare source implementation against translated code with line-level diffs and AI semantic preservation analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            Compute Diff
          </button>
        </div>
      </div>

      {/* Inputs / Quick Edit Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300">Source Program ({sourceLang})</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-[#181c2b] border border-[#2c3147] rounded px-2 py-0.5 text-xs text-gray-200"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={5}
            className="w-full bg-[#161925] border border-[#232738] rounded-lg p-2.5 text-xs font-mono text-gray-200 focus:outline-none"
          />
        </div>

        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-300">Target Program ({targetLang})</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-[#181c2b] border border-[#2c3147] rounded px-2 py-0.5 text-xs text-gray-200"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={targetCode}
            onChange={(e) => setTargetCode(e.target.value)}
            rows={5}
            className="w-full bg-[#161925] border border-[#232738] rounded-lg p-2.5 text-xs font-mono text-gray-200 focus:outline-none"
          />
        </div>
      </div>

      {/* AI Semantic Evaluation Card */}
      {diffResult?.ai_assessment && (
        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Semantic Preservation Assessment
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                diffResult.ai_assessment.semantic_equivalence === 'High'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}
            >
              Equivalence: {diffResult.ai_assessment.semantic_equivalence}
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed bg-[#161925] p-3 rounded-lg border border-[#232738]">
            {diffResult.ai_assessment.assessment}
          </p>

          {diffResult.ai_assessment.behavioral_differences?.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-[11px] font-semibold text-amber-400">Behavioral Nuances:</h4>
              <ul className="text-xs text-amber-200/80 list-disc list-inside space-y-0.5">
                {diffResult.ai_assessment.behavioral_differences.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Diff View Controls & Stats */}
      {diffResult && (
        <div className="bg-[#12141f] border border-[#232738] rounded-xl overflow-hidden">
          <div className="h-11 px-4 bg-[#161925] border-b border-[#232738] flex items-center justify-between text-xs">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <Plus className="w-3.5 h-3.5" /> {diffResult.stats.added} additions
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <Minus className="w-3.5 h-3.5" /> {diffResult.stats.removed} deletions
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{diffResult.stats.unchanged} unchanged lines</span>
            </div>

            {/* View Mode & Export */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-[#11131c] p-0.5 border border-[#232738]">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('unified')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'unified' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Unified Patch
                </button>
              </div>

              <button
                onClick={handleCopyUnified}
                className="px-2.5 py-1 rounded bg-[#1f2336] hover:bg-[#282d45] text-gray-200 text-xs flex items-center gap-1"
                title="Copy Unified Diff"
              >
                {copiedDiff ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Diff
              </button>

              <button
                onClick={handleDownloadDiff}
                className="p-1.5 rounded bg-[#1f2336] hover:bg-[#282d45] text-gray-200"
                title="Download Patch File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Diff Content */}
          <div className="p-4 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto bg-[#0d0f15]">
            {viewMode === 'unified' ? (
              <pre className="text-gray-300 whitespace-pre">
                {diffResult.unified_diff}
              </pre>
            ) : (
              <table className="w-full border-collapse">
                <tbody>
                  {diffResult.diff_lines.map((line, idx) => {
                    const isAdded = line.type === 'added';
                    const isRemoved = line.type === 'removed';
                    return (
                      <tr
                        key={idx}
                        className={
                          isAdded
                            ? 'bg-emerald-950/20 text-emerald-300'
                            : isRemoved
                            ? 'bg-rose-950/20 text-rose-300'
                            : 'text-gray-400 hover:bg-[#141724]'
                        }
                      >
                        <td className="w-10 text-right pr-2 select-none text-gray-600 border-r border-[#232738]">
                          {line.old_line_no || ''}
                        </td>
                        <td className="w-10 text-right pr-2 select-none text-gray-600 border-r border-[#232738]">
                          {line.new_line_no || ''}
                        </td>
                        <td className="w-6 text-center select-none font-bold">
                          {isAdded ? '+' : isRemoved ? '-' : ' '}
                        </td>
                        <td className="pl-2 whitespace-pre py-0.5">{line.content}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
