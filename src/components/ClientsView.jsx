import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Phone, 
  MessageCircle, 
  Mail, 
  FolderOpen, 
  Plus, 
  ArrowUpRight,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function ClientsView() {
  const { clients, tasks, openLocalPath, showToast } = useApp();
  const [activeClientTab, setActiveClientTab] = useState('2027'); // '2027' or 'all'

  const openWhatsApp = (phone, clientName) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${clientName}, greetings from ColorLab! Regarding your Diary 2027 design project...`);
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
    showToast(`📱 Opening WhatsApp chat for ${clientName}`, 'info');
  };

  const displayedClients = activeClientTab === '2027' 
    ? clients.filter(c => c.isCurrentYear)
    : clients;

  const currentYearCount = clients.filter(c => c.isCurrentYear).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Clients & NAS File Directory</h1>
          <p className="text-xs text-slate-400">Direct links to COLORLAB-NAS / Diary 2027 folders & WhatsApp contacts</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.05] border border-white/10">
          <button
            onClick={() => setActiveClientTab('2027')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeClientTab === '2027'
                ? 'bg-amber-500 text-slate-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ Diary 2027 Active ({currentYearCount})
          </button>
          <button
            onClick={() => setActiveClientTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeClientTab === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Clients Database ({clients.length})
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedClients.map((client) => {
          const clientTasks = tasks.filter(t => t.client === client.name || t.clientId === client.id);
          const activeCount = clientTasks.filter(t => t.status !== 'approved' && t.status !== 'delivered').length;

          return (
            <div 
              key={client.id}
              className="p-5 rounded-3xl glass-panel border border-white/10 hover:border-brand-500/30 transition-all space-y-4 shadow-apple"
            >
              {/* Client Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-glow">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{client.name}</h3>
                    <p className="text-[11px] text-brand-400 font-medium">{client.companyTag || 'Corporate Client'}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {clientTasks.length} Projects
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-black/20 p-3 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400">Contact Person</p>
                  <p className="font-semibold text-white truncate">{client.contactPerson}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Phone</p>
                  <p className="font-mono text-[11px] text-slate-200">{client.phone}</p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Launcher + Server Folder */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openWhatsApp(client.whatsapp || client.phone, client.name)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Open WhatsApp</span>
                </button>

                <button
                  onClick={() => openLocalPath(client.folderPath)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-all"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>Server Folder</span>
                </button>
              </div>

              {/* Active Client Tasks preview */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recent Tasks</p>
                {clientTasks.slice(0, 2).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02]">
                    <span className="truncate text-slate-200 font-medium max-w-[200px]">{t.title}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{t.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
