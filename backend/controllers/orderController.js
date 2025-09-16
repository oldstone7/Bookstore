const pool = require('../config/db');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private/Buyer
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const buyer_id = req.user.id;

    // Get cart items
    const cartItems = await client.query(
      `SELECT c.id as cart_id, c.quantity, b.* 
       FROM cart c 
       JOIN books b ON c.book_id = b.id 
       WHERE c.buyer_id = $1`,
      [buyer_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Check stock and calculate total
    let total = 0;
    const orderItems = [];
    
    for (const item of cartItems.rows) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Not enough stock for ${item.title}` 
        });
      }
      
      total += item.price * item.quantity;
      orderItems.push({
        book_id: item.id,
        seller_id: item.seller_id,
        quantity: item.quantity,
        price: item.price,
        title: item.title
      });
    }

    // Create orders for each seller
    const ordersBySeller = {};
    
    orderItems.forEach(item => {
      if (!ordersBySeller[item.seller_id]) {
        ordersBySeller[item.seller_id] = [];
      }
      ordersBySeller[item.seller_id].push(item);
    });

    const orderIds = [];
    
    // Create an order per seller
    for (const [sellerId, items] of Object.entries(ordersBySeller)) {
      const order = await client.query(
        `INSERT INTO orders (buyer_id, seller_id, status, total_price) 
         VALUES ($1, $2, 'pending', $3) 
         RETURNING *`,
        [buyer_id, sellerId, items.reduce((sum, item) => sum + (item.price * item.quantity), 0)]
      );
      
      const orderId = order.rows[0].id;
      orderIds.push(orderId);

      // Add order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, book_id, quantity, price) 
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.book_id, item.quantity, item.price]
        );

        // Update book stock
        await client.query(
          'UPDATE books SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.book_id]
        );
      }
    }

    // Clear cart
    await client.query('DELETE FROM cart WHERE buyer_id = $1', [buyer_id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Order created successfully',
      orderIds
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error during order creation' });
  } finally {
    client.release();
  }
};

// @desc    Get buyer's orders
// @route   GET /api/orders/buyer
// @access  Private/Buyer
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    
    const orders = await pool.query(
      `SELECT o.*, u.name as seller_name 
       FROM orders o 
       JOIN users u ON o.seller_id = u.id 
       WHERE o.buyer_id = $1 
       ORDER BY o.created_at DESC`,
      [buyer_id]
    );

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.*, b.title, b.image_url 
           FROM order_items oi 
           JOIN books b ON oi.book_id = b.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get seller's orders
// @route   GET /api/orders/seller
// @access  Private/Seller
exports.getSellerOrders = async (req, res) => {
  try {
    const seller_id = req.user.id;
    
    const orders = await pool.query(
      `SELECT o.*, u.name as buyer_name 
       FROM orders o 
       JOIN users u ON o.buyer_id = u.id 
       WHERE o.seller_id = $1 
       ORDER BY o.created_at DESC`,
      [seller_id]
    );

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.*, b.title, b.image_url 
           FROM order_items oi 
           JOIN books b ON oi.book_id = b.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const seller_id = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if order exists and belongs to seller
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND seller_id = $2',
      [id, seller_id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    const updatedOrder = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(updatedOrder.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Base query to check if user has access to this order
    let orderQuery = `
      SELECT o.*, 
             buyer.name as buyer_name, 
             seller.name as seller_name 
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      WHERE o.id = $1 AND 
    `;

    // Add condition based on user role
    if (user_role === 'buyer') {
      orderQuery += 'o.buyer_id = $2';
    } else {
      orderQuery += 'o.seller_id = $2';
    }

    const order = await pool.query(orderQuery, [id, user_id]);

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const items = await pool.query(
      `SELECT oi.*, b.title, b.image_url 
       FROM order_items oi 
       JOIN books b ON oi.book_id = b.id 
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
