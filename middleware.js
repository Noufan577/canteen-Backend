const jwt = require('jsonwebtoken');

const authMiddleware = (roles) => (req, res, next) => {
  try {
    // Get the token from the request header
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    // Verify the token and get user info (like their role)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user's role is allowed to access this route
    if (!roles.includes(decoded.role)) {
      throw new Error('Not authorized for this role');
    }

    // If everything is okay, let the request continue
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = authMiddleware;