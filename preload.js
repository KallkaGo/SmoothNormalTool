const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('Firefly', {
  showToast: (msg) => ipcRenderer.invoke('show-toast', msg),
  jumpLink: (url) => ipcRenderer.invoke('jump-link', url)
})