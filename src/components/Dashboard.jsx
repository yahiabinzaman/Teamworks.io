import React from 'react';
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
  FileCode
} from 'lucide-react';

export default function Dashboard() {
  const { 
    tasks, 
    users, 
    currentUser, 
    setActiveTab, 
    setIsTaskModalOpen, 
    setEditingTask, 
    openReviewModal, 
    openLocalPath,
    updateTask
  } = useApp();

  // Metric computations
  const totalActive = tasks.filter(t => t.status !== 'approved' && t.status !== 'delivered').length;
  const waitingReview = tasks.filter(t => t.status === 'internal_review' || t.status === 'client_review').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.status === 'approved' || t.status === 'delivered') return false;
    return new Date(t.deadline) < new Date();
  }).length;
  const completed = tasks.filter(t => t.status === 'approved' || t.status === 'delivered').length;

  // Filter tasks for current user if not admin
  const userTasks = currentUser?.role === 'admin' 
    ? tasks 
    : tasks.filter(t => t.assignedId === currentUser?.id || t.assignedTo?.includes(currentUser?.name?.split(' ')[0]));

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

  const getStatusBadge = (status) => {
    const map = {
      backlog: { label: 'Backlog', color: 'bg-slate-500/20 text-slate-300' },
      assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-300' },
      in_progress: { label: 'In Progress', color: 'bg-indigo-500/20 text-indigo-300' },
      internal_review: { label: 'Internal Review', color: 'bg-amber-500/20 text-amber-300' },
      client_review: { label: 'Client Review', color: 'bg-purple-500/20 text-purple-300' },
      revision: { label: 'Revision', color: 'bg-rose-500/20 text-rose-300' },
      approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300' },
      delivered: { label: 'Delivered', color: 'bg-emerald-600/30 text-emerald-200' },
    };
    const s = map[status] || { label: status, color: 'bg-slate-500/20 text-slate-300' };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-white/10 shadow-apple">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{currentUser?.avatar || '👋'}</span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome, {currentUser?.name || 'ColorLab Team'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            {currentUser?.role === 'admin' 
              ? 'Here is the real-time studio workload and active review status across all 12 workstations.'
              : `You have ${userTasks.filter(t => t.status !== 'approved' && t.status !== 'delivered').length} active projects in your workspace.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('kanban')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
          >
            <span>Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-glow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Tasks</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalActive}</span>
            <span className="text-[11px] text-emerald-400 font-medium">In studio</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Waiting Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{waitingReview}</span>
            <span className="text-[11px] text-amber-400/80 font-medium">Frame.io Proofs</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">{inProgress}</span>
            <span className="text-[11px] text-slate-400 font-medium">Working PSD/AI</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue / Urgent</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{overdue}</span>
            <span className="text-[11px] text-rose-400/80 font-medium">Needs Attention</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/30 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved / Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">{completed}</span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Delivered</span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Team Workload Barometer + Urgent Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Employee Workload Balancer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👥</span>
              <h2 className="text-base font-bold text-white tracking-tight">Studio Workload Distribution</h2>
              <span className="text-[11px] text-slate-400 font-normal">(10-12 Team Members)</span>
            </div>
            <button
              onClick={() => setActiveTab('workload')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.filter(u => u.role !== 'admin').map((user) => {
              const activeCount = tasks.filter(t => (t.assignedId === user.id || t.assignedTo === user.name || t.assignedTo?.startsWith(user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1] || ''))) && t.status !== 'approved' && t.status !== 'delivered').length;
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
                      {loadPercent}% Busy
                    </span>
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{activeCount} Active Tasks</span>
                      <span>Capacity: {user.maxLoad}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded 
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                            : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick assign button */}
                  <button
                    onClick={() => {
                      setEditingTask({ assignedId: user.id, assignedTo: user.name });
                      setIsTaskModalOpen(true);
                    }}
                    className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all"
                  >
                    + Assign New Task
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
                className="p-3.5 rounded-2xl bg-dark-surface/80 border border-white/10 hover:border-brand-500/40 transition-all space-y-2"
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
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Review ({task.versions[task.versions.length - 1].versionNumber})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-brand-500/20 hover:bg-brand-500/30 text-brand-200 border border-brand-500/30 transition-all"
                    >
                      <FileCode className="w-3 h-3" />
                      <span>Photoshop</span>
                    </button>
                  )}

                  <button
                    onClick={() => openLocalPath(task.serverFolder)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
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
            onClick={() => setActiveTab('kanban')}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            Switch to Kanban View →
          </button>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/10 font-semibold">
                <tr>
                  <th className="py-3 px-4">Task & Client</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Frame.io Proof</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {userTasks.map((task) => {
                  const latestVersion = task.versions && task.versions.length > 0 ? task.versions[task.versions.length - 1] : null;
                  const openCommentsCount = latestVersion?.comments?.filter(c => c.status === 'open').length || 0;

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-white">{task.title}</p>
                          <p className="text-[11px] text-slate-400">{task.client} • <span className="text-slate-500">{task.dimensions}</span></p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-300">{task.assignedTo}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300">
                          {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {latestVersion ? (
                          <button
                            onClick={() => openReviewModal(task.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{latestVersion.versionNumber}</span>
                            {openCommentsCount > 0 && (
                              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-bold">
                                {openCommentsCount}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No proof yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                            title="Open working file in Photoshop/Illustrator"
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-all"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openLocalPath(task.serverFolder)}
                            title="Open Project Folder in Finder/Explorer"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[11px] font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
