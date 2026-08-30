import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, KeyRound, X, Check, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose }) {
  const { loginAdmin, showToast, users, setCurrentUser } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      setError(false);
      setPin('');
      const adminUser = users.find(u => u.role === 'admin') || users[0];
      setCurrentUser(adminUser);
      onClose();
    } else {
      setError(true);
      showToast('❌ Incorrect Admin PIN. Try default: 1234', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl glass-dropdown border border-white/20 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Admin Authentication</h2>
              <p className="text-[11px] text-slate-400">ColorLab Studio Management Lock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Enter Admin Security PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                autoFocus
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter PIN (Default: 1234)"
                className={`w-full bg-white/[0.05] border rounded-2xl pl-10 pr-4 py-2.5 text-center text-lg tracking-[0.4em] font-mono text-white placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-xs focus:outline-none transition-all ${
                  error 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-500/10' 
                    : 'border-white/15 focus:border-brand-500 focus:bg-white/[0.08]'
                }`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> Incorrect PIN. Please enter 1234
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">🛡️ Admin Superpowers:</p>
            <p>• Add & Remove Team Designers</p>
            <p>• Delete Any Works / Completed Tasks</p>
            <p>• Edit Global Server & Client Database</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-glow flex items-center justify-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
