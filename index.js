const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow () {
    win = new BrowserWindow({ width: 1000, height: 600 });
    win.loadURL('http://localhost:8080');
}

app.on('ready', createWindow);
