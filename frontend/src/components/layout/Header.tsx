import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Sun,
  Moon,
  Activity,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { SystemStatus } from '../../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getSystemStatus();
        setStatus(res);
      } catch {
        setStatus(null);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-[#232738] bg-[#11131c] px-4 flex items-center justify-between z-20 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-100 text-sm tracking-tight flex items-center gap-1.5">
              CodePolyglot <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-500/30">AI PRO</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Center Service Status */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161924] border border-[#262b3d] text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              status?.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="text-gray-300 font-medium">
            {status?.status === 'online' ? 'Backend Ready' : 'Connecting to API...'}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-400" />
            {status?.ai_provider_configured?.toUpperCase() || 'AI'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2d] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Auth profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#181c2b] border border-[#2a2f45] hover:border-indigo-500/40 text-xs text-gray-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[120px] truncate font-medium">{user.name}</span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#151824] border border-[#2a2f45] shadow-xl py-1 text-xs text-gray-300 z-50">
                <div className="px-3 py-2 border-b border-[#25293d]">
                  <p className="font-semibold text-gray-100">{user.name}</p>
                  <p className="text-gray-500 truncate text-[11px]">{user.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1e2336] transition-colors text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  Account & Settings
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#1c2030] transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
