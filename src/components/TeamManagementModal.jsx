import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users2, UserPlus, Trash2, X, Shield, Palette, Film, Check, AlertCircle } from 'lucide-react';

const AVATAR_OPTIONS = ['🎨', '🧑‍💻', '👨‍🎨', '🧑‍🎨', '🎬', '✍️', '⚡', '🌟', '📐', '🖥️'];

export default function TeamManagementModal({ isOpen, onClose }) {
  const { users, addUser, removeUser, showToast } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('designer');
  const [avatar, setAvatar] = useState('🎨');
  const [maxLoad, setMaxLoad] = useState(5);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('⚠️ Please provide member name', 'error');
      return;
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      role: role,
      avatar: avatar,
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@colorlab.local`,
      activeTasks: 0,
      maxLoad: Number(maxLoad) || 5
    };

    addUser(newUser);
    setName('');
    setEmail('');
    setIsAdding(false);
    showToast(`✅ Added ${newUser.name} to ColorLab Team!`, 'success');
  };

  const handleRemove = (userId, userName) => {
    if (confirm(`Are you sure you want to remove ${userName} from ColorLab?`)) {
      removeUser(userId);
      showToast(`🗑️ Removed ${userName}`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-dropdown border border-white/20 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Team Management & Workstations</h2>
              <p className="text-[11px] text-slate-400">Add, edit, or remove studio designers & editors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          
          {/* Add New Member Section Toggle */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Studio Designer / Editor</span>
            </button>
          ) : (
            <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-brand-400" />
                  New Team Member Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Full Name / Tag</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Designer 04 (Farhan)"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-dark-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="designer">🎨 Photoshop/Illustrator Designer</option>
                    <option value="editor">🎬 Motion / Video Editor</option>
                    <option value="typesetter">✍️ Typesetter / InDesign</option>
                  </select>
                </div>
              </div>

              {/* Avatar Emoji Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Choose Avatar Icon</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`text-lg p-1.5 rounded-xl border transition-all ${
                        avatar === emoji 
                          ? 'bg-brand-500/30 border-brand-400 scale-110' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Max Task Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={maxLoad}
                    onChange={(e) => setMaxLoad(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Workstation Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farhan@colorlab.local"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-glow transition-all cursor-pointer"
              >
                ✓ Save & Register Designer
              </button>
            </form>
          )}

          {/* Current Team Members List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Studio Roster ({users.length})
            </h3>
            
            <div className="space-y-2">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-xl bg-white/5 border border-white/10">{user.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        {user.role === 'admin' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{user.email} • Capacity: {user.maxLoad} tasks</p>
                    </div>
                  </div>

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleRemove(user.id, user.name)}
                      title={`Remove ${user.name}`}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
