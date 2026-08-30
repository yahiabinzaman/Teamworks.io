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
  FolderSync, 
  ChevronDown, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Palette,
  UserPlus
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
    setIsSettingsOpen,
    theme,
    toggleTheme,
    isAdminAuthenticated,
    setIsAdminModalOpen,
    setIsTeamModalOpen,
    logoutAdmin
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [nasDropdownOpen, setNasDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'workload', label: 'Team Workload', icon: Users2 },
    { id: 'clients', label: 'Clients & WhatsApp', icon: Building2 },
    { id: 'activity', label: 'Live Stream', icon: Activity }
  ];

  const handleNasClick = (path) => {
    openLocalPath(path);
    setNasDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-[1750px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5">
        
        {/* Left: Brand Logo & LAN Live Sync */}
        <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 shadow-glow flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="./logo.png" 
                alt="ColorLab Official Logo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-sm">ColorLab Works</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Click to configure 24/7 Cloud or LAN Server"
                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer group"
              >
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span className="font-medium">{isConnected ? '24/7 Synced' : 'Connecting...'}</span>
                <span className="text-[9px] opacity-0 group-hover:opacity-100">⚙️</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-sm font-semibold' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-sm mx-2 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, clients, or files (⌘K)..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Right Actions: NAS + Theme + New Task + Admin/Workstation */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 animate-in spin-in-180 duration-300" />
            )}
          </button>

          {/* Quick Open Multi-Drive NAS Launcher */}
          <div className="relative">
            <button
              onClick={() => setNasDropdownOpen(!nasDropdownOpen)}
              title="Open Central NAS Drive"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <FolderSync className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">NAS Drives</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {nasDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setNasDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 shadow-2xl">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>Office NAS Network Drives</span>
                    <span className="text-[9px] text-brand-400 lowercase font-normal">smb / unc</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNasClick('smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-amber-300 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>★</span>
                        <span>Diary 2027 (Active)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">SSD</span>
                    </button>
                    <button
                      onClick={() => handleNasClick('smb://COLORLAB-NAS/990 Pro 2TB SSD')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>💾</span>
                        <span>990 Pro 2TB SSD</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Root</span>
                    </button>
                    <button
                      onClick={() => handleNasClick('smb://COLORLAB-NAS/COLOR LAB - NAS')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/10 text-xs flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>🗄️</span>
                        <span>COLOR LAB - NAS</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Storage</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dedicated Admin Portal Button */}
          {!isAdminAuthenticated ? (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title="Log in to ColorLab Admin Panel"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                title="Manage Team & Studio Settings"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">👑 Admin Panel</span>
              </button>
              <button
                onClick={() => logoutAdmin()}
                title="Lock Admin Mode"
                className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* New Task Button */}
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Workstation / User Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-all text-xs cursor-pointer"
            >
              <span className="text-base">{currentUser?.avatar || '👤'}</span>
              <div className="text-left">
                <p className="font-semibold text-white leading-tight text-[11px] max-w-[130px] truncate">{currentUser?.name || 'User'}</p>
                <p className="text-[9px] text-slate-400 truncate max-w-[130px]">{currentUser?.designation || currentUser?.role || 'Guest'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-2xl space-y-2">
                  
                  {/* SECTION 1: 👑 Founder & Admin Section */}
                  <div className="p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                        👑 Executive & Admin Access
                      </span>
                      {isAdminAuthenticated ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Protected
                        </span>
                      )}
                    </div>

                    {users.filter(u => u.role === 'admin').map(admin => (
                      <div 
                        key={admin.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{admin.avatar}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{admin.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{admin.designation || 'Founder'}</p>
                          </div>
                        </div>

                        {!isAdminAuthenticated ? (
                          <button
                            onClick={() => {
                              setIsAdminModalOpen(true);
                              setUserDropdownOpen(false);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-all cursor-pointer shadow-sm"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Unlock</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setCurrentUser(admin);
                                setIsTeamModalOpen(true);
                                setUserDropdownOpen(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 font-semibold text-[10px] border border-brand-500/30"
                            >
                              Team Panel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* SECTION 2: 🎨 Design Team Workstations */}
                  <div>
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                      <span>🎨 Design Team Workstations</span>
                      <span className="text-[9px] text-slate-500">Click to switch</span>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {users.filter(u => u.role !== 'admin').map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                            currentUser?.id === u.id 
                              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' 
                              : 'hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-base flex-shrink-0">{u.avatar}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-white leading-tight truncate">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate">{u.designation || u.role}</p>
                            </div>
                          </div>
                          <Palette className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="xl:hidden flex items-center justify-around border-t border-white/10 px-2 py-1.5 bg-dark-surface/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium cursor-pointer ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
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
