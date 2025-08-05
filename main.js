const { app, BrowserWindow, protocol, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const isDev = !app.isPackaged;

/**
 * Resolve a file path that works in both development and in the packaged
 * application (inside the `resources` directory).
 */
function resolvePath(...segments) {
  // For files that are unpacked (e.g. backend script) we deliberately look in
  // resourcesPath when packaged so that Node can execute them. In dev we stay in
  // the workspace.
  return isDev
    ? path.join(__dirname, ...segments)
    : path.join(process.resourcesPath, ...segments);
}

/**
 * For assets that remain inside the asar (HTML, icons, etc.) we first try the
 * path relative to __dirname (works for dev *and* inside the asar). If that
 * does not exist we fall back to resourcesPath (e.g. if you later decide to
 * unpack icons).
 */
function getAssetPath(...segments) {
  const possiblePath = path.join(__dirname, ...segments);
  if (fs.existsSync(possiblePath)) {
    return possiblePath;
  }
  return path.join(process.resourcesPath, ...segments);
}

// Keep a global reference of the window object
let mainWindow;
let backendProcess;

function startBackend() {
  console.log('Starting backend server...');
  
  // Start the backend server
  const backendScript = resolvePath('backend', 'server.js');
  
  // Set production environment variables
  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: '4000'
  };
  
  // In production, set the database path to user data directory
  if (!isDev) {
    const userDataPath = app.getPath('userData');
    env.DB_PATH = path.join(userDataPath, 'database.sqlite');
    env.APP_PATH = userDataPath;
    console.log('Production database path:', env.DB_PATH);
  }
  
  backendProcess = spawn('node', [backendScript], {
    cwd: path.dirname(backendScript),
    stdio: 'pipe',
    env: env
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('Backend:', data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error('Backend Error:', data.toString());
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  return new Promise((resolve) => {
    // Wait for backend to be ready
    const checkBackend = () => {
      const http = require('http');
      const req = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/me',
        method: 'GET',
        timeout: 1000
      }, (res) => {
        if (res.statusCode === 401 || res.statusCode === 200) {
          console.log('Backend is ready!');
          resolve();
        } else {
          setTimeout(checkBackend, 500);
        }
      });
      
      req.on('error', () => {
        setTimeout(checkBackend, 500);
      });
      
      req.on('timeout', () => {
        req.destroy();
        setTimeout(checkBackend, 500);
      });
      
      req.end();
    };
    
    setTimeout(checkBackend, 1000);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow loading local files
      allowRunningInsecureContent: true
    },
    icon: getAssetPath('public', 'icon.png'),
    title: 'Eyercall Inventory App',
    show: false // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Load the React app
  const reactAppPath = getAssetPath('frontend', 'dist', 'index.html');
  
  if (fs.existsSync(reactAppPath)) {
    console.log('Loading built React app from:', reactAppPath);
    
    // Use loadFile with the correct path
    mainWindow.loadFile(reactAppPath);
    
    console.log('Loading built React app successfully');
  } else {
    // Load development server
    console.log('Built app not found, loading dev server');
    mainWindow.loadURL('http://localhost:5173');
  }

  // Open DevTools automatically in dev mode, or when DEBUG_PROD is set
  if (isDev || process.env.DEBUG_PROD === 'true') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Register custom protocol for serving static files
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/frontend/dist/${url}`) });
  });

  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to start backend:', error);
    createWindow(); // Still create window even if backend fails
  }

  // Allow toggling DevTools in production with F12
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up backend process when app quits
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
}); 