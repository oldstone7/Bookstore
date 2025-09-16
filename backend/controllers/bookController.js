const pool = require('../config/db');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.*, u.name as seller_name 
      FROM books b 
      JOIN users u ON b.seller_id = u.id
      WHERE (b.title ILIKE $1 OR b.description ILIKE $1)
      AND b.is_active = true
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const books = await pool.query(query, [`%${search}%`, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM books 
      WHERE (title ILIKE $1 OR description ILIKE $1)
      AND is_active = true
    `;
    const totalCount = await pool.query(countQuery, [`%${search}%`]);
    
    res.json(books.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await pool.query(
      `SELECT b.*, u.name as seller_name 
       FROM books b 
       JOIN users u ON b.seller_id = u.id 
       WHERE b.id = $1`,
      [id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Seller
exports.createBook = async (req, res) => {
  try {
    const { title, description, price, stock, image_url } = req.body;
    const seller_id = req.user.id;

    const newBook = await pool.query(
      `INSERT INTO books 
       (seller_id, title, description, price, stock, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [seller_id, title, description, price, stock, image_url]
    );

    res.status(201).json(newBook.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Seller
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, image_url } = req.body;
    const seller_id = req.user.id;

    // Check if book exists and belongs to the seller
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1 AND seller_id = $2',
      [id, seller_id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found or unauthorized' });
    }

    const updatedBook = await pool.query(
      `UPDATE books 
       SET title = $1, description = $2, price = $3, stock = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND seller_id = $7 AND is_active = true
       RETURNING *`,
      [title, description, price, stock, image_url, id, seller_id]
    );

    res.json(updatedBook.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Seller
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    // Check if book exists and belongs to the seller
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1 AND seller_id = $2',
      [id, seller_id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found or unauthorized' });
    }

    await pool.query(
      'UPDATE books SET is_active = false WHERE id = $1 AND seller_id = $2',
      [id, seller_id]
    );

    res.json({ message: 'Book removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get seller's books
// @route   GET /api/books/seller/me
// @access  Private/Seller
exports.getMyBooks = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const books = await pool.query(
      `SELECT * FROM books 
       WHERE seller_id = $1 
       AND is_active = true
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [seller_id, limit, offset]
    );

    const count = await pool.query(
      'SELECT COUNT(*) FROM books WHERE seller_id = $1 AND is_active = true',
      [seller_id]
    );

    res.json(books.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
