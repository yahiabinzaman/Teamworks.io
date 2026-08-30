import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Flame, 
  FolderOpen, 
  ExternalLink, 
  Eye, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  MessageSquareQuote,
  FileCode,
  Trash2,
  User,
  Plus,
  Compass,
  Check
} from 'lucide-react';

export default function Dashboard() {
  const { 
    tasks, 
    users, 
    clients,
    currentUser, 
    setActiveTab, 
    setIsTaskModalOpen, 
    setEditingTask, 
    openReviewModal, 
    openLocalPath,
    updateTask,
    deleteTask,
    dashboardMode,
    setDashboardMode
  } = useApp();

  const isDesigner = currentUser?.role !== 'admin';
  const showPersonalView = isDesigner && dashboardMode === 'my_tasks';

  // Specific tasks for this logged-in designer
  const myTasks = tasks.filter(t => 
    t.assignedId === currentUser?.id || 
    t.assignedTo === currentUser?.name || 
    t.assignedTo?.startsWith(currentUser?.name?.split(' ')[0] + ' ' + (currentUser?.name?.split(' ')[1] || ''))
  );

  const myActiveTasks = myTasks.filter(t => t.status !== 'approved' && t.status !== 'delivered');
  const myInReview = myTasks.filter(t => t.status === 'internal_review' || t.status === 'client_review');
  const myCompleted = myTasks.filter(t => t.status === 'approved' || t.status === 'delivered');
  const myUrgent = myTasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'delivered');

  // Overall Studio Metric computations
  const totalActive = tasks.filter(t => t.status !== 'approved' && t.status !== 'delivered').length;
  const waitingReview = tasks.filter(t => t.status === 'internal_review' || t.status === 'client_review').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.status === 'approved' || t.status === 'delivered') return false;
    return new Date(t.deadline) < new Date();
  }).length;
  const completed = tasks.filter(t => t.status === 'approved' || t.status === 'delivered').length;

  const urgentTasks = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'delivered');

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">🔴 URGENT</span>;
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟠 HIGH</span>;
      case 'medium':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🟡 MEDIUM</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 LOW</span>;
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Working PSD/AI</span>;
      case 'internal_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">Internal Review</span>;
      case 'client_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Client WhatsApp Review</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Approved</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-200 border border-emerald-600/30">📦 Delivered</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Assigned</span>;
    }
  };

  const handleDeleteTask = (e, taskId, title) => {
    e.stopPropagation();
    if (confirm(`⚠️ Are you sure you want to completely remove/delete "${title}"?`)) {
      deleteTask(taskId);
    }
  };

  const openWhatsAppChat = (task) => {
    const matchedClient = clients.find(c => c.name === task.client || c.id === task.clientId);
    const phone = matchedClient?.whatsapp || matchedClient?.phone || '8801700000001';
    const message = encodeURIComponent(`Hello ${task.client}, ColorLab Update: Your project "${task.title}" is currently in progress.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with View Switcher */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 relative overflow-hidden shadow-apple">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-brand-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentUser?.avatar || '👨‍💼'}</span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {isDesigner ? `Workstation: ${currentUser?.name}` : `Welcome, ${currentUser?.name}`}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                currentUser?.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
              }`}>
                {currentUser?.designation || (currentUser?.role === 'admin' ? 'Founder & Executive Director' : 'Designer Workspace')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {showPersonalView 
                ? `Showing your personal assignments (${myActiveTasks.length} active tasks today). Have a productive day!`
                : 'Central studio workload distribution & 24/7 review status across all 12 workstations.'
              }
            </p>
          </div>

          {/* View Mode Toggle Switcher for Designers */}
          <div className="flex items-center gap-2 flex-wrap">
            {isDesigner && (
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.05] border border-white/10">
                <button
                  onClick={() => setDashboardMode('my_tasks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dashboardMode === 'my_tasks'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎯 My Workstation ({myActiveTasks.length})
                </button>
                <button
                  onClick={() => setDashboardMode('studio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    dashboardMode === 'studio'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌐 Overall Studio ({totalActive})
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('kanban')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <span>Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setEditingTask(isDesigner ? { assignedId: currentUser?.id, assignedTo: currentUser?.name } : null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-glow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {showPersonalView ? 'My Active Tasks' : 'Active Tasks'}
            </span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {showPersonalView ? myActiveTasks.length : totalActive}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {showPersonalView ? 'Assigned to you' : 'In studio'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {showPersonalView ? 'My In Review' : 'Waiting Review'}
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">
              {showPersonalView ? myInReview.length : waitingReview}
            </span>
            <span className="text-[11px] text-amber-400/80 font-medium">Proofs</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">
              {showPersonalView ? myTasks.filter(t => t.status === 'in_progress').length : inProgress}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Working PSD/AI</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Urgent Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">
              {showPersonalView ? myUrgent.length : overdue}
            </span>
            <span className="text-[11px] text-rose-400/80 font-medium">Top Focus</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/30 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Done / Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">
              {showPersonalView ? myCompleted.length : completed}
            </span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Delivered</span>
          </div>
        </div>

      </div>

      {/* PERSONAL WORKSTATION VIEW (When Designer is Selected) */}
      {showPersonalView ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">My Daily Task Queue ({currentUser?.name})</h2>
                <p className="text-[11px] text-slate-400">Open your Photoshop/AI files and manage design reviews</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {myActiveTasks.length} Active Tasks
            </span>
          </div>

          {myActiveTasks.length === 0 ? (
            <div className="p-8 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <h3 className="text-sm font-bold text-white">All caught up! No active tasks assigned to you right now.</h3>
              <p className="text-xs text-slate-400">You can create a new task or switch to Overall Studio view.</p>
              <button
                onClick={() => setDashboardMode('studio')}
                className="py-2 px-4 rounded-xl text-xs font-bold text-brand-300 bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 transition-all cursor-pointer"
              >
                View Overall Studio Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-5 rounded-3xl glass-panel border border-white/10 hover:border-brand-500/40 transition-all space-y-3 shadow-apple relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-400">{task.client}</span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">{task.title}</h3>
                      {task.dimensions && (
                        <p className="text-[11px] text-slate-400 mt-0.5">📐 {task.dimensions}</p>
                      )}
                    </div>

                    {/* Delete Task Button */}
                    <button
                      onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                      title="Remove / Delete Work"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {task.brief && (
                    <p className="text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/5 line-clamp-2">
                      📝 {task.brief}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Status:</span>
                      {getStatusPill(task.status)}
                    </div>
                    <span className="text-amber-400 text-xs font-semibold">
                      ⏰ {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* 1-Click Launchers Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </button>

                    <button
                      onClick={() => openLocalPath(task.serverFolder)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>NAS Folder</span>
                    </button>

                    <button
                      onClick={() => openWhatsAppChat(task)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                  </div>

                  {/* Review Proof Link */}
                  {task.versions && task.versions.length > 0 && (
                    <button
                      onClick={() => openReviewModal(task.id)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open Frame.io Proof ({task.versions[task.versions.length - 1].versionNumber})</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* OVERALL STUDIO VIEW & WORKLOAD BALANCER */
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Employee Workload Balancer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">👥</span>
                  <h2 className="text-base font-bold text-white tracking-tight">Studio Workload Distribution</h2>
                  <span className="text-[11px] text-slate-400 font-normal">({users.length} Active Roster)</span>
                </div>
                <button
                  onClick={() => setActiveTab('workload')}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Full Analytics <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.filter(u => u.role !== 'admin').map((user) => {
                  const activeCount = tasks.filter(t => 
                    (t.assignedId === user.id || t.assignedTo === user.name || t.assignedTo?.startsWith(user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1] || ''))) && 
                    t.status !== 'approved' && t.status !== 'delivered'
                  ).length;
                  const loadPercent = Math.min(100, Math.round((activeCount / user.maxLoad) * 100));
                  const isOverloaded = loadPercent >= 80;

                  return (
                    <div key={user.id} className="p-4 rounded-2xl bg-dark-surface/60 border border-white/5 hover:border-white/10 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 rounded-xl bg-white/5">{user.avatar}</span>
                          <div>
                            <p className="text-xs font-semibold text-white">{user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.role === 'editor' ? 'Video/Motion' : 'Photoshop/Illustrator'}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isOverloaded 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : loadPercent > 40 
                              ? 'bg-amber-500/20 text-amber-300' 
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {loadPercent}% Capacity
                        </span>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{activeCount} Active Tasks</span>
                          <span>Max: {user.maxLoad}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverloaded ? 'bg-rose-500' : loadPercent > 40 ? 'bg-amber-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${loadPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick assign button */}
                      <button
                        onClick={() => {
                          setEditingTask({ assignedId: user.id, assignedTo: user.name });
                          setIsTaskModalOpen(true);
                        }}
                        className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all cursor-pointer"
                      >
                        + Assign Task to {user.name.split(' ')[0]}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Urgent & Review Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Urgent & Review Queue</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {urgentTasks.length} Priority
                </span>
              </div>

              <div className="space-y-2.5">
                {urgentTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-dark-surface/80 border border-white/10 hover:border-brand-500/40 transition-all space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400 truncate">{task.client}</span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <h3 className="text-xs font-bold text-white leading-snug">{task.title}</h3>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span className="truncate">👤 {task.assignedTo?.split(' ')[0]}</span>
                      <span className="text-amber-400 font-medium">⏰ {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {task.versions && task.versions.length > 0 ? (
                        <button
                          onClick={() => openReviewModal(task.id)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review ({task.versions[task.versions.length - 1].versionNumber})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-brand-500/20 hover:bg-brand-500/30 text-brand-200 border border-brand-500/30 transition-all cursor-pointer"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>Photoshop</span>
                        </button>
                      )}

                      <button
                        onClick={() => openLocalPath(task.serverFolder)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Server Dir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Task List Overview */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Active Workstation Projects</h2>
                <p className="text-xs text-slate-400">All live tasks tracked across ColorLab file server</p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
              >
                + Add Project
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 rounded-2xl bg-dark-surface/40 border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-amber-400">{task.client}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-semibold text-white">{task.title}</span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      <span>👤 {task.assignedTo}</span>
                      <span>•</span>
                      <span>📐 {task.dimensions || 'Standard'}</span>
                      <span>•</span>
                      <span className="text-amber-400">⏰ {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusPill(task.status)}

                    {/* WhatsApp */}
                    <button
                      onClick={() => openWhatsAppChat(task)}
                      title="WhatsApp Client Chat"
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <span>💬</span>
                    </button>

                    {/* Open File / Folder */}
                    <button
                      onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                      title="Open in Photoshop / Illustrator"
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <FileCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openLocalPath(task.serverFolder)}
                      title="Open NAS Folder"
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>

                    {/* Delete Task */}
                    <button
                      onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                      title="Remove Task"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
