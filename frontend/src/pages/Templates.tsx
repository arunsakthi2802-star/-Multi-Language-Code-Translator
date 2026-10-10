import React, { useState, useEffect } from 'react';
import {
  FileCode,
  ArrowRight,
  ExternalLink,
  Tag,
  Search,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CodeTemplate, LanguageInfo } from '../types';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    api.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  const filtered = templates.filter((t) => {
    if (category && t.category.toLowerCase() !== category.toLowerCase()) return false;
    if (difficulty && t.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.source_language.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUseTemplate = (t: CodeTemplate) => {
    navigate(
      `/translator?template_lang=${t.source_language}&template_code=${encodeURIComponent(
        t.code
      )}`
    );
  };

  const categories = ['Basics', 'Control Flow', 'Algorithms', 'OOP', 'Database'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          Code Templates & Algorithm Library
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Curated collection of standard programming constructs, data structures, algorithms, and SQL queries ready to load into the translator.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-[#161925] border border-[#24283c] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category & Difficulty Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              category === '' ? 'bg-indigo-600 text-white' : 'bg-[#161925] text-gray-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-[#161925] text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-[#161925] border border-[#24283c] rounded-lg px-2.5 py-1.5 text-xs text-gray-300 ml-2"
          >
            <option value="">All Difficulties</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-[#12141f] border border-[#232738] hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                  {t.source_language}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    t.difficulty === 'Beginner'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : t.difficulty === 'Intermediate'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {t.difficulty}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-100 group-hover:text-indigo-400 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[32px]">
                  {t.description}
                </p>
              </div>

              {/* Code Snippet Preview */}
              <div className="bg-[#161925] border border-[#232738] rounded-lg p-2.5 font-mono text-[11px] text-gray-300 max-h-32 overflow-hidden relative">
                <pre className="whitespace-pre-wrap">{t.code}</pre>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#161925] to-transparent pointer-events-none" />
              </div>

              {t.expected_behavior && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.expected_behavior}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleUseTemplate(t)}
              className="w-full py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Translator
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
