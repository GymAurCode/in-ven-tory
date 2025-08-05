// Load environment variables from .env file
require('dotenv').config();

const path = require('path');
const fs = require('fs');

console.log('🔍 Debug Startup Script');
console.log('=======================');

// Check environment
console.log('\n📋 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('DB_PATH:', process.env.DB_PATH || 'undefined');
console.log('APP_PATH:', process.env.APP_PATH || 'undefined');

// Check database files
console.log('\n📁 Database Files Check:');
const dbPaths = [
  path.join(__dirname, 'backend', 'db', 'database.sqlite'),
  path.join(__dirname, 'backend', 'db', 'users.json'),
  path.join(__dirname, 'backend', 'db', 'database.json')
];

dbPaths.forEach(dbPath => {
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`✅ ${dbPath} - ${stats.size} bytes`);
    } else {
      console.log(`❌ ${dbPath} - Not found`);
    }
  } catch (error) {
    console.log(`❌ ${dbPath} - Error: ${error.message}`);
  }
});

// Check backend directory structure
console.log('\n📂 Backend Structure Check:');
const backendPath = path.join(__dirname, 'backend');
const requiredFiles = [
  'server.js',
  'config/initDb.js',
  'db/init.js',
  'controllers/SalesController.js',
  'middleware/database.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(backendPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check if we can import the database initializer
console.log('\n🔧 Database Initializer Test:');
try {
  const dbInitializer = require('./backend/config/initDb');
  console.log('✅ Database initializer imported successfully');
  
  // Test database path
  const dbPath = dbInitializer.getDatabasePath();
  console.log('Database path:', dbPath);
  
  // Check if directory exists
  const dbDir = path.dirname(dbPath);
  if (fs.existsSync(dbDir)) {
    console.log('✅ Database directory exists');
  } else {
    console.log('❌ Database directory missing');
    console.log('Creating directory...');
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Database directory created');
  }
  
} catch (error) {
  console.log('❌ Database initializer error:', error.message);
}

// Check JSON database
console.log('\n📄 JSON Database Test:');
try {
  const jsonDb = require('./backend/db/init');
  console.log('✅ JSON database module imported');
  
  // Test initialization with a test path
  const testPath = path.join(__dirname, 'backend', 'db', 'test-users.json');
  jsonDb.initializeDatabase(testPath);
  console.log('✅ JSON database initialized successfully');
  
  // Clean up test file
  if (fs.existsSync(testPath)) {
    fs.unlinkSync(testPath);
    console.log('✅ Test file cleaned up');
  }
  
} catch (error) {
  console.log('❌ JSON database error:', error.message);
}

console.log('\n🎯 Debug check completed!');
console.log('If you see any ❌ errors above, those need to be fixed.');
console.log('The main issues are likely:');
console.log('1. Database directory permissions');
console.log('2. JSON file corruption');
console.log('3. Missing environment variables'); 