const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'ColorLab Works',
    icon: path.join(__dirname, '../public/logo.png'),
    backgroundColor: '#0c0e12',
    titleBarStyle: os.platform() === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('smb:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// OS File Launcher handler
ipcMain.handle('open-path', async (event, filePath) => {
  const isMac = os.platform() === 'darwin';
  const isWin = os.platform() === 'win32';
  let command = '';

  if (isMac) {
    if (filePath.startsWith('\\\\')) {
      const smbPath = filePath.replace(/\\/g, '/').replace(/^\/\//, 'smb://');
      command = `open "${smbPath}"`;
    } else {
      command = `open "${filePath}"`;
    }
  } else if (isWin) {
    if (filePath.startsWith('smb://')) {
      const uncPath = filePath.replace(/^smb:\/\//, '\\\\').replace(/\//g, '\\');
      command = `explorer "${uncPath}"`;
    } else {
      command = `explorer "${filePath}"`;
    }
  } else {
    command = `xdg-open "${filePath}"`;
  }

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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
