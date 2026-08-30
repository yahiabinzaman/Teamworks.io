import React from 'react';
import { useApp } from '../context/AppContext';
import { Users2, CheckCircle, Clock, Zap, TrendingUp, Sparkles, FolderOpen } from 'lucide-react';

export default function WorkloadView() {
  const { users, tasks, setIsTaskModalOpen, setEditingTask, openLocalPath } = useApp();

  const designers = users.filter(u => u.role !== 'admin');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Team Workload & Capacity Balancer</h1>
        <p className="text-xs text-slate-400">Real-time designer workload tracking to balance project distribution across 10-12 employees</p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designers.map((user) => {
          const userTasks = tasks.filter(t => t.assignedId === user.id || t.assignedTo?.includes(user.name.split(' ')[0]));
          const activeTasks = userTasks.filter(t => t.status !== 'approved' && t.status !== 'delivered');
          const completedTasks = userTasks.filter(t => t.status === 'approved' || t.status === 'delivered');
          const inReviewTasks = userTasks.filter(t => t.status === 'internal_review' || t.status === 'client_review');

          const loadPercent = Math.min(100, Math.round((activeTasks.length / user.maxLoad) * 100));
          const isHigh = loadPercent >= 80;

          return (
            <div 
              key={user.id}
              className="p-5 rounded-3xl glass-panel border border-white/10 hover:border-brand-500/30 transition-all space-y-4 shadow-apple"
            >
              {/* Top User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-2xl bg-white/5 border border-white/10">{user.avatar}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{user.name}</h3>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  isHigh 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {loadPercent}% Capacity
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Current Workload</span>
                  <span className="font-bold text-white">{activeTasks.length} / {user.maxLoad} Tasks</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh 
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                        : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] text-slate-400 font-medium">Active</p>
                  <p className="text-base font-bold text-white">{activeTasks.length}</p>
                </div>
                <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] text-amber-400 font-medium">In Review</p>
                  <p className="text-base font-bold text-amber-300">{inReviewTasks.length}</p>
                </div>
                <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] text-emerald-400 font-medium">Done</p>
                  <p className="text-base font-bold text-emerald-300">{completedTasks.length}</p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setEditingTask({ assignedId: user.id, assignedTo: user.name });
                  setIsTaskModalOpen(true);
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-white/5 hover:bg-brand-500 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assign New Project</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
