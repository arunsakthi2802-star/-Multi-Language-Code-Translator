import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  Download,
  Calendar,
  Tag,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project, LanguageInfo } from '../types';
import { useAuth } from '../context/AuthContext';

export const Projects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    source_language: 'python',
    target_language: 'javascript',
    source_code: '',
    translated_code: '',
    notes: '',
    tags: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.getLanguages().then(setLanguages).catch(console.error);
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getProjects(search || undefined);
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeProject.name?.trim()) return;
    try {
      if (isEditing && activeProject.id) {
        await api.updateProject(activeProject.id, activeProject);
      } else {
        await api.createProject(activeProject);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProject(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenInTranslator = (p: Project) => {
    navigate(
      `/translator?template_lang=${p.source_language}&template_code=${encodeURIComponent(
        p.source_code
      )}`
    );
  };

  const handleDownload = (p: Project) => {
    const content = `/* === SOURCE CODE (${p.source_language.toUpperCase()}) === */\n\n${p.source_code}\n\n/* === TRANSLATED CODE (${p.target_language.toUpperCase()}) === */\n\n${p.translated_code || ''}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.name.replace(/\s+/g, '_')}_project.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141f] border border-[#232738] rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Saved Translation Projects & Workspace
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize multi-language software conversion projects with notes, version tags, and 1-click editor reloading.
          </p>
        </div>
        {user && (
          <button
            onClick={() => {
              setIsEditing(false);
              setActiveProject({
                name: '',
                description: '',
                source_language: 'python',
                target_language: 'javascript',
                source_code: 'print("Hello from project")',
                translated_code: '',
                notes: '',
                tags: 'v1,experiment'
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#12141f] border border-[#232738] rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
            placeholder="Search projects by name, tag, or description..."
            className="w-full bg-[#161925] border border-[#24283c] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {!user ? (
        <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-gray-200">Sign In to Create & Manage Projects</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Log in to save your translated code bases, keep notes, and organize multi-file conversions.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500 text-xs">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-[#12141f] border border-[#232738] rounded-2xl p-10 text-center space-y-3">
          <FolderGit2 className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No Projects Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click "New Project" or save a translation from the Code Translator page to begin building your workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-[#12141f] border border-[#232738] hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-100 group-hover:text-indigo-400 transition-colors truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                    <span className="uppercase text-gray-400">{p.source_language}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="uppercase text-indigo-400">{p.target_language}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
                  {p.description || 'No description provided.'}
                </p>

                {p.tags && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {p.tags.split(',').map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#1a1e2d] text-gray-400 px-2 py-0.5 rounded border border-[#2a2f45] flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-400" />
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#1e2235] flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500">
                  {new Date(p.updated_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenInTranslator(p)}
                    className="p-1.5 rounded hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300"
                    title="Open in Translator"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(p.id)}
                    className="p-1.5 rounded hover:bg-[#1a1e2e] text-gray-400 hover:text-gray-200"
                    title="Duplicate project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(p)}
                    className="p-1.5 rounded hover:bg-[#1a1e2e] text-gray-400 hover:text-gray-200"
                    title="Download files"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActiveProject(p);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-[#1a1e2e] text-gray-400 hover:text-gray-200"
                    title="Edit project"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-gray-400 hover:text-rose-400"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141724] border border-[#2a2f45] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                {isEditing ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={activeProject.name || ''}
                  onChange={(e) => setActiveProject({ ...activeProject, name: e.target.value })}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Description</label>
                <textarea
                  value={activeProject.description || ''}
                  onChange={(e) => setActiveProject({ ...activeProject, description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Source Language</label>
                  <select
                    value={activeProject.source_language || 'python'}
                    onChange={(e) => setActiveProject({ ...activeProject, source_language: e.target.value })}
                    className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-2.5 py-2 text-gray-200"
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Target Language</label>
                  <select
                    value={activeProject.target_language || 'javascript'}
                    onChange={(e) => setActiveProject({ ...activeProject, target_language: e.target.value })}
                    className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-2.5 py-2 text-gray-200"
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={activeProject.tags || ''}
                  onChange={(e) => setActiveProject({ ...activeProject, tags: e.target.value })}
                  placeholder="production, algorithm, benchmark"
                  className="w-full bg-[#1b1f2e] border border-[#2d3248] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#1e2336] text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!activeProject.name?.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
