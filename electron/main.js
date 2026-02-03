import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        width: width,
        height: height,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#050505',
            symbolColor: '#ffffff'
        },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
            preload: path.join(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)), 'preload.js').slice(1) // Fix for Windows + Spaces
        }
    });

    // Load the local Vite server
    win.loadURL('http://localhost:5173');

    // Open DevTools for debugging
    win.webContents.openDevTools();

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Failed to load:', errorCode, errorDescription);
    });

    // Forward Console Logs to Terminal
    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Renderer]: ${message}`);
    });

    // IPC Handlers for Window Controls
    ipcMain.handle('window-min', () => win.minimize());
    ipcMain.handle('window-max', () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });
    ipcMain.handle('window-close', () => win.close());
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
