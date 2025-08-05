# Dashboard Logic Explanation

## 🎯 **Correct Dashboard Behavior:**

### **1. Stock Products (Products with Quantity > 0)**
- **Dashboard shows**: Only products that have stock (quantity > 0)
- **Adding products**: When you add products to stock, they appear in "Stock Products" count
- **No income impact**: Adding products to stock does NOT create income or profit
- **Purpose**: Track available inventory for sale

### **2. Sales Income (Only from Selling Products)**
- **Income generation**: Income is ONLY created when products are sold
- **Profit calculation**: Profit = Sales Income - Expenses
- **Dashboard shows**: Income and profit from actual sales transactions
- **No impact from adding stock**: Adding products to stock doesn't affect income/profit

## 📊 **Dashboard Metrics Explained:**

### **Stock Products Count**
- Shows products with `quantity > 0`
- Updated when products are added to stock
- Decreases when products are sold (stock deducted)

### **Sold Products Count**
- Shows unique products that have been sold
- Only increases when products are actually sold
- Tracks distinct products sold, not total quantity

### **Sales Income**
- Shows total income from product sales only
- Increases only when products are sold
- Does NOT include income from adding products to stock

### **Net Profit**
- Shows profit from sales minus expenses
- Calculated as: `Sales Income - Expenses`
- Only affected by actual sales transactions

## 🔄 **Transaction Flow:**

### **When Adding Products to Stock:**
1. Product added to `products` table
2. Stock Products count increases
3. **NO income or profit created**
4. Dashboard shows updated stock count

### **When Selling Products:**
1. Sale record created in `sales` table
2. Product stock deducted from `products` table
3. **Income entry created** in `income` table
4. Stock Products count decreases
5. Sold Products count increases
6. Sales Income increases
7. Net Profit recalculated

## 💡 **Key Points:**

### **✅ What Dashboard Shows:**
- **Stock Products**: Products available for sale (quantity > 0)
- **Sold Products**: Unique products that have been sold
- **Sales Income**: Money earned from selling products
- **Net Profit**: Profit from sales minus expenses

### **❌ What Dashboard Does NOT Show:**
- Products with zero stock
- Income from adding products to stock
- Profit from inventory purchases
- Expenses unrelated to sales

## 🎯 **Business Logic:**

### **Adding Products (Inventory Management):**
- Increases stock count
- No financial impact on income/profit
- Products become available for sale

### **Selling Products (Revenue Generation):**
- Decreases stock count
- Creates income and profit
- Updates sales statistics
- Affects financial calculations

## 📈 **Dashboard Updates:**

### **Real-time Updates:**
- Stock count updates immediately when products are added/sold
- Sales income updates when products are sold
- Profit calculations update based on sales and expenses
- All metrics reflect actual business transactions

### **Data Accuracy:**
- Income only from actual sales
- Profit only from sales minus expenses
- Stock count reflects available inventory
- Sales count reflects completed transactions

This ensures the dashboard shows accurate business metrics where:
- **Stock Products** = Available inventory
- **Sales Income** = Revenue from sales only
- **Net Profit** = Profit from sales only 