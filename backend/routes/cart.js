const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cartController = require('../controllers/cartController');
const { protect, buyer } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private/Buyer
router.get('/', protect, buyer, cartController.getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private/Buyer
router.post(
  '/',
  [
    protect,
    buyer,
    body('book_id', 'Book ID is required').isUUID(),
    body('quantity', 'Quantity must be a positive integer').optional().isInt({ min: 1 })
  ],
  cartController.addToCart
);

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private/Buyer
router.put(
  '/:id',
  [
    protect,
    buyer,
    param('id').isUUID(),
    body('quantity', 'Quantity is required and must be greater than 0').isInt({ min: 1 })
  ],
  cartController.updateCartItem
);

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private/Buyer
router.delete(
  '/:id',
  [protect, buyer, param('id').isUUID()],
  cartController.removeFromCart
);

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private/Buyer
router.delete('/', protect, buyer, cartController.clearCart);

module.exports = router;
