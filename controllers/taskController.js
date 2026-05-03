const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    const role = req.user.role;
    let tasks;

    if (role === 'admin' || role === 'manager') {
      tasks = await Task.find().populate('assignedUser').populate('project');
    } else {
      // Users only see tasks assigned to them
      tasks = await Task.find({ assignedUser: req.user.id }).populate('assignedUser').populate('project');
    }

    res.render('tasks/list', { tasks });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching tasks', backUrl: '/' });
  }
};

const getTask = async (req, res) => {
  try {
    const role = req.user.role;
    const task = await Task.findById(req.params.id).populate('assignedUser').populate('project');
    if (!task) return res.status(404).render('error', { title: 'Not Found', message: 'Task not found', backUrl: '/tasks' });

    if (role === 'user' && task.assignedUser._id.toString() !== req.user.id) {
      return res.status(403).render('error', { title: 'Access Denied', message: 'You can only view your own tasks.', backUrl: '/tasks' });
    }

    res.render('tasks/details', { task });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching task', backUrl: '/tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const role = req.user.role;
    const { title, description, status, priority, dueDate, project } = req.body;

    let assignedUser;
    if (role === 'admin' || role === 'manager') {
      assignedUser = req.body.assignedUser || req.user.id;
    } else {
      // Users can only create tasks for themselves
      assignedUser = req.user.id;
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      const users = (role !== 'user') ? await User.find().select('-password') : [];
      const projects = (role === 'user')
        ? await Project.find({ members: req.user.id })
        : await Project.find();
      return res.render('tasks/create', { error: 'Invalid project selected', users, projects, role });
    }

    // Users can only create tasks in projects they belong to
    if (role === 'user' && !projectDoc.members.some(m => m.toString() === req.user.id)) {
      return res.status(403).render('error', { title: 'Access Denied', message: 'You are not a member of this project.', backUrl: '/tasks' });
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedUser,
      project
    });

    await task.save();
    res.redirect('/tasks');
  } catch (error) {
    const role = req.user.role;
    const users = (role !== 'user') ? await User.find().select('-password') : [];
    const projects = (role === 'user')
      ? await Project.find({ members: req.user.id })
      : await Project.find();
    res.render('tasks/create', { error: 'Error creating task', users, projects, role });
  }
};

const updateTask = async (req, res) => {
  try {
    const role = req.user.role;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).render('error', { title: 'Not Found', message: 'Task not found', backUrl: '/tasks' });

    if (role === 'user') {
      // Users can only edit their own tasks, and only description + status
      if (task.assignedUser.toString() !== req.user.id) {
        return res.status(403).render('error', { title: 'Access Denied', message: 'You can only edit your own tasks.', backUrl: '/tasks' });
      }
      task.description = req.body.description;
      task.status = req.body.status;
      // title, assignedUser, project remain unchanged
    } else {
      // Admin and manager can edit everything
      task.title = req.body.title;
      task.description = req.body.description;
      task.status = req.body.status;
      task.priority = req.body.priority;
      task.dueDate = req.body.dueDate || undefined;
      if (role === 'admin' || role === 'manager') {
        task.assignedUser = req.body.assignedUser;
        task.project = req.body.project;
      }
    }

    await task.save();
    res.redirect('/tasks');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error updating task', backUrl: '/tasks' });
  }
};

const deleteTask = async (req, res) => {
  try {
    // Only admin and manager can delete tasks
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/tasks');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error deleting task', backUrl: '/tasks' });
  }
};

const showCreateForm = async (req, res) => {
  try {
    const role = req.user.role;
    const users = (role !== 'user') ? await User.find().select('-password') : [];
    const projects = (role === 'user')
      ? await Project.find({ members: req.user.id })
      : await Project.find();
    res.render('tasks/create', { error: null, users, projects, role });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error loading form', backUrl: '/tasks' });
  }
};

const showEditForm = async (req, res) => {
  try {
    const role = req.user.role;
    const task = await Task.findById(req.params.id).populate('assignedUser').populate('project');
    if (!task) return res.status(404).render('error', { title: 'Not Found', message: 'Task not found', backUrl: '/tasks' });

    if (role === 'user' && task.assignedUser._id.toString() !== req.user.id) {
      return res.status(403).render('error', { title: 'Access Denied', message: 'You can only edit your own tasks.', backUrl: '/tasks' });
    }

    const users = (role !== 'user') ? await User.find().select('-password') : [];
    const projects = (role !== 'user') ? await Project.find() : [];
    res.render('tasks/edit', { error: null, task, users, projects, role });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error loading form', backUrl: '/tasks' });
  }
};

module.exports = {
  getTasks, getTask, createTask, updateTask,
  deleteTask, showCreateForm, showEditForm
};
