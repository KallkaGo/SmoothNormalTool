const { contextBridge, ipcRenderer } = require('electron/renderer')
console.log('preload ----')
contextBridge.exposeInMainWorld('Firefly', {
  showToast: (msg) => ipcRenderer.invoke('show-toast', msg),
  jumpLink: (url) => ipcRenderer.invoke('jump-link', url)
})