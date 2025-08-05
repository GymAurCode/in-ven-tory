const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window is ready and visible');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  const reactAppPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  
  if (fs.existsSync(reactAppPath)) {
    console.log('Loading built React app from:', reactAppPath);
    mainWindow.loadFile(reactAppPath);
  } else {
    console.error('Built app not found at:', reactAppPath);
    app.quit();
  }

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 