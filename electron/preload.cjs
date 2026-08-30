const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  isDesktopApp: true
});
