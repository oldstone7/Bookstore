const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const bookController = require('../controllers/bookController');
const { protect, seller } = require('../middleware/auth');

// @route   GET /api/books
// @desc    Get all books with search and pagination
// @access  Public
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  bookController.getBooks
);

// @route   GET /api/books/seller/me
// @desc    Get current seller's books
// @access  Private/Seller
router.get('/seller/me', protect, seller, bookController.getMyBooks);

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get(
  '/:id',
  [param('id').isUUID()],
  bookController.getBookById
);

// @route   POST /api/books
// @desc    Create a new book
// @access  Private/Seller
router.post(
  '/',
  [
    protect,
    seller,
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('price', 'Price must be a positive number').isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative integer').isInt({ min: 0 }),
    body('image_url', 'Image URL is required').not().isEmpty(),
  ],
  bookController.createBook
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Seller
router.put(
  '/:id',
  [
    protect,
    seller,
    param('id').isUUID(),
    body('title').optional().not().isEmpty(),
    body('description').optional().not().isEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  bookController.updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Seller
router.delete(
  '/:id',
  [protect, seller, param('id').isUUID()],
  bookController.deleteBook
);

module.exports = router;
