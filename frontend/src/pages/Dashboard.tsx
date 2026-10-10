import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  Code
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user) {
          const res = await api.getDashboardStats();
          setStats(res);
        } else {
          setStats(null);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-[#141724] to-[#12141e] border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Multi-Language Code Translator
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
              v1.0.0
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Convert, analyze, validate, and compare source code across 20 programming languages with configurable AI models and deterministic fallbacks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/translator"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Open Translator
          </Link>
          <Link
            to="/templates"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c2030] hover:bg-[#252a40] text-gray-200 text-xs font-semibold border border-[#2e334a] transition-colors"
          >
            <Code className="w-4 h-4 text-indigo-400" />
            Browse Templates
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Translations</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.total_translations ?? 0}</h3>
          </div>
        </div>

        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Successful Conversions</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.successful_translations ?? 0}</h3>
          </div>
        </div>

        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Errors / Failed</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.failed_translations ?? 0}</h3>
          </div>
        </div>

        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Saved Projects</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.saved_projects ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {user && stats && stats.total_translations > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Frequency Bar Chart */}
          <div className="bg-[#12141f] border border-[#232738] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Most Frequent Source Languages
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_source_languages}>
                  <XAxis dataKey="language" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181c2b', borderColor: '#2e334a', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Target Frequency Pie Chart */}
          <div className="bg-[#12141f] border border-[#232738] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Target Conversion Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.top_target_languages}
                    dataKey="count"
                    nameKey="language"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={((props: any) => `${props.payload?.language || props.name || ''}: ${props.payload?.count || props.value || ''}`) as any}
                    fontSize={11}
                  >
                    {stats.top_target_languages.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181c2b', borderColor: '#2e334a', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Meaningful Empty State */
        <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-200">
              {user ? 'No Translations Yet' : 'Sign In to Save History & Analytics'}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              {user
                ? 'Your translation statistics and language charts will automatically appear here once you begin translating code.'
                : 'You can translate code freely as a guest, or create a free local account to persist history, organize projects, and view analytics.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/translator"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Start First Translation
            </Link>
            {!user && (
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-[#1c2030] hover:bg-[#252a40] text-gray-200 text-xs font-medium border border-[#2e334a] transition-all"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      {stats?.recent_translations && stats.recent_translations.length > 0 && (
        <div className="bg-[#12141f] border border-[#232738] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Translation Activity
            </h3>
            <Link to="/history" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#171a29] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#24283c]">
                <tr>
                  <th className="py-2.5 px-3">Languages</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Engine</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2235]">
                {stats.recent_translations.map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#161a29] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-200">
                      <span className="capitalize">{t.source_language}</span> → <span className="capitalize text-indigo-400">{t.target_language}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'partial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">{t.provider}</td>
                    <td className="py-2.5 px-3 text-gray-400">{t.duration_ms}ms</td>
                    <td className="py-2.5 px-3 text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/translator?history_id=${t.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
