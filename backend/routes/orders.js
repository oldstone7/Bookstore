const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const { protect, buyer, seller } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private/Buyer
router.post('/', protect, buyer, orderController.createOrder);

// @route   GET /api/orders
// @desc    Get buyer's orders
// @access  Private/Buyer
router.get('/', protect, buyer, orderController.getBuyerOrders);

// @route   GET /api/orders/seller
// @desc    Get seller's orders
// @access  Private/Seller
router.get('/seller', protect, seller, orderController.getSellerOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get(
  '/:id',
  [protect, param('id').isUUID()],
  orderController.getOrderById
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Seller
router.put(
  '/:id/status',
  [
    protect,
    seller,
    param('id').isUUID(),
    body('status', 'Status is required').isIn(['pending', 'shipped', 'delivered', 'cancelled'])
  ],
  orderController.updateOrderStatus
);

module.exports = router;
