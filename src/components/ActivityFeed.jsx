import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Clock, User, ArrowRight } from 'lucide-react';

export default function ActivityFeed() {
  const { activities, openReviewModal, tasks } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Heading */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-400" />
          ColorLab Live Activity Timeline
        </h1>
        <p className="text-xs text-slate-400">Real-time pulse of actions across all office workstations</p>
      </div>

      {/* Activity Timeline List */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-apple">
        {activities.map((item, index) => (
          <div key={item.id || index} className="flex items-start gap-3.5 pb-4 border-b border-white/5 last:border-0 last:pb-0">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-400 mt-0.5">
              ⚡
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.user}</span>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
