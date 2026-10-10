import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  GitCompare,
  History,
  FolderGit2,
  FileCode,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Code Translator', path: '/translator', icon: ArrowLeftRight, badge: 'Core' },
  { name: 'AI Explainer', path: '/explainer', icon: Sparkles },
  { name: 'Code Validator', path: '/validator', icon: CheckCircle2 },
  { name: 'Diff & Compare', path: '/compare', icon: GitCompare },
  { name: 'History', path: '/history', icon: History },
  { name: 'Saved Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Templates', path: '/templates', icon: FileCode },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`border-r border-[#232738] bg-[#0e1017] flex flex-col justify-between transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="py-3 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161925]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[#1c2030]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#161925] text-xs transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
