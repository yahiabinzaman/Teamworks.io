const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');

app.name = 'ColorLab Works';
app.setName('ColorLab Works');

let mainWindow;
let serverStarted = false;

// Native Folder Picker dialog
ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Native File Picker dialog
ipcMain.handle('select-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Design Files', extensions: ['ai', 'psd', 'pdf', 'eps', 'indd', 'jpg', 'png', 'tif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// OS File Launcher handler
ipcMain.handle('open-path', async (event, filePath) => {
  if (!filePath) return { success: false, error: 'No path provided' };
  
  const isWin = os.platform() === 'win32';
  let targetPath = filePath.trim();

  // Smart Mac /Volumes resolver for SMB
  if (!isWin) {
    if (targetPath.startsWith('smb://')) {
      const parts = targetPath.replace(/^smb:\/\/[^\/]+\//, '');
      const candidateVolume = `/Volumes/${parts}`;
      if (fs.existsSync(candidateVolume)) {
        targetPath = candidateVolume;
      }
    } else if (targetPath.startsWith('\\\\')) {
      const parts = targetPath.replace(/^\\\\[^\\]+\\/, '');
      const candidateVolume = `/Volumes/${parts}`;
      if (fs.existsSync(candidateVolume)) {
        targetPath = candidateVolume;
      } else {
        targetPath = targetPath.replace(/\\/g, '/').replace(/^\/\//, 'smb://');
      }
    }
  } else {
    // Windows UNC conversion
    if (targetPath.startsWith('smb://')) {
      targetPath = targetPath.replace(/^smb:\/\//, '\\\\').replace(/\//g, '\\');
    }
  }

  try {
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
      await shell.openExternal(targetPath);
      return { success: true };
    }
    const openErr = await shell.openPath(targetPath);
    if (!openErr) {
      return { success: true };
    }
  } catch (e) {
    console.warn('shell.openPath note:', e.message);
  }

  const command = isWin ? `explorer.exe "${targetPath}"` : `open "${targetPath}"`;
  return new Promise((resolve) => {
    exec(command, (err) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

app.whenReady().then(async () => {
  await ensureServerRunning();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
