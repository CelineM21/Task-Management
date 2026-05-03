const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.render('users/list', { error: null, users });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching users', backUrl: '/' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).render('error', { title: 'Not Found', message: 'User not found', backUrl: '/users' });
    res.render('users/details', { user });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching user', backUrl: '/users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Manager cannot create admin users
    const callerRole = req.user.role;
    const assignedRole = (callerRole === 'manager' && role === 'admin') ? 'user' : role;
    const user = new User({ name, email, password, role: assignedRole });
    await user.save();
    res.redirect('/users');
  } catch (error) {
    const message = error.code === 11000
      ? 'A user with that email already exists'
      : 'Error creating user';
    res.render('users/create', { error: message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).render('error', { title: 'Not Found', message: 'User not found', backUrl: '/users' });

    if (existingUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).render('users/edit', {
          error: 'At least one admin account is required',
          user: existingUser
        });
      }
    }

    await User.findByIdAndUpdate(req.params.id, { name, email, role });
    res.redirect('/users');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error updating user', backUrl: '/users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).render('error', { title: 'Not Found', message: 'User not found', backUrl: '/users' });

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        const users = await User.find().select('-password');
        return res.status(400).render('users/list', {
          error: 'You cannot delete the last admin account',
          users
        });
      }
    }

    await Promise.all([
      Task.deleteMany({ assignedUser: req.params.id }),
      Project.updateMany({ members: req.params.id }, { $pull: { members: req.params.id } }),
      User.findByIdAndDelete(req.params.id)
    ]);
    res.redirect('/users');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error deleting user', backUrl: '/users' });
  }
};

const showCreateForm = (req, res) => {
  res.render('users/create', { error: null });
};

const showEditForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.render('users/edit', { error: null, user });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching user', backUrl: '/users' });
  }
};

module.exports = {
  getUsers, getUser, createUser, updateUser,
  deleteUser, showCreateForm, showEditForm
};
