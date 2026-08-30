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
  
  // Active Simulated User
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'kanban', 'workload', 'clients', 'activity'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  // Central Server Host IP for Multi-PC Sync
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const [serverHost, setServerHost] = useState(() => {
    return localStorage.getItem('colorlab_server_host') || (isProd ? window.location.host : 'localhost:5050');
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper: Get full API base URL
  const getApiUrl = (endpoint) => {
    // If running in production web app on Render/Cloud without custom override
    if (isProd && !localStorage.getItem('colorlab_server_host')) {
      return endpoint;
    }
    const host = serverHost.includes(':') ? serverHost : `${serverHost}:5050`;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${host}${endpoint}`;
  };

  // Save new server host IP
  const saveServerHost = (newHost) => {
    const cleaned = newHost.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    localStorage.setItem('colorlab_server_host', cleaned);
    setServerHost(cleaned);
    showToast(`🔄 Connected to server: ${cleaned}`, 'success');
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

      setUsers(Array.isArray(uData) ? uData : []);
      setClients(Array.isArray(cData) ? cData : []);
      setTasks(Array.isArray(tData) ? tData : []);
      setActivities(Array.isArray(aData) ? aData : []);

      if (!currentUser && Array.isArray(uData) && uData.length > 0) {
        const savedUserId = localStorage.getItem('colorlab_active_user_id');
        const matched = uData.find(u => u.id === savedUserId);
        setCurrentUser(matched || uData[0]);
      }
    } catch (err) {
      console.warn('Central server connecting/offline:', err.message);
      setIsConnected(false);
    }
  };

  // 2. Real-time Socket.io Connection across LAN & Cloud
  useEffect(() => {
    fetchData();

    let socketUrl = undefined;
    if (!isProd || localStorage.getItem('colorlab_server_host')) {
      const host = serverHost.includes(':') ? serverHost : `${serverHost}:5050`;
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      socketUrl = `${protocol}//${host}`;
    }

    const socket = socketUrl ? io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    }) : io({
      reconnectionAttempts: 10,
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

    socket.on('task:deleted', (deletedId) => {
      setTasks(prev => prev.filter(t => t.id !== deletedId));
      showToast('🗑️ Task removed', 'info');
    });

    socket.on('client:created', (newClient) => {
      setClients(prev => [...prev, newClient]);
      showToast(`🏢 Client added: "${newClient.name}"`, 'success');
    });

    socket.on('activity:new', (activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 49)]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. API Actions
  const createTask = async (taskData) => {
    try {
      const res = await fetch(getApiUrl('/api/tasks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, creator: currentUser?.name || 'Admin' })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      showToast('Failed to create task', 'error');
      console.error(err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedBy: currentUser?.name || 'User' })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      showToast('Failed to update task', 'error');
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(getApiUrl(`/api/tasks/${id}`), { method: 'DELETE' });
    } catch (err) {
      showToast('Failed to delete task', 'error');
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

  const openLocalPath = async (filePath) => {
    try {
      showToast(`📂 Opening: ${filePath}`, 'info');
      // If running inside Electron desktop app
      if (window.electronAPI && window.electronAPI.openPath) {
        window.electronAPI.openPath(filePath);
        return;
      }
      const res = await fetch(getApiUrl('/api/open-path'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      const result = await res.json();
      if (!result.success) {
        showToast(result.message, 'warning');
      }
    } catch (err) {
      showToast('Could not reach OS bridge launcher', 'error');
    }
  };

  const openReviewModal = (taskId) => {
    setReviewTaskId(taskId);
    setIsReviewOpen(true);
  };

  const activeReviewTask = tasks.find(t => t.id === reviewTaskId) || null;

  const selectUser = (user) => {
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
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
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
