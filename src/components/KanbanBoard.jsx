import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  FolderOpen, 
  FileCode, 
  Eye, 
  MessageSquare, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-500/40 text-slate-300', dot: 'bg-slate-400' },
  { id: 'assigned', title: 'Assigned', color: 'border-blue-500/40 text-blue-300', dot: 'bg-blue-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-indigo-500/40 text-indigo-300', dot: 'bg-indigo-400' },
  { id: 'internal_review', title: 'Internal Review', color: 'border-amber-500/40 text-amber-300', dot: 'bg-amber-400' },
  { id: 'client_review', title: 'Client Review', color: 'border-purple-500/40 text-purple-300', dot: 'bg-purple-400' },
  { id: 'revision', title: 'Revision', color: 'border-rose-500/40 text-rose-300', dot: 'bg-rose-400' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' },
  { id: 'delivered', title: 'Delivered', color: 'border-emerald-600/40 text-emerald-200', dot: 'bg-emerald-500' }
];

export default function KanbanBoard() {
  const { 
    tasks, 
    clients,
    updateTask, 
    setIsTaskModalOpen, 
    setEditingTask, 
    openReviewModal, 
    openLocalPath,
    searchQuery
  } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Filter tasks based on search
  const filteredTasks = tasks.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.client.toLowerCase().includes(q) ||
      t.assignedTo.toLowerCase().includes(q) ||
      t.project?.toLowerCase().includes(q)
    );
  });

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { status: targetStatus });
      setDraggedTaskId(null);
    }
  };

  const moveTask = (taskId, currentStatus, direction) => {
    const currentIndex = KANBAN_COLUMNS.findIndex(c => c.id === currentStatus);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < KANBAN_COLUMNS.length) {
      updateTask(taskId, { status: KANBAN_COLUMNS[nextIndex].id });
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">ColorLab Workflow Board</h1>
          <p className="text-xs text-slate-400">Drag & drop tasks across 8 production stages</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-230px)]">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="w-80 flex-shrink-0 flex flex-col max-h-[calc(100vh-240px)] rounded-2xl bg-dark-surface/50 border border-white/10 p-3 glass-panel"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-white/5 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingTask({ status: col.id });
                    setIsTaskModalOpen(true);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.map((task) => {
                  const latestVersion = task.versions && task.versions.length > 0 ? task.versions[task.versions.length - 1] : null;
                  const openCommentsCount = latestVersion?.comments?.filter(c => c.status === 'open').length || 0;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="p-3.5 rounded-xl bg-dark-card/90 border border-white/10 hover:border-brand-500/40 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md space-y-2.5 group"
                    >
                      {/* Top info */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 truncate uppercase tracking-wider">
                          {task.client}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-white leading-snug group-hover:text-brand-300 transition-colors">
                        {task.title}
                      </h4>

                      {/* Brief info */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {task.brief || 'No additional instructions'}
                      </p>

                      {/* Meta Tags: Dimensions & Deadline */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        {task.dimensions && (
                          <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                            {task.dimensions}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Proof Preview Pill (Frame.io link) */}
                      {latestVersion && (
                        <button
                          onClick={() => openReviewModal(task.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-[11px] font-medium transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Proof {latestVersion.versionNumber}</span>
                          </div>
                          {openCommentsCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-300">
                              <MessageSquare className="w-3 h-3" />
                              {openCommentsCount}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Card Footer: Assignee & Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                          {task.assignedTo?.split(' ')[0]}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Left Move button */}
                          <button
                            onClick={() => moveTask(task.id, task.status, -1)}
                            disabled={col.id === 'backlog'}
                            title="Move Left"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Chat */}
                          <button
                            onClick={() => {
                              const matchedClient = clients.find(c => c.name === task.client || c.id === task.clientId);
                              const phone = matchedClient?.whatsapp || matchedClient?.phone || '8801700000001';
                              const message = encodeURIComponent(`Hello ${task.client}, ColorLab Update: Your design "${task.title}" status is currently "${task.status}".`);
                              window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
                            }}
                            title="1-Click WhatsApp Conversation"
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
                          >
                            <span className="text-xs">💬</span>
                          </button>

                          {/* Open in Photoshop / Illustrator */}
                          <button
                            onClick={() => openLocalPath(task.workingFile || task.serverFolder)}
                            title="Open in Photoshop / Illustrator"
                            className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Open Folder */}
                          <button
                            onClick={() => openLocalPath(task.serverFolder)}
                            title="Open Project Folder on NAS"
                            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>

                          {/* Right Move button */}
                          <button
                            onClick={() => moveTask(task.id, task.status, 1)}
                            disabled={col.id === 'delivered'}
                            title="Move Right"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
