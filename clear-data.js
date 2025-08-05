const path = require('path');
const fs = require('fs');

console.log('🧹 Data Clear Script');
console.log('===================');

// Function to clear specific data from SQLite database
function clearDatabaseData() {
  try {
    const dbInitializer = require('./backend/config/initDb');
    const db = dbInitializer.getDatabase();
    
    console.log('\n🗑️  Clearing database data...');
    
    // Clear all data from tables
    const tables = ['sales', 'income', 'expenses', 'products'];
    
    tables.forEach(table => {
      try {
        db.prepare(`DELETE FROM ${table}`).run();
        console.log(`✅ Cleared ${table} table`);
      } catch (error) {
        console.log(`❌ Error clearing ${table}: ${error.message}`);
      }
    });
    
    // Reset auto-increment counters
    try {
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('sales', 'income', 'expenses', 'products')").run();
      console.log('✅ Reset auto-increment counters');
    } catch (error) {
      console.log(`❌ Error resetting counters: ${error.message}`);
    }
    
    console.log('✅ Database data cleared successfully');
    
  } catch (error) {
    console.log('❌ Database error:', error.message);
  }
}

// Function to clear JSON user data
function clearUserData() {
  try {
    const jsonDb = require('./backend/db/init');
    const jsonPath = path.join(__dirname, 'backend', 'db', 'users.json');
    
    // Reinitialize JSON database (this will reset to default users)
    jsonDb.initializeDatabase(jsonPath);
    console.log('✅ User data reset to default');
    
  } catch (error) {
    console.log('❌ JSON database error:', error.message);
  }
}

// Function to show current data status
function showDataStatus() {
  try {
    const dbInitializer = require('./backend/config/initDb');
    const db = dbInitializer.getDatabase();
    
    console.log('\n📊 Current Data Status:');
    
    const tables = ['products', 'sales', 'income', 'expenses'];
    
    tables.forEach(table => {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
        console.log(`   ${table}: ${count.count} records`);
      } catch (error) {
        console.log(`   ${table}: Error reading data`);
      }
    });
    
  } catch (error) {
    console.log('❌ Error reading data status:', error.message);
  }
}

// Main execution
console.log('\n🔍 Checking current data...');
showDataStatus();

console.log('\n🧹 Starting data clear process...');

// Clear database data
clearDatabaseData();

// Clear user data
clearUserData();

console.log('\n🔍 Verifying data clear...');
showDataStatus();

console.log('\n🎉 Data clear completed!');
console.log('All products, sales, income, and expenses have been cleared.');
console.log('Default user accounts have been restored.');
console.log('You can now start fresh with the application.');
console.log('Run: npm run dev'); 