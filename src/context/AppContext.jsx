import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initialUsers, initialClients, initialTasks, initialActivities } from '../data/sampleData.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [clients, setClients] = useState(initialClients);
  const [tasks, setTasks] = useState(initialTasks);
  const [activities, setActivities] = useState(initialActivities);
  const [toasts, setToasts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Theme Engine (Dark vs Light)
  const [theme, setTheme] = useState(() => localStorage.getItem('colorlab_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('colorlab_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active User / Workstation
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'kanban', 'workload', 'clients', 'activity'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Designer Personal Workspace vs Studio Overview Toggle
  const [dashboardMode, setDashboardMode] = useState('my_tasks'); // 'my_tasks' | 'studio'

  // Admin Authentication & Modals
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('colorlab_admin_auth') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const loginAdmin = (pin) => {
    if (pin === '1234' || pin === 'admin') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('colorlab_admin_auth', 'true');
      showToast('🔓 Admin mode activated! Full studio control unlocked.', 'success');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('colorlab_admin_auth');
    const firstDesigner = users.find(u => u.role !== 'admin') || users[0];
    setCurrentUser(firstDesigner);
    showToast('🔒 Logged out of Admin mode', 'info');
  };

  // Task & Review Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState(null);

  // Central 24/7 Cloud & LAN Sync Engine
  const isDesktop = typeof window !== 'undefined' && (window.electronAPI?.isDesktopApp || window.location.protocol === 'file:');
  const DEFAULT_CLOUD_HOST = 'teamworks-io.onrender.com';

  const [serverHost, setServerHost] = useState(() => {
    const saved = localStorage.getItem('colorlab_server_host');
    if (saved) return saved;
    if (isDesktop) return DEFAULT_CLOUD_HOST;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'localhost:5050';
    return window.location.host || DEFAULT_CLOUD_HOST;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper: Get full API base URL
  const getApiUrl = (endpoint) => {
    if (!isDesktop && window.location.hostname.includes('onrender.com') && !localStorage.getItem('colorlab_server_host')) {
      return endpoint;
    }
    const host = serverHost.includes(':') ? serverHost : (serverHost.includes('onrender.com') ? serverHost : `${serverHost}:5050`);
    const protocol = (host.includes('onrender.com') || window.location.protocol === 'https:') ? 'https:' : 'http:';
    return `${protocol}//${host}${endpoint}`;
  };

  // Save new server host IP
  const saveServerHost = (newHost) => {
    const cleaned = newHost.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    localStorage.setItem('colorlab_server_host', cleaned);
    setServerHost(cleaned);
    showToast(`🔄 Connected to: ${cleaned}`, 'success');
    window.location.reload();
  };

  // Helper: Show notification toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // 1. Initial Data Fetch
  const fetchData = async () => {
    try {
      const [uRes, cRes, tRes, aRes] = await Promise.all([
        fetch(getApiUrl('/api/users')),
        fetch(getApiUrl('/api/clients')),
        fetch(getApiUrl('/api/tasks')),
        fetch(getApiUrl('/api/activities'))
      ]);

      const [uData, cData, tData, aData] = await Promise.all([
        uRes.json(),
        cRes.json(),
        tRes.json(),
        aRes.json()
      ]);

      if (Array.isArray(uData) && uData.length > 0) setUsers(uData);
      if (Array.isArray(cData) && cData.length > 0) setClients(cData);
      if (Array.isArray(tData) && tData.length > 0) setTasks(tData);
      if (Array.isArray(aData) && aData.length > 0) setActivities(aData);
      setIsConnected(true);

      if (!currentUser && Array.isArray(uData) && uData.length > 0) {
        const savedUserId = localStorage.getItem('colorlab_active_user_id');
        const matched = uData.find(u => u.id === savedUserId);
        setCurrentUser(matched || uData[0]);
      }
    } catch (err) {
      console.warn('Central server sync note:', err.message);
    }
  };

  // 2. Real-time Socket.io Connection across LAN & Cloud
  useEffect(() => {
    fetchData();

    let socketUrl;
    if (serverHost.includes('onrender.com')) {
      socketUrl = `https://${serverHost}`;
    } else {
      const host = serverHost.includes(':') ? serverHost : `${serverHost}:5050`;
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      socketUrl = `${protocol}//${host}`;
    }

    const socket = io(socketUrl, {
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to ColorLab Live Server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('task:created', (newTask) => {
      setTasks(prev => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      showToast(`✨ New Task created: "${newTask.title}"`, 'success');
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });

    socket.on('task:deleted', (taskId) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });

    socket.on('user:created', (newUser) => {
      setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    socket.on('user:deleted', (userId) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    socket.on('client:created', (newClient) => {
      setClients(prev => [newClient, ...prev]);
    });

    socket.on('activity:new', (newAct) => {
      if (newAct) {
        setActivities(prev => [newAct, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [serverHost]);

  // 3. User & Team Management Actions
  const addUser = async (newUser) => {
    setUsers(prev => [...prev, newUser]);
    try {
      await fetch(getApiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {
      console.warn('addUser note:', err.message);
    }
  };

  const removeUser = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await fetch(getApiUrl(`/api/users/${userId}`), { method: 'DELETE' });
    } catch (err) {
      console.warn('removeUser note:', err.message);
    }
  };

  // 4. Task Management Actions
  const createTask = async (taskData) => {
    try {
      const res = await fetch(getApiUrl('/api/tasks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      showToast(`✅ Created "${newTask.title}"`, 'success');
      return newTask;
    } catch (err) {
      // Local optimistic fallback
      const localTask = {
        ...taskData,
        id: 't_' + Date.now(),
        createdAt: new Date().toISOString(),
        versions: []
      };
      setTasks(prev => [localTask, ...prev]);
      showToast(`Created task locally`, 'info');
      return localTask;
    }
  };

  const updateTask = async (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      console.warn('Task updated locally');
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('🗑️ Work removed from studio', 'info');
    try {
      await fetch(getApiUrl(`/api/tasks/${taskId}`), {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Task removed locally');
    }
  };

  const addVersion = async (taskId, versionData) => {
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}/versions`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...versionData, uploadedBy: currentUser?.name || 'Designer' })
      });
      const data = await res.json();
      showToast(`🚀 Uploaded proof ${data.versionNumber}`, 'success');
      return data;
    } catch (err) {
      showToast('Failed to upload proof', 'error');
    }
  };

  const addPinComment = async (taskId, versionId, commentData) => {
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}/versions/${versionId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commentData,
          author: currentUser?.name || 'Admin',
          role: currentUser?.role || 'Admin',
          avatar: currentUser?.avatar || '👨‍💼'
        })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      showToast('Failed to add pin comment', 'error');
    }
  };

  const toggleComment = async (taskId, versionId, commentId) => {
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}/versions/${versionId}/comments/${commentId}/toggle`), {
        method: 'PATCH'
      });
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Universal OS File & Network NAS Launcher
  const openLocalPath = async (filePath) => {
    if (!filePath) return;
    try {
      // Determine if on Windows or Mac
      const isWin = typeof navigator !== 'undefined' && navigator.platform?.toLowerCase().includes('win');
      let displayPath = filePath;
      if (isWin && filePath.startsWith('smb://')) {
        displayPath = filePath.replace(/^smb:\/\//, '\\\\').replace(/\//g, '\\');
      }

      showToast(`📂 Opening: ${displayPath}`, 'info');

      // If running inside native Electron desktop app
      if (window.electronAPI && window.electronAPI.openPath) {
        window.electronAPI.openPath(filePath);
        return;
      }

      // If running in browser, call local Express server OS Bridge
      const res = await fetch(getApiUrl('/api/open-path'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      const result = await res.json();
      if (!result.success) {
        // Provide copy to clipboard fallback for Windows network explorer
        if (navigator.clipboard) {
          navigator.clipboard.writeText(displayPath);
          showToast(`📋 Copied Network Path to Clipboard: ${displayPath}`, 'info');
        }
      }
    } catch (err) {
      // Direct copy fallback
      if (navigator.clipboard) {
        navigator.clipboard.writeText(filePath);
        showToast(`📋 Copied Path: ${filePath}`, 'info');
      }
    }
  };

  const openReviewModal = (taskId) => {
    setReviewTaskId(taskId);
    setIsReviewOpen(true);
  };

  const activeReviewTask = tasks.find(t => t.id === reviewTaskId) || null;

  const selectUser = (user) => {
    if (user?.role === 'admin' && !isAdminAuthenticated) {
      setIsAdminModalOpen(true);
      return;
    }
    setCurrentUser(user);
    if (user) localStorage.setItem('colorlab_active_user_id', user.id);
  };

  return (
    <AppContext.Provider value={{
      users,
      clients,
      tasks,
      activities,
      currentUser,
      setCurrentUser: selectUser,
      addUser,
      removeUser,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      dashboardMode,
      setDashboardMode,
      theme,
      toggleTheme,
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,
      isAdminModalOpen,
      setIsAdminModalOpen,
      isTeamModalOpen,
      setIsTeamModalOpen,
      isTaskModalOpen,
      setIsTaskModalOpen,
      editingTask,
      setEditingTask,
      isReviewOpen,
      setIsReviewOpen,
      reviewTaskId,
      activeReviewTask,
      openReviewModal,
      createTask,
      updateTask,
      deleteTask,
      addVersion,
      addPinComment,
      toggleComment,
      openLocalPath,
      showToast,
      toasts,
      isConnected,
      serverHost,
      saveServerHost,
      isSettingsOpen,
      setIsSettingsOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
