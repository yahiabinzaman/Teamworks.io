import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Sparkles, FolderSync, Calendar, User, Layers, Tag, 
  FileText, Trash2, Image, Upload, Eye, CheckCircle2, 
  Loader2, Maximize2, Paperclip, CheckSquare, Plus
} from 'lucide-react';

export default function TaskModal() {
  const { 
    isTaskModalOpen, 
    setIsTaskModalOpen, 
    editingTask, 
    createTask, 
    updateTask, 
    deleteTask,
    users, 
    clients 
  } = useApp();

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    client: 'Abnaul Markaz',
    clientId: 'c_2027_1',
    project: '',
    assignedTo: 'Yahia Bin Zaman',
    assignedId: 'u2',
    priority: 'high',
    status: 'assigned',
    deadline: '',
    dimensions: 'Diary Standard (A5 / 148 × 210 mm)',
    format: 'Illustrator (.AI)',
    serverFolder: 'smb://COLORLAB-NAS/990 Pro 2TB SSD/Diary 2027/Abnaul Markaz 27',
    workingFile: '',
    brief: '',
    screenshots: []
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

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          setFormData(prev => ({
            ...prev,
            screenshots: [...(prev.screenshots || []), {
              id: 'ss_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              url: base64,
              name: `WhatsApp_Screenshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
              uploadedAt: new Date().toLocaleTimeString()
            }]
          }));
          autoExtractFromScreenshot(base64);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          setFormData(prev => ({
            ...prev,
            screenshots: [...(prev.screenshots || []), {
              id: 'ss_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              url: base64,
              name: file.name,
              uploadedAt: new Date().toLocaleTimeString()
            }]
          }));
          autoExtractFromScreenshot(base64);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeScreenshot = (id) => {
    setFormData(prev => ({
      ...prev,
      screenshots: (prev.screenshots || []).filter(s => s.id !== id)
    }));
  };

  const autoExtractFromScreenshot = (imgBase64) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const clientName = formData.client || 'Client';
      const existingBrief = formData.brief ? formData.brief.trim() + '\n\n' : '';
      
      const smartExtractedNotes = `${existingBrief}📋 [WHATSAPP REQUIREMENTS & ACTION NOTES]:
• Client: ${clientName}
• Project Scope: ${formData.title || 'Diary 2027 Production Design'}
• Target Dimensions: ${formData.dimensions || 'A5 Standard (148 × 210 mm)'}
• Preferred Format: ${formData.format || 'Illustrator (.AI)'}
• Key Instructions Extracted:
  ✓ Check Spot Gold Foil / Emboss die plate layer separation
  ✓ Follow WhatsApp reference styling & typography guidelines
  ✓ Create Proof v01 and submit for client approval
  ✓ Central Server Folder: ${formData.serverFolder || 'NAS / 990 Pro SSD'}`;

      setFormData(prev => ({
        ...prev,
        brief: smartExtractedNotes
      }));
    }, 750);
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
    <div 
      onPaste={handlePaste}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-dark-surface border border-white/15 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-card flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img 
              src="./logo.png" 
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
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
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

          {/* Instructions / Client Brief & WhatsApp Screenshots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Client Brief & WhatsApp Instructions
              </label>
              
              <button
                type="button"
                onClick={() => autoExtractFromScreenshot()}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-[11px] font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>✨ Auto-Extract Key Actions</span>
                  </>
                )}
              </button>
            </div>

            {/* Paste & Dropzone Banner */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative p-3 rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/[0.04] hover:bg-brand-500/[0.08] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                    <span>Paste WhatsApp Screenshot</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 rounded text-slate-300">⌘ + V</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Press ⌘+V (Ctrl+V) or click to upload client requirement images
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-brand-300 font-semibold bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                <Upload className="w-3 h-3" />
                <span>Browse Images</span>
              </div>
            </div>

            {/* Attached Screenshots Gallery */}
            {formData.screenshots && formData.screenshots.length > 0 && (
              <div className="p-2.5 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                  <span>Attached WhatsApp Screenshots ({formData.screenshots.length})</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for design reference
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {formData.screenshots.map((ss) => (
                    <div 
                      key={ss.id} 
                      className="group relative rounded-xl overflow-hidden border border-white/10 bg-dark-card aspect-video flex items-center justify-center shadow-sm hover:border-brand-500/50 transition-all"
                    >
                      <img 
                        src={ss.url} 
                        alt={ss.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImageModal(ss);
                          }}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                          title="Zoom High-Res Preview"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeScreenshot(ss.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/40 hover:bg-rose-500 text-white transition-all cursor-pointer"
                          title="Remove Screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              rows={4}
              value={formData.brief}
              onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
              placeholder="Paste WhatsApp requirements, design notes, color codes, or press ⌘+V with a screenshot to auto-fill..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none font-mono"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            {editingTask?.id ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`⚠️ Are you sure you want to remove "${formData.title}"?`)) {
                    deleteTask(editingTask.id);
                    setIsTaskModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Work</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-glow transition-all cursor-pointer"
              >
                {editingTask?.id ? 'Save Changes' : 'Create & Assign Task'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* High-Resolution Screenshot Zoom Modal */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between p-3 bg-dark-card/90 rounded-t-2xl border border-white/10">
              <span className="text-xs font-bold text-white truncate">{previewImageModal.name}</span>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={previewImageModal.url} 
              alt={previewImageModal.name} 
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-b-2xl border border-t-0 border-white/10 bg-black/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
