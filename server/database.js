import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialUsers, initialClients, initialTasks, initialActivities } from './sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'colorlab_db.json');

class Database {
  constructor() {
    this.data = {
      users: initialUsers,
      clients: initialClients,
      tasks: initialTasks,
      activities: initialActivities
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database file, falling back to initial data:', e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving database file:', e.message);
    }
  }

  getUsers() {
    return this.data.users;
  }

  getClients() {
    return this.data.clients;
  }

  addClient(client) {
    const newClient = {
      ...client,
      id: 'c_' + Date.now(),
      totalProjects: 0
    };
    this.data.clients.push(newClient);
    this.save();
    return newClient;
  }

  getTasks() {
    return this.data.tasks;
  }

  getTaskById(id) {
    return this.data.tasks.find(t => t.id === id);
  }

  createTask(taskData) {
    const newTask = {
      ...taskData,
      id: 't_' + Date.now(),
      createdAt: new Date().toISOString(),
      versions: taskData.versions || []
    };
    this.data.tasks.unshift(newTask);
    
    // Add activity
    this.addActivity({
      user: taskData.creator || 'Admin',
      text: `Created new task: "${newTask.title}" for ${newTask.assignedTo}`
    });

    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTask = this.data.tasks[index];
    const updatedTask = { ...oldTask, ...updates };
    this.data.tasks[index] = updatedTask;

    if (updates.status && updates.status !== oldTask.status) {
      this.addActivity({
        user: updates.updatedBy || 'User',
        text: `Moved "${updatedTask.title}" status to ${updates.status.toUpperCase()}`
      });
    }

    this.save();
    return updatedTask;
  }

  deleteTask(id) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    const deleted = this.data.tasks.splice(index, 1)[0];
    this.addActivity({
      user: 'Admin',
      text: `Deleted task: "${deleted.title}"`
    });
    this.save();
    return true;
  }

  addVersion(taskId, version) {
    const task = this.getTaskById(taskId);
    if (!task) return null;
    if (!task.versions) task.versions = [];

    const newVersion = {
      ...version,
      id: 'v_' + Date.now(),
      versionNumber: `v0${task.versions.length + 1}`,
      uploadedAt: new Date().toISOString(),
      comments: []
    };
    task.versions.push(newVersion);
    
    this.addActivity({
      user: version.uploadedBy || 'Designer',
      text: `Uploaded new proof ${newVersion.versionNumber} for "${task.title}"`
    });

    this.save();
    return newVersion;
  }

  addPinComment(taskId, versionId, comment) {
    const task = this.getTaskById(taskId);
    if (!task || !task.versions) return null;

    const version = task.versions.find(v => v.id === versionId);
    if (!version) return null;
    if (!version.comments) version.comments = [];

    const newComment = {
      ...comment,
      id: 'c_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    version.comments.push(newComment);

    this.addActivity({
      user: comment.author || 'Reviewer',
      text: `Pinned comment on ${version.versionNumber} of "${task.title}"`
    });

    this.save();
    return newComment;
  }

  toggleCommentStatus(taskId, versionId, commentId) {
    const task = this.getTaskById(taskId);
    if (!task || !task.versions) return null;
    const version = task.versions.find(v => v.id === versionId);
    if (!version || !version.comments) return null;
    const comment = version.comments.find(c => c.id === commentId);
    if (!comment) return null;

    comment.status = comment.status === 'resolved' ? 'open' : 'resolved';
    this.save();
    return comment;
  }

  getActivities() {
    return this.data.activities;
  }

  addActivity({ user, text }) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const activity = {
      id: 'a_' + Date.now(),
      time,
      user,
      text
    };
    this.data.activities.unshift(activity);
    if (this.data.activities.length > 50) this.data.activities.pop();
    this.save();
    return activity;
  }
}

export const db = new Database();
