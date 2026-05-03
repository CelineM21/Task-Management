const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// GET /auth/register
router.get('/register', authController.showRegister);

// POST /auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

// GET /auth/login
router.get('/login', authController.showLogin);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/logout
router.post('/logout', authController.logout);

module.exports = router;