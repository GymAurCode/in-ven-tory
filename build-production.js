const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`📦 ${description}...`, 'yellow');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Step 1: Clean previous builds
log('🧹 Cleaning previous builds...', 'yellow');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('frontend/dist')) {
  fs.rmSync('frontend/dist', { recursive: true, force: true });
}

// Step 2: Install dependencies
log('📥 Installing dependencies...', 'yellow');
runCommand('npm install', 'Installing root dependencies');
runCommand('cd backend && npm install', 'Installing backend dependencies');
runCommand('cd frontend && npm install', 'Installing frontend dependencies');

// Step 3: Build frontend
log('🏗️ Building frontend...', 'yellow');
runCommand('cd frontend && npm run build', 'Building React application');

// Step 4: Verify frontend build
log('🔍 Verifying frontend build...', 'yellow');
const frontendDistPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
if (!fs.existsSync(frontendDistPath)) {
  log('❌ Frontend build not found!', 'red');
  process.exit(1);
}
log('✅ Frontend build verified', 'green');

// Step 5: Create production environment file
log('⚙️ Setting up production environment...', 'yellow');
const envContent = `NODE_ENV=production
PORT=4000
DB_PATH=userData/database.sqlite
APP_PATH=userData
`;

// Ensure backend directory exists
if (!fs.existsSync('backend')) {
  fs.mkdirSync('backend', { recursive: true });
}

fs.writeFileSync('backend/.env', envContent);
log('✅ Production environment configured', 'green');

// Step 6: Build Electron app
log('🔨 Building Electron application...', 'yellow');
runCommand('npx electron-builder --win --x64 --publish=never', 'Building Windows executable');

// Step 7: Verify build output
log('🔍 Verifying build output...', 'yellow');
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  log('❌ Build output not found!', 'red');
  process.exit(1);
}

const files = fs.readdirSync(distPath);
const exeFile = files.find(file => file.endsWith('.exe'));
if (!exeFile) {
  log('❌ Executable file not found!', 'red');
  process.exit(1);
}

log(`✅ Build completed successfully!`, 'green');
log(`📁 Executable location: ${path.join(distPath, exeFile)}`, 'green');
log(`📦 File size: ${(fs.statSync(path.join(distPath, exeFile)).size / (1024 * 1024)).toFixed(2)} MB`, 'green');

// Step 8: Create distribution info
const distInfo = {
  buildDate: new Date().toISOString(),
  version: require('./package.json').version,
  executable: exeFile,
  size: (fs.statSync(path.join(distPath, exeFile)).size / (1024 * 1024)).toFixed(2),
  platform: 'win32',
  architecture: 'x64'
};

fs.writeFileSync(
  path.join(distPath, 'build-info.json'), 
  JSON.stringify(distInfo, null, 2)
);

log('📋 Build information saved', 'green');
log('🎉 Production build completed successfully!', 'green');
log('💡 The executable is ready for distribution.', 'green'); 