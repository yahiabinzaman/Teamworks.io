import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Kanban, 
  Users2, 
  Building2, 
  Activity, 
  Plus, 
  Search, 
  Radio, 
  FolderSync, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  Palette
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    setIsTaskModalOpen,
    setEditingTask,
    isConnected,
    openLocalPath,
    setIsSettingsOpen
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'workload', label: 'Team Workload', icon: Users2 },
    { id: 'clients', label: 'Clients & WhatsApp', icon: Building2 },
    { id: 'activity', label: 'Live Stream', icon: Activity }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="ColorLab Official Logo" 
              className="h-10 w-10 rounded-2xl object-cover shadow-glow border border-white/20 hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">ColorLab</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Works
                </span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Click to configure Central Server IP"
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer group"
              >
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span>{isConnected ? 'LAN Sync Active' : 'Offline'}</span>
                <span className="text-[9px] opacity-0 group-hover:opacity-100">⚙️</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, clients, projects, or file names (⌘K)..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Right Actions: Server Folder + New Task + Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Quick Open Multi-Drive NAS Launcher */}
          <div className="relative group">
            <button
              onClick={() => openLocalPath('smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027')}
              title="Open Central NAS Drive"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <FolderSync className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">NAS Drives</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Hover/Click Dropdown to pick specific NAS Drive */}
            <div className="absolute left-0 mt-1.5 w-72 glass-dropdown rounded-2xl p-2 z-50 hidden group-hover:block animate-in fade-in zoom-in-95 shadow-2xl">
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10 mb-1">
                Office NAS Network Drives
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => openLocalPath('smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-amber-300 font-medium"
                >
                  <span>★ Diary 2027 (Active)</span>
                  <span className="text-[10px] text-slate-500 font-mono">SSD</span>
                </button>
                <button
                  onClick={() => openLocalPath('smb://COLORLAB-NAS/990 Pro 2TB SSD')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-slate-300"
                >
                  <span>💾 990 Pro 2TB SSD</span>
                  <span className="text-[10px] text-slate-500 font-mono">Root</span>
                </button>
                <button
                  onClick={() => openLocalPath('smb://COLORLAB-NAS/COLOR LAB - NAS')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-slate-300"
                >
                  <span>🗄️ COLOR LAB - NAS</span>
                  <span className="text-[10px] text-slate-500 font-mono">Storage</span>
                </button>
              </div>
            </div>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          {/* User Role Switcher Dropdown (To simulate any employee or admin easily) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-all text-xs"
            >
              <span className="text-base">{currentUser?.avatar || '👤'}</span>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-white leading-tight leading-none text-[11px]">{currentUser?.name?.split(' ')[0] || 'User'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role || 'Guest'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Switch Active View (Workstation)</p>
                  <p className="text-xs text-slate-300">Simulate any PC in ColorLab</p>
                </div>
                <div className="space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                        currentUser?.id === u.id 
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' 
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{u.avatar}</span>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                        </div>
                      </div>
                      {u.role === 'admin' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Palette className="w-3.5 h-3.5 text-brand-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-white/10 px-2 py-1.5 bg-dark-surface/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
                isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </header>
  );
}
