import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sliders, 
  Upload, 
  FolderOpen, 
  FileCode, 
  Check, 
  RotateCcw, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  ChevronRight,
  Send,
  Eye
} from 'lucide-react';

export default function ReviewPlayer() {
  const { 
    isReviewOpen, 
    setIsReviewOpen, 
    activeReviewTask, 
    addPinComment, 
    toggleComment, 
    addVersion, 
    updateTask, 
    openLocalPath,
    showToast,
    theme
  } = useApp();

  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareVersionIndex, setCompareVersionIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [activePinDraft, setActivePinDraft] = useState(null); // { xPercent, yPercent }
  const [commentInput, setCommentInput] = useState('');
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isReviewOpen || !activeReviewTask) return null;

  const versions = activeReviewTask.versions || [];
  const currentVersion = versions[selectedVersionIndex] || versions[versions.length - 1] || null;
  const compareVersion = versions[compareVersionIndex] || versions[0] || null;

  // Handle clicking on image canvas to drop a pin
  const handleImageClick = (e) => {
    if (isCompareMode || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.max(2, Math.min(98, Math.round((x / rect.width) * 100)));
    const yPercent = Math.max(2, Math.min(98, Math.round((y / rect.height) * 100)));

    setActivePinDraft({ xPercent, yPercent });
  };

  const handleSavePinComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePinDraft || !currentVersion) return;

    await addPinComment(activeReviewTask.id, currentVersion.id, {
      text: commentInput.trim(),
      xPercent: activePinDraft.xPercent,
      yPercent: activePinDraft.yPercent
    });

    setCommentInput('');
    setActivePinDraft(null);
  };

  const handleApprove = () => {
    updateTask(activeReviewTask.id, { status: 'approved' });
    showToast('✨ Proof Approved! Task moved to Approved stage.', 'success');
  };

  const handleRequestRevision = () => {
    updateTask(activeReviewTask.id, { status: 'revision' });
    showToast('🔄 Revisions requested! Task moved to Revision.', 'info');
  };

  // Upload proof file (reads as base64 data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await addVersion(activeReviewTask.id, {
        previewUrl: reader.result
      });
      setIsUploading(false);
      setSelectedVersionIndex(versions.length); // switch to newly added version
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full h-full max-w-[1700px] flex flex-col rounded-3xl bg-dark-surface border border-white/15 overflow-hidden shadow-2xl">
        
        {/* TOP BAR: Task Title + Versions + Actions + Close */}
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between gap-4 bg-dark-card/90">
          
          {/* Left: Task Info & Working File */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="ColorLab" 
              className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-glow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-tight">{activeReviewTask.title}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {activeReviewTask.client}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Assigned to <span className="text-white font-medium">{activeReviewTask.assignedTo}</span> • {activeReviewTask.dimensions}
              </p>
            </div>
          </div>

          {/* Center: Version Selector & Compare Mode */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              Proof Versions:
            </span>

            {versions.map((ver, idx) => (
              <button
                key={ver.id}
                onClick={() => {
                  setSelectedVersionIndex(idx);
                  setIsCompareMode(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedVersionIndex === idx && !isCompareMode
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {ver.versionNumber}
              </button>
            ))}

            {/* Compare Split Mode button (if >= 2 versions) */}
            {versions.length >= 2 && (
              <button
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isCompareMode
                    ? 'bg-purple-600 text-white shadow-glow'
                    : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Split Compare</span>
              </button>
            )}

            {/* Upload New Proof */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUploading ? 'Uploading...' : '+ Upload Proof'}</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Right: Quick actions + Close */}
          <div className="flex items-center gap-2">
            
            <button
              onClick={() => openLocalPath(activeReviewTask.workingFile || activeReviewTask.serverFolder)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Photoshop / AI</span>
            </button>

            <button
              onClick={handleRequestRevision}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-glow transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Design</span>
            </button>

            <button
              onClick={() => setIsReviewOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* MAIN BODY: Interactive Canvas (Left 70%) + Comments & Annotations Sidebar (Right 30%) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Visual Canvas Area */}
          <div className={`flex-1 relative ${theme === 'light' ? 'bg-[#e2e8f0]' : 'bg-[#080a0e]'} flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden select-none transition-colors duration-200`}>
            
            {/* Canvas Toolbar Instructions */}
            <div className="absolute top-4 left-6 z-20 flex items-center gap-2 glass-dropdown px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-slate-200 shadow-lg">
              <MessageSquarePlus className="w-4 h-4 text-brand-400" />
              <span>Click anywhere on the artwork to drop a <b>Pin Comment</b></span>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-1 glass-dropdown p-1 rounded-xl border border-white/10 shadow-lg">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-300 px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                Reset
              </button>
            </div>

            {/* ARTWORK CANVAS */}
            {currentVersion ? (
              <div 
                className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {!isCompareMode ? (
                  /* SINGLE VERSION VIEW WITH PIN ANNOTATIONS */
                  <div className="relative inline-block shadow-2xl rounded-xl overflow-hidden border border-white/15">
                    <img
                      ref={imageRef}
                      src={currentVersion.previewUrl}
                      alt="Design Proof"
                      onClick={handleImageClick}
                      className="max-h-[72vh] max-w-[65vw] object-contain cursor-crosshair block"
                    />

                    {/* Render existing pins */}
                    {currentVersion.comments?.map((comment, index) => {
                      const isHovered = hoveredCommentId === comment.id;
                      const isResolved = comment.status === 'resolved';

                      return (
                        <div
                          key={comment.id}
                          style={{ left: `${comment.xPercent}%`, top: `${comment.yPercent}%` }}
                          className={`absolute pin-point z-10 cursor-pointer ${isHovered ? 'scale-125 z-30' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredCommentId(comment.id);
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg border-2 border-white transition-all ${
                            isResolved 
                              ? 'bg-emerald-500' 
                              : 'bg-rose-500 animate-bounce'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}

                    {/* Render active pin draft being placed */}
                    {activePinDraft && (
                      <div
                        style={{ left: `${activePinDraft.xPercent}%`, top: `${activePinDraft.yPercent}%` }}
                        className="absolute pin-point z-30"
                      >
                        <div className="w-7 h-7 rounded-full bg-brand-500 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-glow animate-pulse">
                          📌
                        </div>

                        {/* Pin Input Box */}
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-8 top-0 w-72 glass-dropdown rounded-2xl p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-brand-300">Add Pin Comment #{ (currentVersion.comments?.length || 0) + 1 }</span>
                            <button
                              onClick={() => setActivePinDraft(null)}
                              className="text-slate-400 hover:text-white p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <form onSubmit={handleSavePinComment} className="space-y-2">
                            <textarea
                              autoFocus
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder="e.g. Logo needs 20px padding from top..."
                              rows={3}
                              className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActivePinDraft(null)}
                                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                              >
                                <Send className="w-3 h-3" />
                                <span>Save Pin</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SPLIT COMPARISON SLIDER MODE */
                  <div className="relative inline-block shadow-2xl rounded-xl overflow-hidden border border-white/20 select-none">
                    {/* Before Image (v01) */}
                    <img
                      src={compareVersion.previewUrl}
                      alt="Before version"
                      className="max-h-[72vh] max-w-[65vw] object-contain block"
                    />

                    {/* After Image (v02) clipped with slider */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={currentVersion.previewUrl}
                        alt="After version"
                        className="max-h-[72vh] max-w-[65vw] object-contain block"
                      />
                    </div>

                    {/* Interactive Divider Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-2xl"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-500 text-white border-2 border-white shadow-glow flex items-center justify-center text-xs font-bold">
                        ↔
                      </div>
                    </div>

                    {/* Split Mode Sliders Range */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
                    />

                    {/* Badges */}
                    <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-bold text-slate-300 border border-white/10">
                      Before: {compareVersion.versionNumber}
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-lg bg-brand-600/90 text-[11px] font-bold text-white border border-white/10">
                      After: {currentVersion.versionNumber}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-400">No artwork proof uploaded yet for this task.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow"
                >
                  Upload First Proof (JPG/PNG)
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Pin Comments Thread & Resolution Tracker */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-dark-card flex flex-col">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Feedback & Pin Annotations
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentVersion?.comments?.filter(c => c.status === 'open').length || 0} Open Items on {currentVersion?.versionNumber || 'v01'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                {currentVersion?.comments?.length || 0} Pins
              </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentVersion?.comments && currentVersion.comments.length > 0 ? (
                currentVersion.comments.map((comment, idx) => {
                  const isResolved = comment.status === 'resolved';

                  return (
                    <div
                      key={comment.id}
                      onMouseEnter={() => setHoveredCommentId(comment.id)}
                      onMouseLeave={() => setHoveredCommentId(null)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isResolved
                          ? 'bg-white/[0.02] border-white/5 opacity-60'
                          : 'bg-dark-surface/80 border-white/10 hover:border-brand-500/40'
                      }`}
                    >
                      {/* Author + Pin Number + Status Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                            isResolved ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{comment.author}</span>
                          <span className="text-[10px] text-slate-400">{comment.role}</span>
                        </div>

                        {/* Toggle Resolved */}
                        <button
                          onClick={() => toggleComment(activeReviewTask.id, currentVersion.id, comment.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isResolved ? 'Resolved' : 'Mark Done'}</span>
                        </button>
                      </div>

                      {/* Comment Content */}
                      <p className={`text-xs leading-relaxed ${isResolved ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {comment.text}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 mt-2 border-t border-white/5">
                        <span>Pin location: {comment.xPercent}%, {comment.yPercent}%</span>
                        <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <span className="text-3xl">🎯</span>
                  <p className="text-xs font-medium text-slate-400">No pin annotations yet</p>
                  <p className="text-[11px] text-slate-500">Click anywhere on the design proof to leave exact visual instructions for the designer.</p>
                </div>
              )}
            </div>

            {/* Sidebar Footer: Brief & Server Path */}
            <div className="p-4 border-t border-white/10 bg-dark-surface/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Project Brief</span>
                <button
                  onClick={() => openLocalPath(activeReviewTask.serverFolder)}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FolderOpen className="w-3 h-3" /> Open Folder
                </button>
              </div>
              <p className="text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                {activeReviewTask.brief || 'No brief provided.'}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
