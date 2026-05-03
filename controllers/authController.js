const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const isFirstUser = (await User.countDocuments()) === 0;
    const user = new User({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : 'user'
    });
    await user.save();
    res.redirect('/auth/login');
  } catch (error) {
    let message = 'Registration failed';
    if (error.code === 11000) message = 'An account with that email already exists';
    else if (error.name === 'ValidationError') message = Object.values(error.errors)[0]?.message || message;
    res.render('auth/register', { errors: [{ msg: message }] });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, _id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.cookie('token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.redirect('/tasks');
  } catch (error) {
    res.render('auth/login', { error: 'Login failed. Please try again.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};

const showRegister = (req, res) => res.render('auth/register', { errors: [] });
const showLogin = (req, res) => res.render('auth/login', { error: null });

module.exports = { register, login, logout, showRegister, showLogin };
