const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.redirect('/auth/login');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/auth/login');
  }
};

const attachCurrentUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) { req.user = null; return next(); }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    req.user = null;
  }
  next();
};

// Accept multiple roles: requireRole('admin', 'manager')
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login');
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        backUrl: req.get('Referer') || '/'
      });
    }
    next();
  };
};

module.exports = { authenticateToken, attachCurrentUser, requireRole };
