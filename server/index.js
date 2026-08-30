import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './database.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5050;

// === REST API ENDPOINTS ===

// 1. Users
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  const newUser = db.addUser(req.body);
  io.emit('user:created', newUser);
  res.json(newUser);
});

app.delete('/api/users/:id', (req, res) => {
  const removed = db.removeUser(req.params.id);
  if (removed) {
    io.emit('user:deleted', req.params.id);
    res.json({ success: true, removed });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// 2. Clients
app.get('/api/clients', (req, res) => {
  res.json(db.getClients());
});

app.post('/api/clients', (req, res) => {
  const newClient = db.addClient(req.body);
  io.emit('client:created', newClient);
  res.json(newClient);
});

// 3. Tasks
app.get('/api/tasks', (req, res) => {
  res.json(db.getTasks());
});

app.post('/api/tasks', (req, res) => {
  const newTask = db.createTask(req.body);
  io.emit('task:created', newTask);
  io.emit('activity:new', db.getActivities()[0]);
  res.json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const updatedTask = db.updateTask(req.params.id, req.body);
  if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
  io.emit('task:updated', updatedTask);
  io.emit('activity:new', db.getActivities()[0]);
  res.json(updatedTask);
});

app.delete('/api/tasks/:id', (req, res) => {
  const success = db.deleteTask(req.params.id);
  if (success) {
    io.emit('task:deleted', req.params.id);
    io.emit('activity:new', db.getActivities()[0]);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// 4. Design Versions & Frame.io Reviews
app.post('/api/tasks/:id/versions', (req, res) => {
  const newVersion = db.addVersion(req.params.id, req.body);
  if (!newVersion) return res.status(404).json({ error: 'Task not found' });
  const updatedTask = db.getTaskById(req.params.id);
  io.emit('task:updated', updatedTask);
  io.emit('activity:new', db.getActivities()[0]);
  res.json(newVersion);
});

app.post('/api/tasks/:id/versions/:versionId/comments', (req, res) => {
  const newComment = db.addPinComment(req.params.id, req.params.versionId, req.body);
  if (!newComment) return res.status(404).json({ error: 'Version or task not found' });
  const updatedTask = db.getTaskById(req.params.id);
  io.emit('task:updated', updatedTask);
  io.emit('activity:new', db.getActivities()[0]);
  res.json(newComment);
});

app.patch('/api/tasks/:id/versions/:versionId/comments/:commentId/toggle', (req, res) => {
  const comment = db.toggleCommentStatus(req.params.id, req.params.versionId, req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const updatedTask = db.getTaskById(req.params.id);
  io.emit('task:updated', updatedTask);
  res.json(comment);
});

// 5. Activity Log
app.get('/api/activities', (req, res) => {
  res.json(db.getActivities());
});

// 6. Native Desktop / File Server Bridge (Mac & Windows)
app.post('/api/open-path', (req, res) => {
  let { filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'No filePath provided' });
  }

  const isMac = os.platform() === 'darwin';
  const isWin = os.platform() === 'win32';

  let command = '';
  
  if (isMac) {
    let target = filePath.trim();
    // If it's smb:// or \\, check if /Volumes/ has the mounted folder
    if (target.startsWith('smb://')) {
      const withoutSmb = target.replace(/^smb:\/\/[^\/]+\//, '');
      const candidate = `/Volumes/${withoutSmb}`;
      if (fs.existsSync(candidate)) {
        target = candidate;
      }
    } else if (target.startsWith('\\\\')) {
      const withoutUnc = target.replace(/^\\\\[^\\]+\\/, '');
      const candidate = `/Volumes/${withoutUnc}`;
      if (fs.existsSync(candidate)) {
        target = candidate;
      } else {
        target = target.replace(/\\/g, '/').replace(/^\/\//, 'smb://');
      }
    }
    command = `open "${target}"`;
  } else if (isWin) {
    // If it's smb:// URL on Windows, convert to UNC \\COLORLAB-NAS\...
    if (filePath.startsWith('smb://')) {
      const uncPath = filePath.replace(/^smb:\/\//, '\\\\').replace(/\//g, '\\');
      command = `explorer "${uncPath}"`;
    } else {
      command = `explorer "${filePath}"`;
    }
  } else {
    command = `xdg-open "${filePath}"`;
  }

  console.log(`[OS Bridge] Executing command: ${command}`);
  
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.warn(`[OS Bridge] Notice: ${err.message}`);
      return res.json({ 
        success: false, 
        message: `Attempted to open: "${filePath}". (Ensure NAS is mounted on network)`,
        rawError: err.message 
      });
    }
    res.json({ success: true, message: `Opened: ${filePath}` });
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve built frontend assets
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// === SOCKET.IO REAL-TIME CONNECTION ===
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });

  socket.on('user:action', (data) => {
    io.emit('user:action', data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ══════════════════════════════════════════════════════
  🚀 ColorLab Work Management Server Running!
  👉 Local Access:   http://localhost:${PORT}
  👉 Network Access: http://0.0.0.0:${PORT}
  👉 WebSockets:     Enabled for zero-latency live sync
  ══════════════════════════════════════════════════════
  `);
});
