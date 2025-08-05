# Database Reset Guide

## 🗑️ **Available Reset Scripts:**

### **1. Complete Database Reset (`reset-database.js`)**
**What it does:**
- Deletes all database files completely
- Recreates fresh database structure
- Resets all data to initial state
- Clears products, sales, income, expenses

**When to use:**
- When you want to start completely fresh
- When database files are corrupted
- For testing purposes
- When you want to remove all data

**How to run:**
```bash
node reset-database.js
```

### **2. Data Clear Only (`clear-data.js`)**
**What it does:**
- Keeps database structure intact
- Clears only the data (products, sales, income, expenses)
- Resets user accounts to default
- Maintains database tables and structure

**When to use:**
- When you want to clear data but keep database structure
- For testing with fresh data
- When you want to reset to default state

**How to run:**
```bash
node clear-data.js
```

### **3. Database Fix (`fix-database.js`)**
**What it does:**
- Fixes database connection issues
- Cleans up corrupted files
- Ensures proper database initialization
- Does NOT clear data

**When to use:**
- When you have database connection errors
- When server crashes due to database issues
- For troubleshooting database problems

**How to run:**
```bash
node fix-database.js
```

## 🚀 **Using the Updated Start Script:**

### **Option 1: Start Normally**
- Starts the application without any database changes
- Use this for normal development

### **Option 2: Reset Database**
- Runs `reset-database.js`
- Completely clears all data
- Fresh start with new database

### **Option 3: Clear Data Only**
- Runs `clear-data.js`
- Clears data but keeps structure
- Resets to default state

### **Option 4: Fix Database Issues**
- Runs `fix-database.js`
- Fixes connection issues
- Does not clear data

## 📊 **What Gets Cleared:**

### **Complete Reset (`reset-database.js`):**
- ✅ All database files deleted
- ✅ Fresh database structure created
- ✅ All data cleared
- ✅ Default users restored

### **Data Clear (`clear-data.js`):**
- ✅ Products table cleared
- ✅ Sales table cleared
- ✅ Income table cleared
- ✅ Expenses table cleared
- ✅ User accounts reset to default
- ✅ Database structure preserved

### **Database Fix (`fix-database.js`):**
- ✅ Corrupted files removed
- ✅ Database directories created
- ✅ Connection issues fixed
- ✅ Data preserved

## 🔄 **After Reset:**

### **Default User Accounts:**
- **Username:** `owner1`, **Password:** `owner123`
- **Username:** `owner2`, **Password:** `owner123`

### **Fresh Dashboard:**
- Stock Products: 0
- Sold Products: 0
- Sales Income: 0
- Net Profit: 0

### **Ready to Use:**
- Add products to stock
- Sell products to generate income
- Monitor dashboard updates

## ⚠️ **Important Notes:**

### **Before Running Reset:**
- Make sure you want to lose all data
- Backup important data if needed
- Stop the application before resetting

### **After Running Reset:**
- All products will be cleared
- All sales history will be lost
- All income/expense records will be cleared
- Dashboard will show zero values

### **Safe to Use:**
- `clear-data.js` is safer as it preserves structure
- `reset-database.js` is more thorough but removes everything
- `fix-database.js` is safest as it doesn't clear data

## 🎯 **Quick Commands:**

```bash
# Complete reset (delete everything)
node reset-database.js

# Clear data only (keep structure)
node clear-data.js

# Fix database issues (keep data)
node fix-database.js

# Start with menu options
start-dev.bat
```

Choose the appropriate script based on what you want to achieve! 