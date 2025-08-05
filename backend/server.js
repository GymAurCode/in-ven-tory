// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const expenseRoutes = require('./routes/expenses');
const financeRoutes = require('./routes/finance');
const partnerRoutes = require('./routes/partners');
const salesRoutes = require('./routes/sales');

// Import SQLite database initialization
const dbInitializer = require('./config/initDb');

// Import JSON database initialization used by controllers
const jsonDb = require('./db/init');

const app = express();
const PORT = process.env.PORT || 4000;

// Set development environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Set default database path if not provided
if (!process.env.DB_PATH) {
  if (process.env.NODE_ENV === 'development') {
    process.env.DB_PATH = path.join(__dirname, 'db', 'database.sqlite');
  } else {
    // Production: Use app's user data directory
    const appDataPath = process.platform === 'win32' 
      ? process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming')
      : process.platform === 'darwin'
      ? path.join(process.env.HOME, 'Library', 'Application Support')
      : process.env.XDG_DATA_HOME || path.join(process.env.HOME, '.local', 'share');
    
    const appFolder = path.join(appDataPath, 'EyercallData');
    process.env.DB_PATH = path.join(appFolder, 'database.sqlite');
  }
}

// Set default app path if not provided
if (!process.env.APP_PATH) {
  if (process.env.NODE_ENV === 'development') {
    process.env.APP_PATH = __dirname;
  } else {
    // Production: Use app's user data directory
    const appDataPath = process.platform === 'win32' 
      ? process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming')
      : process.platform === 'darwin'
      ? path.join(process.env.HOME, 'Library', 'Application Support')
      : process.env.XDG_DATA_HOME || path.join(process.env.HOME, '.local', 'share');
    
    process.env.APP_PATH = path.join(appDataPath, 'EyercallData');
  }
}

console.log('Server starting with environment:', process.env.NODE_ENV);
console.log('Database path from env:', process.env.DB_PATH);
console.log('App path from env:', process.env.APP_PATH);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database with proper path handling
try {
  // Initialize SQLite DB with environment-specific path
  dbInitializer.initializeDatabase();
  
  // Initialize JSON DB used by AuthController and others
  // Use a separate JSON file for user authentication
  const jsonDbPath = path.join(__dirname, 'db', 'users.json');
  jsonDb.initializeDatabase(jsonDbPath);
  
  console.log('✅ Database initialization completed');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  // Don't exit the process, just log the error and continue
  // The SQLite database should still work even if JSON init fails
}

// Make database available to routes - set both for compatibility
const db = dbInitializer.getDatabase();
app.locals.db = db;
app.set('db', db);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/sales', salesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbInitializer.getDatabasePath()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Database path: ${dbInitializer.getDatabasePath()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  dbInitializer.closeDatabase();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  dbInitializer.closeDatabase();
  process.exit(0);
});

module.exports = app; 