import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Server, CheckCircle2, AlertCircle, X, Wifi, RefreshCw } from 'lucide-react';

export default function ServerSettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, serverHost, saveServerHost, isConnected } = useApp();
  const [inputHost, setInputHost] = useState(serverHost);
  const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'failed'

  if (!isSettingsOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTestStatus('testing');
    const cleaned = inputHost.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullHost = cleaned.includes(':') ? cleaned : `${cleaned}:5050`;

    try {
      const res = await fetch(`http://${fullHost}/api/users`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setTestStatus('success');
        setTimeout(() => {
          saveServerHost(fullHost);
          setIsSettingsOpen(false);
        }, 500);
      } else {
        setTestStatus('failed');
      }
    } catch (err) {
      setTestStatus('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-dark-surface border border-white/15 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Central Server Connection
              </h2>
              <p className="text-[11px] text-slate-400">Sync all 10-12 ColorLab Workstations</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleTestAndSave} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Connection Status:</span>
              <span className={`font-bold flex items-center gap-1.5 ${
                isConnected ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                {isConnected ? 'Connected & Live Sync Active' : 'Disconnected / Server Offline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every morning, this app connects to the Central Server IP so all tasks, comments, and approvals sync in real-time.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Host PC / Central Server IP Address
            </label>
            <input
              type="text"
              required
              value={inputHost}
              onChange={(e) => {
                setInputHost(e.target.value);
                setTestStatus(null);
              }}
              placeholder="e.g. 192.168.0.9:5050 or localhost:5050"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Enter the IP address of the main server or host computer running ColorLab.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => setInputHost('192.168.0.9:5050')}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-mono"
            >
              192.168.0.9:5050
            </button>
            <button
              type="button"
              onClick={() => setInputHost('localhost:5050')}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-mono"
            >
              localhost:5050
            </button>
          </div>

          {testStatus === 'failed' && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Could not connect to server at "{inputHost}". Ensure the host PC server is ON.</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Connection Successful! Saving and synchronizing...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={testStatus === 'testing'}
              className="px-4 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-glow transition-all flex items-center gap-1.5"
            >
              {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{testStatus === 'testing' ? 'Testing Connection...' : 'Connect & Save'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
