const Sale = require('../models/Sale');
const dbService = require('../config/initDb');

class SalesController {
  /**
   * Create a new sale
   */
  static async createSale(req, res) {
    try {
      const { product_id, quantity, description } = req.body;
      
      // Validation
      if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }

      // Get database from request (set by middleware)
      const db = req.db;
      
      // Get product details
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if enough stock is available
      if (product.quantity < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}` 
        });
      }

      // Calculate sale details
      const unit_price = product.selling_price;
      const total_price = unit_price * quantity;
      const total_cost = product.cost_price * quantity;
      const profit = total_price - total_cost;

      // Start transaction for atomic operations
      const transaction = db.transaction(() => {
        // 1. Insert sale record
        const saleResult = db.prepare(`
          INSERT INTO sales (product_id, product_name, quantity, unit_price, total_price, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(product_id, product.name, quantity, unit_price, total_price, description || null);

        const saleId = saleResult.lastInsertRowid;

        // 2. Update product stock (deduct sold quantity)
        db.prepare(`
          UPDATE products 
          SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(quantity, product_id);

        // 3. Add income entry for the sale (selling price)
        db.prepare(`
          INSERT INTO income (description, amount, type, product_id) 
          VALUES (?, ?, 'auto', ?)
        `).run(`Sale of ${product.name} (${quantity} units)`, total_price, product_id);

        // 4. Add expense entry for the cost price (this creates accurate profit calculation)
        db.prepare(`
          INSERT INTO expenses (description, amount, type, category, product_id) 
          VALUES (?, ?, 'auto', 'Product Cost', ?)
        `).run(`Cost of ${product.name} (${quantity} units)`, total_cost, product_id);

        return saleId;
      });

      const saleId = transaction();

      // Get the created sale
      const newSale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
      
      res.status(201).json({ 
        sale: newSale,
        message: 'Sale completed successfully',
        income_generated: total_price,
        cost_recorded: total_cost,
        profit_generated: profit,
        stock_remaining: product.quantity - quantity
      });
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({ error: error.message || 'Failed to create sale' });
    }
  }

  /**
   * Get all sales
   */
  static async getAllSales(req, res) {
    try {
      const sales = Sale.findAll();
      res.json({ sales: sales.map(sale => sale.toJSON()) });
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  }

  /**
   * Get sale by ID
   */
  static async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const sale = Sale.findById(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json({ sale: sale.toJSON() });
    } catch (error) {
      console.error('Get sale error:', error);
      res.status(500).json({ error: 'Failed to fetch sale' });
    }
  }

  /**
   * Get sales by product ID
   */
  static async getSalesByProduct(req, res) {
    try {
      const { productId } = req.params;
      const sales = Sale.findByProductId(productId);
      res.json({ sales: sales.map(sale => sale.toJSON()) });
    } catch (error) {
      console.error('Get sales by product error:', error);
      res.status(500).json({ error: 'Failed to fetch sales for product' });
    }
  }

  /**
   * Get sales statistics
   */
  static async getSalesStats(req, res) {
    try {
      const stats = Sale.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get sales stats error:', error);
      res.status(500).json({ error: 'Failed to fetch sales statistics' });
    }
  }

  /**
   * Get products available for sale
   */
  static async getProductsForSale(req, res) {
    try {
      // Get database from request (set by middleware)
      const db = req.db;
      
      // Get products with stock > 0
      const products = db.prepare(`
        SELECT id, name, selling_price, quantity 
        FROM products 
        WHERE quantity > 0 
        ORDER BY name
      `).all();

      res.json({ products });
    } catch (error) {
      console.error('Get products for sale error:', error);
      res.status(500).json({ error: 'Failed to fetch products for sale' });
    }
  }
}

module.exports = SalesController; 