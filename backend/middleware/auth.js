const jwt = require('jsonwebtoken');
const DatabaseService = require('../utils/dbService');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await DatabaseService.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.id]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Add user data to request object
      req.user = user.rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is a seller
const seller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a seller' });
  }
};

// Middleware to check if user is a buyer
const buyer = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a buyer' });
  }
};

module.exports = { protect, seller, buyer };
