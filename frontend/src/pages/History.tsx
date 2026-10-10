import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Calendar,
  Clock,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TranslationRecord, LanguageInfo } from '../types';
import { useAuth } from '../context/AuthContext';

export const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<TranslationRecord[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    fetchHistory();
  }, [sourceLang, targetLang, statusFilter, sortOrder]);

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getTranslations({
        source_language: sourceLang || undefined,
        target_language: targetLang || undefined,
        status_filter: statusFilter || undefined,
        search: search || undefined,
        sort_order: sortOrder
      });
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation record?')) return;
    try {
      await api.deleteTranslation(id);
      setRecords(records.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete your entire translation history? This cannot be undone.')) return;
    try {
      await api.clearAllTranslations();
      setRecords([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyCode = (id: string, code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-indigo-400" />
            Translation History & Activity Log
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Search, review, re-open, or retry previously executed source-to-target code conversions.
          </p>
        </div>
        {user && records.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
              placeholder="Search code snippets or results..."
              className="w-full bg-[#161925] border border-[#24283c] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 rounded-lg bg-[#1c2030] hover:bg-[#252a40] text-gray-300 font-medium"
          >
            Filter
          </button>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Lang */}
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-[#161925] border border-[#24283c] rounded-lg px-2.5 py-1.5 text-xs text-gray-300"
          >
            <option value="">All Source Langs</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Target Lang */}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-[#161925] border border-[#24283c] rounded-lg px-2.5 py-1.5 text-xs text-gray-300"
          >
            <option value="">All Target Langs</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161925] border border-[#24283c] rounded-lg px-2.5 py-1.5 text-xs text-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="bg-[#161925] border border-[#24283c] rounded-lg px-2.5 py-1.5 text-xs text-gray-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* History Records List */}
      {!user ? (
        <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-gray-200">Authentication Required for Persistent History</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Sign in to automatically save, review, and organize every translation in your secure private workspace.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500 text-xs">
          Loading translation history...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-10 text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No Records Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No translations matched your active search filters. Start a new translation to build your history log.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-[#12141f] border border-[#232738] hover:border-[#353a54] rounded-xl p-5 space-y-4 transition-all shadow-md"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202436] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-gray-200 uppercase font-mono">
                    {item.source_language}
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm text-indigo-400 uppercase font-mono">
                    {item.target_language}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.status === 'partial'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    {item.provider}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {item.duration_ms}ms
                  </span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Code Previews Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#161925] border border-[#24283c] rounded-lg p-3 overflow-hidden">
                  <p className="text-[10px] uppercase text-gray-500 mb-1 font-bold">Source Code</p>
                  <pre className="text-gray-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {item.source_code}
                  </pre>
                </div>

                <div className="bg-[#161925] border border-[#24283c] rounded-lg p-3 overflow-hidden">
                  <p className="text-[10px] uppercase text-indigo-400 mb-1 font-bold">Translated Output</p>
                  <pre className="text-gray-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {item.translated_code || '(No translated code)'}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <p className="text-gray-500 text-[11px] truncate max-w-md">
                  {item.explanation || 'Direct conversion applied.'}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(item.id, item.translated_code)}
                    className="p-1.5 rounded hover:bg-[#1a1e2e] text-gray-400 hover:text-gray-200 flex items-center gap-1"
                    title="Copy translated output"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>

                  <button
                    onClick={() => navigate(`/translator?history_id=${item.id}`)}
                    className="px-2.5 py-1 rounded bg-[#1c2030] hover:bg-[#252a40] text-indigo-400 font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Translator
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
