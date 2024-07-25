const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: true, message: 'Authorization token not provided' });
    }

    const decoded = jwt.verify(token, jwtKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;