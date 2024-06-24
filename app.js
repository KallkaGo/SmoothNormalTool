const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')

const isDev = app.isPackaged !== 'true'
const path = require('path')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const createWindow = () => {
    Menu.setApplicationMenu(null)
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        minimizable:false,
        maximizable:false,
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
        },
    })

    if (isDev) {
        win.loadURL('http://localhost:5173/')
    } else {
        win.loadFile(path.join(__dirname, 'dist', 'index.html'))
    }


}
app.whenReady().then(() => {
    createWindow()
})


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

