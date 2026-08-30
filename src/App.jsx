import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import WorkloadView from './components/WorkloadView';
import ClientsView from './components/ClientsView';
import ActivityFeed from './components/ActivityFeed';
import TaskModal from './components/TaskModal';
import ReviewPlayer from './components/ReviewPlayer';
import ServerSettingsModal from './components/ServerSettingsModal';
import AdminLoginModal from './components/AdminLoginModal';
import TeamManagementModal from './components/TeamManagementModal';

function MainContent() {
  const { 
    activeTab, 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    isTeamModalOpen, 
    setIsTeamModalOpen 
  } = useApp();

  return (
    <main className="max-w-[1750px] mx-auto px-3 sm:px-6 py-6 min-h-[calc(100vh-64px)]">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'workload' && <WorkloadView />}
      {activeTab === 'clients' && <ClientsView />}
      {activeTab === 'activity' && <ActivityFeed />}

      {/* Global Modals & Overlays */}
      <TaskModal />
      <ReviewPlayer />
      <ServerSettingsModal />
      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
      <TeamManagementModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />
      <ToastContainer />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0c0e12] text-slate-100 selection:bg-brand-500 selection:text-white">
        <Navbar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
