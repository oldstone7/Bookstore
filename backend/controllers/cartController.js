const pool = require('../config/db');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private/Buyer
exports.getCart = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    
    const cart = await pool.query(
      `SELECT 
        c.id as cart_item_id,
        c.quantity,
        b.id as book_id,
        b.title,
        b.description,
        b.price,
        b.image_url,
        b.stock,
        b.seller_id,
        u.name as seller_name
       FROM cart c 
       JOIN books b ON c.book_id = b.id 
       JOIN users u ON b.seller_id = u.id
       WHERE c.buyer_id = $1`,
      [buyer_id]
    );

    // Calculate total price
    const total = cart.rows.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    res.json({ items: cart.rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private/Buyer
exports.addToCart = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const { book_id, quantity = 1 } = req.body;

    // Check if book exists and is in stock
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1 AND stock > 0',
      [book_id]
    );

    if (book.rows.length === 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT * FROM cart WHERE buyer_id = $1 AND book_id = $2',
      [buyer_id, book_id]
    );

    let cartItem;
    
    if (existingItem.rows.length > 0) {
      // Update quantity if item already in cart
      cartItem = await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
        [quantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item to cart
      cartItem = await pool.query(
        'INSERT INTO cart (buyer_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [buyer_id, book_id, quantity]
      );
    }

    res.status(201).json(cartItem.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private/Buyer
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const buyer_id = req.user.id;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if cart item exists and belongs to user
    const cartItem = await pool.query(
      'SELECT * FROM cart WHERE id = $1 AND buyer_id = $2',
      [id, buyer_id]
    );
    console.log("UpdateCartItem → id:", id, "buyer_id:", buyer_id);


    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check if book is in stock
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1 AND stock >= $2',
      [cartItem.rows[0].book_id, quantity]
    );

    if (book.rows.length === 0) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Update quantity
    const updatedItem = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND buyer_id = $3 RETURNING *',
      [quantity, id, buyer_id]
    );

    res.json(updatedItem.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private/Buyer
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND buyer_id = $2 RETURNING *',
      [id, buyer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private/Buyer
exports.clearCart = async (req, res) => {
  try {
    const buyer_id = req.user.id;

    await pool.query('DELETE FROM cart WHERE buyer_id = $1', [buyer_id]);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
