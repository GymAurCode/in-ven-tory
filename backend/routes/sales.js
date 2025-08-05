const express = require('express');
const SalesController = require('../controllers/SalesController');
const { authenticateToken, requireStaffOrOwner } = require('../middleware/auth');
const { ensureDatabase } = require('../middleware/database');

const router = express.Router();

// Apply database middleware to all sales routes
router.use(ensureDatabase);

// Get all sales
router.get('/', authenticateToken, requireStaffOrOwner, SalesController.getAllSales);

// Get sales statistics
router.get('/stats', authenticateToken, requireStaffOrOwner, SalesController.getSalesStats);

// Get products available for sale
router.get('/products', authenticateToken, requireStaffOrOwner, SalesController.getProductsForSale);

// Create new sale
router.post('/', authenticateToken, requireStaffOrOwner, SalesController.createSale);

// Get sale by ID
router.get('/:id', authenticateToken, requireStaffOrOwner, SalesController.getSaleById);

// Get sales by product ID
router.get('/product/:productId', authenticateToken, requireStaffOrOwner, SalesController.getSalesByProduct);

module.exports = router; 