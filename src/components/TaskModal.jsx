import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, FolderSync, Calendar, User, Layers, Tag, FileText } from 'lucide-react';

export default function TaskModal() {
  const { 
    isTaskModalOpen, 
    setIsTaskModalOpen, 
    editingTask, 
    createTask, 
    updateTask, 
    users, 
    clients 
  } = useApp();

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    client: 'Abnaul Markaz',
    clientId: 'c_2027_1',
    project: '',
    assignedTo: 'Yahia (Lead Designer)',
    assignedId: 'u2',
    priority: 'high',
    status: 'assigned',
    deadline: '',
    dimensions: 'Diary Standard (A5 / 148 × 210 mm)',
    format: 'Illustrator (.AI)',
    serverFolder: 'smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027/Abnaul Markaz 27',
    workingFile: '',
    brief: ''
  });

  const query = (clientSearchQuery || '').toLowerCase().trim();

  // Active 2027 clients list (or matching query)
  const matching2027Clients = clients
    .filter(c => c.isCurrentYear)
    .filter(c => !query || c.name.toLowerCase().includes(query));

  // Archive suggestions (only if searching)
  const matchingArchiveClients = query 
    ? clients.filter(c => !c.isCurrentYear && c.name.toLowerCase().includes(query))
    : [];

  useEffect(() => {
    if (editingTask && editingTask.id) {
      setFormData(editingTask);
    } else if (editingTask) {
      // Pre-set assignee or status from quick button
      setFormData(prev => ({
        ...prev,
        ...editingTask,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
      }));
    } else {
      // Default new task
      const defaultClient = clients[0]?.name || 'ABC Company';
      const defaultUser = users.find(u => u.role !== 'admin') || users[1];
      setFormData({
        title: '',
        client: defaultClient,
        clientId: clients[0]?.id || 'c1',
        project: '',
        assignedTo: defaultUser?.name || 'Yahia (Lead Designer)',
        assignedId: defaultUser?.id || 'u2',
        priority: 'high',
        status: 'assigned',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
        dimensions: '1080 × 1080 px (1:1)',
        format: 'Photoshop (.PSD)',
        serverFolder: `\\\\COLORLAB-SERVER\\Projects\\2026\\${defaultClient.replace(/\s+/g, '_')}`,
        workingFile: '',
        brief: ''
      });
    }
  }, [editingTask, isTaskModalOpen, clients, users]);

  if (!isTaskModalOpen) return null;

  const handleClientChange = (clientName) => {
    const selected = clients.find(c => c.name === clientName);
    setFormData(prev => ({
      ...prev,
      client: clientName,
      clientId: selected?.id || '',
      serverFolder: selected?.folderPath || `smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027/${clientName}`
    }));
  };

  const handleAssigneeChange = (userName) => {
    const selected = users.find(u => u.name === userName);
    setFormData(prev => ({
      ...prev,
      assignedTo: userName,
      assignedId: selected?.id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask && editingTask.id) {
      await updateTask(editingTask.id, formData);
    } else {
      await createTask(formData);
    }

    setIsTaskModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-dark-surface border border-white/15 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-card">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="ColorLab" 
              className="w-8 h-8 rounded-xl object-cover border border-white/15 shadow-sm"
            />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {editingTask?.id ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-[11px] text-slate-400">ColorLab Studio Assignment</p>
            </div>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Eid Campaign - Facebook & Instagram Banner"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Client & Project Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Client <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">({clients.length} clients in database)</span>
              </label>
              
              {/* Custom Searchable Client Input / Dropdown */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleClientChange(val);
                    setClientSearchQuery(val);
                    setIsClientDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsClientDropdownOpen(true);
                  }}
                  placeholder="Type or select Diary 2027 client..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />

                {isClientDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setIsClientDropdownOpen(false)}
                    ></div>
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto glass-dropdown rounded-2xl p-2 z-30 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 space-y-2">
                      
                      {/* 1. CURRENT YEAR 2027 ACTIVE CLIENTS SECTION */}
                      {matching2027Clients.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-amber-400/90 flex items-center justify-between">
                            <span>★ Diary 2027 Active Clients ({matching2027Clients.length})</span>
                          </div>
                          <div className="space-y-0.5">
                            {matching2027Clients.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  handleClientChange(c.name);
                                  setIsClientDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                                  formData.client === c.name 
                                    ? 'bg-brand-500 text-white font-bold shadow-sm' 
                                    : 'hover:bg-white/5 text-slate-200'
                                }`}
                              >
                                <span className="truncate font-medium">{c.name}</span>
                                <span className="text-[10px] text-amber-300 font-mono px-1.5 py-0.2 rounded bg-amber-500/15">2027</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. SUGGESTIONS FROM PREVIOUS YEARS / ARCHIVE (Only shows when user types something) */}
                      {clientSearchQuery.trim() && matchingArchiveClients.length > 0 && (
                        <div className="pt-1 border-t border-white/10">
                          <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center justify-between">
                            <span>💡 Suggestions from Past Clients ({matchingArchiveClients.length})</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchingArchiveClients.slice(0, 10).map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  handleClientChange(c.name);
                                  setIsClientDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-200 transition-all"
                              >
                                <span className="truncate">{c.name}</span>
                                <span className="text-[9px] text-slate-500 italic">Add for 2027</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. NEW CLIENT CREATION OPTION */}
                      {clientSearchQuery.trim() && (
                        <div className="pt-1 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              handleClientChange(clientSearchQuery.trim());
                              setIsClientDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border border-brand-500/30 flex items-center gap-2 font-medium"
                          >
                            <span>+</span>
                            <span>Use <b>"{clientSearchQuery.trim()}"</b> as new 2027 client</span>
                          </button>
                        </div>
                      )}

                      {matching2027Clients.length === 0 && matchingArchiveClients.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                          No matching client found. Type name to create.
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Campaign</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="e.g. Admission / Prospectus 2026"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assign To Designer</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-dark-card border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.name}>
                    {u.avatar} {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-dark-card border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="urgent">🔴 Urgent (Same Day)</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Normal / Low</option>
              </select>
            </div>
          </div>

          {/* Dimensions, Format, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="1080 × 1080 px"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format</label>
              <input
                type="text"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                placeholder="Photoshop (.PSD)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-dark-card border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Server Folder Path & Working File */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                File Server Folder Path
              </label>

              {/* Quick Drive Switcher Pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const clientPart = formData.client ? `/${formData.client}` : '';
                    setFormData({ ...formData, serverFolder: `smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027${clientPart}` });
                  }}
                  className="px-2 py-0.5 text-[10px] rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium transition-all"
                >
                  Diary 2027
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clientPart = formData.client ? `/${formData.client}` : '';
                    setFormData({ ...formData, serverFolder: `smb://COLORLAB-NAS/990 Pro 2TB SSD${clientPart}` });
                  }}
                  className="px-2 py-0.5 text-[10px] rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 font-medium transition-all"
                >
                  990 Pro SSD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clientPart = formData.client ? `/${formData.client}` : '';
                    setFormData({ ...formData, serverFolder: `smb://COLORLAB-NAS/COLOR LAB - NAS${clientPart}` });
                  }}
                  className="px-2 py-0.5 text-[10px] rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 font-medium transition-all"
                >
                  COLOR LAB - NAS
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={formData.serverFolder}
                onChange={(e) => setFormData({ ...formData, serverFolder: e.target.value })}
                placeholder="smb://COLORLAB-NAS/..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Instructions / Client Brief */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Client Brief / WhatsApp Instructions
            </label>
            <textarea
              rows={3}
              value={formData.brief}
              onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
              placeholder="Paste WhatsApp requirements, design notes, color codes, or layout references..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-glow transition-all"
            >
              {editingTask?.id ? 'Save Changes' : 'Create & Assign Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
