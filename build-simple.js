const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend...');
execSync('cd frontend && npm run build', { stdio: 'inherit' });

console.log('Building Electron app...');
try {
  // Try to build without native dependencies
  execSync('npx electron-builder --win --publish=never --config.npmRebuild=false --config.buildDependenciesFromSource=false', { 
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true' }
  });
} catch (error) {
  console.log('Build failed, trying alternative approach...');
  
  // Create a simple package without native dependencies
  const packageJson = require('./package.json');
  const simplePackage = {
    ...packageJson,
    dependencies: Object.fromEntries(
      Object.entries(packageJson.dependencies).filter(([key]) => key !== 'better-sqlite3')
    )
  };
  
  fs.writeFileSync('package-simple.json', JSON.stringify(simplePackage, null, 2));
  
  execSync('npx electron-builder --win --publish=never --config.npmRebuild=false --config.buildDependenciesFromSource=false --config.files="main.js,backend/**/*,frontend/dist/**/*"', { 
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true' }
  });
}

console.log('Build completed!'); 