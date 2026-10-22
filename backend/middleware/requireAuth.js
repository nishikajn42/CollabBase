const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Authentication is not configured.' });
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  if (typeof claims !== 'object' || typeof claims.sub !== 'string') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  try {
    const user = await User.findById(claims.sub).select('_id');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = requireAuth;