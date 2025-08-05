const path = require('path');
const fs = require('fs');

console.log('🔧 Database Fix Script');
console.log('=====================');

// Function to safely remove file
function safeRemoveFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error removing ${filePath}: ${error.message}`);
    return false;
  }
}

// Function to create directory
function ensureDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    } else {
      console.log(`✅ Directory exists: ${dirPath}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Error creating directory ${dirPath}: ${error.message}`);
    return false;
  }
}

console.log('\n🧹 Cleaning up corrupted database files...');

// List of potentially corrupted files to remove
const filesToRemove = [
  path.join(__dirname, 'backend', 'db', 'database.json'),
  path.join(__dirname, 'backend', 'db', 'users.json'),
  path.join(__dirname, 'backend', 'db', 'database.sqlite')
];

filesToRemove.forEach(file => {
  safeRemoveFile(file);
});

console.log('\n📁 Ensuring database directories exist...');

// Create necessary directories
const directories = [
  path.join(__dirname, 'backend', 'db'),
  path.join(__dirname, 'backend', 'config'),
  path.join(__dirname, 'backend', 'controllers'),
  path.join(__dirname, 'backend', 'middleware'),
  path.join(__dirname, 'backend', 'routes')
];

directories.forEach(dir => {
  ensureDirectory(dir);
});

console.log('\n🔄 Testing database initialization...');

// Test SQLite database initialization
try {
  const dbInitializer = require('./backend/config/initDb');
  console.log('✅ Database initializer loaded');
  
  // Initialize database
  dbInitializer.initializeDatabase();
  console.log('✅ SQLite database initialized successfully');
  
} catch (error) {
  console.log('❌ SQLite database error:', error.message);
}

// Test JSON database initialization
try {
  const jsonDb = require('./backend/db/init');
  console.log('✅ JSON database module loaded');
  
  // Initialize JSON database
  const jsonPath = path.join(__dirname, 'backend', 'db', 'users.json');
  jsonDb.initializeDatabase(jsonPath);
  console.log('✅ JSON database initialized successfully');
  
} catch (error) {
  console.log('❌ JSON database error:', error.message);
}

console.log('\n🎉 Database fix completed!');
console.log('You can now try starting the application again.');
console.log('Run: npm run dev'); 