const dbService = require('../config/initDb');

/**
 * Middleware to ensure database is available in all requests
 */
const ensureDatabase = (req, res, next) => {
  try {
    // Get database instance - try multiple methods for compatibility
    let db = null;
    
    // First try to get from app.locals
    if (req.app && req.app.locals && req.app.locals.db) {
      db = req.app.locals.db;
    }
    // Then try app.get
    else if (req.app && req.app.get) {
      db = req.app.get('db');
    }
    // Finally try direct service
    else {
      try {
        db = dbService.getDatabase();
      } catch (serviceError) {
        console.error('Database service error:', serviceError);
      }
    }

    if (!db) {
      console.error('Database not available in middleware');
      return res.status(500).json({ 
        error: 'Database connection not available',
        message: 'Please restart the application'
      });
    }

    // Test database connection
    try {
      // Simple test query
      db.prepare('SELECT 1').get();
    } catch (testError) {
      console.error('Database connection test failed:', testError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: 'Database is not responding properly'
      });
    }

    // Attach database to request for easy access
    req.db = db;
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: 'Unable to establish database connection'
    });
  }
};

module.exports = {
  ensureDatabase
}; 