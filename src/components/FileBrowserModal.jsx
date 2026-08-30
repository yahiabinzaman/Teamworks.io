import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, ArrowLeft, ArrowUp, HardDrive, 
  FolderSync, X, Check, Search, FileCode, Image, 
  RefreshCw, ChevronRight, Home, CornerDownRight, CheckCircle2
} from 'lucide-react';

export default function FileBrowserModal({ isOpen, onClose, onSelect, initialPath = '', mode = 'both' }) {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [parentPath, setParentPath] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch filesystem contents
  const fetchPath = async (targetPath = '') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:5050/api/browse-fs?path=${encodeURIComponent(targetPath)}`);
      const data = await res.json();
      
      if (res.ok) {
        setCurrentPath(data.currentPath || '');
        setParentPath(data.parentPath || '');
        setItems(data.items || []);
        setSelectedItem(null);
      } else {
        setErrorMsg(data.error || 'Failed to open directory');
      }
    } catch (err) {
      setErrorMsg('Could not connect to backend filesystem bridge.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPath(initialPath || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter items by search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item) => {
    if (item.isDirectory) {
      fetchPath(item.path);
    } else {
      setSelectedItem(item);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.path, selectedItem);
    } else if (currentPath) {
      onSelect(currentPath, { isDirectory: true, path: currentPath });
    }
    onClose();
  };

  const getFileIcon = (item) => {
    if (item.isVolume) return <HardDrive className="w-5 h-5 text-cyan-400" />;
    if (item.isDirectory) return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    
    const ext = item.extension;
    if (ext === '.ai' || ext === '.eps') return <FileCode className="w-5 h-5 text-orange-400" />;
    if (ext === '.psd' || ext === '.tif' || ext === '.tiff') return <FileCode className="w-5 h-5 text-blue-400" />;
    if (ext === '.indd') return <FileCode className="w-5 h-5 text-pink-400" />;
    if (ext === '.pdf') return <FileText className="w-5 h-5 text-rose-400" />;
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return <Image className="w-5 h-5 text-emerald-400" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-dark-card border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* TOP BAR: Header & Breadcrumb Path */}
        <div className="p-4 border-b border-white/10 bg-dark-surface/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
                <FolderSync className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Server & Drive File Explorer</h2>
                <p className="text-[11px] text-slate-400">Browse and select local, SSD, or NAS project directories</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => fetchPath('')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-medium transition-all flex-shrink-0 cursor-pointer"
            >
              <Home className="w-3 h-3 text-cyan-400" />
              <span>All Volumes</span>
            </button>
            <button
              type="button"
              onClick={() => fetchPath('/Volumes/COLOR LAB - NAS')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold transition-all flex-shrink-0 cursor-pointer"
            >
              <HardDrive className="w-3 h-3" />
              <span>COLOR LAB - NAS</span>
            </button>
            <button
              type="button"
              onClick={() => fetchPath('/Volumes/990 Pro 2TB SSD')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-medium transition-all flex-shrink-0 cursor-pointer"
            >
              <HardDrive className="w-3 h-3" />
              <span>990 Pro SSD</span>
            </button>
            <button
              type="button"
              onClick={() => fetchPath('/Volumes/Diary 2027')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-[11px] font-medium transition-all flex-shrink-0 cursor-pointer"
            >
              <Folder className="w-3 h-3" />
              <span>Diary 2027</span>
            </button>
          </div>

          {/* Navigation Controls & Search */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!parentPath}
              onClick={() => fetchPath(parentPath)}
              title="Go Up One Folder Level"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* Current Path Bar */}
            <div className="flex-1 flex items-center bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono truncate">
              <span className="text-slate-500 mr-1.5 flex-shrink-0">Path:</span>
              <span className="truncate">{currentPath || 'Drives & Volumes Overview'}</span>
            </div>

            {/* Search filter */}
            <div className="relative w-48 hidden sm:block flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* MAIN BODY: Grid / List of Items */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[320px] max-h-[50vh]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
              <span className="text-xs">Reading drive contents...</span>
            </div>
          ) : errorMsg ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6">
              <p className="text-sm font-semibold text-rose-400">{errorMsg}</p>
              <p className="text-xs text-slate-400">Please make sure the NAS drive is mounted on your network.</p>
              <button
                onClick={() => fetchPath('')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium"
              >
                Back to Drives
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Folder className="w-8 h-8 opacity-40 mb-2" />
              <span>This folder is empty.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.path === item.path;

                return (
                  <div
                    key={item.path}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? 'bg-brand-500/25 border-brand-500 shadow-glow text-white'
                        : item.isDirectory
                        ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-200'
                        : 'bg-white/[0.01] hover:bg-white/[0.05] border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getFileIcon(item)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate group-hover:text-white leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {item.isVolume ? 'Mounted Volume' : item.isDirectory ? 'Folder' : item.extension ? `${item.extension.toUpperCase()} File` : 'File'}
                      </p>
                    </div>
                    {item.isDirectory && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 border-t border-white/10 bg-dark-surface flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block">Selected:</span>
            <p className="text-xs font-mono font-bold text-cyan-300 truncate">
              {selectedItem ? selectedItem.path : currentPath || 'No folder selected'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!currentPath && !selectedItem}
              onClick={handleConfirmSelect}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-glow disabled:opacity-50 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedItem && !selectedItem.isDirectory ? 'Choose This File' : 'Select This Folder'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
