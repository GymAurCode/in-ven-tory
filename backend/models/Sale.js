const { getDatabase } = require('../config/initDb');

class Sale {
  constructor(data = {}) {
    this.id = data.id;
    this.product_id = data.product_id;
    this.product_name = data.product_name;
    this.quantity = data.quantity;
    this.unit_price = data.unit_price;
    this.total_price = data.total_price;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  /**
   * Create a new sale
   */
  static async create(saleData) {
    try {
      const { product_id, quantity, description } = saleData;
      
      // Validation
      if (!product_id || !quantity) {
        throw new Error('Product ID and quantity are required');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const db = getDatabase();
      
      // Get product details
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if enough stock is available
      if (product.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`);
      }

      // Calculate total price
      const unit_price = product.selling_price;
      const total_price = unit_price * quantity;

      // Start transaction
      const transaction = db.transaction(() => {
        // Insert sale record
        const result = db.prepare(`
          INSERT INTO sales (product_id, product_name, quantity, unit_price, total_price, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(product_id, product.name, quantity, unit_price, total_price, description || null);

        const saleId = result.lastInsertRowid;

        // Update product stock
        db.prepare(`
          UPDATE products 
          SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(quantity, product_id);

        // Add income entry
        db.prepare(`
          INSERT INTO income (description, amount, type, product_id) 
          VALUES (?, ?, 'auto', ?)
        `).run(`Sale of ${product.name} (${quantity} units)`, total_price, product_id);

        return saleId;
      });

      const saleId = transaction();

      // Get the created sale
      const newSale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
      
      return new Sale(newSale);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all sales
   */
  static findAll() {
    try {
      const db = getDatabase();
      const sales = db.prepare(`
        SELECT * FROM sales 
        ORDER BY created_at DESC
      `).all();
      
      return sales.map(saleData => new Sale(saleData));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sales by product ID
   */
  static findByProductId(productId) {
    try {
      const db = getDatabase();
      const sales = db.prepare(`
        SELECT * FROM sales 
        WHERE product_id = ? 
        ORDER BY created_at DESC
      `).all(productId);
      
      return sales.map(saleData => new Sale(saleData));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sale by ID
   */
  static findById(id) {
    try {
      const db = getDatabase();
      const saleData = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
      
      return saleData ? new Sale(saleData) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sales statistics
   */
  static getStats() {
    try {
      const db = getDatabase();
      
      // Total sales
      const totalSales = db.prepare('SELECT COUNT(*) as count FROM sales').get();
      
      // Total quantity sold
      const totalQuantitySold = db.prepare('SELECT SUM(quantity) as total FROM sales').get();
      
      // Total revenue from sales
      const totalRevenue = db.prepare('SELECT SUM(total_price) as total FROM sales').get();
      
      // Distinct products sold
      const distinctProductsSold = db.prepare('SELECT COUNT(DISTINCT product_id) as count FROM sales').get();
      
      // Recent sales (last 7 days)
      const recentSales = db.prepare(`
        SELECT * FROM sales 
        WHERE created_at >= datetime('now', '-7 days')
        ORDER BY created_at DESC
      `).all();

      return {
        totalSales: totalSales.count,
        totalQuantitySold: totalQuantitySold.total || 0,
        totalRevenue: totalRevenue.total || 0,
        distinctProductsSold: distinctProductsSold.count,
        recentSales: recentSales.map(sale => new Sale(sale))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sales data for API response
   */
  toJSON() {
    return {
      id: this.id,
      product_id: this.product_id,
      product_name: this.product_name,
      quantity: this.quantity,
      unit_price: this.unit_price,
      total_price: this.total_price,
      description: this.description,
      created_at: this.created_at
    };
  }
}

module.exports = Sale; 