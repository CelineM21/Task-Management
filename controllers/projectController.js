const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
  try {
    const role = req.user.role;
    let projects;

    if (role === 'admin' || role === 'manager') {
      // Admin and manager see all projects
      projects = await Project.find().populate('members').populate('createdBy');
    } else {
      // Regular users only see projects they are members of
      projects = await Project.find({ members: req.user.id }).populate('members').populate('createdBy');
    }

    res.render('projects/list', { projects });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching projects', backUrl: '/' });
  }
};

const getProject = async (req, res) => {
  try {
    const role = req.user.role;
    const project = await Project.findById(req.params.id).populate('members').populate('createdBy');
    if (!project) return res.status(404).render('error', { title: 'Not Found', message: 'Project not found', backUrl: '/projects' });

    // Users can only view their own assigned projects
    if (role === 'user' && !project.members.some(m => m && m._id.toString() === req.user.id)) {
      return res.status(403).render('error', { title: 'Access Denied', message: 'You are not a member of this project.', backUrl: '/projects' });
    }

    const tasks = await Task.find({ project: project._id }).populate('assignedUser');
    res.render('projects/details', { project, tasks });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error fetching project', backUrl: '/projects' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const memberIds = Array.isArray(req.body.members)
      ? req.body.members
      : req.body.members ? [req.body.members] : [];
    const validMembers = await User.find({ _id: { $in: memberIds } }).select('_id');
    const project = new Project({
      name,
      description,
      status,
      members: validMembers.map(u => u._id),
      createdBy: req.user.id
    });
    await project.save();
    res.redirect('/projects');
  } catch (error) {
    const users = await User.find().select('-password');
    res.render('projects/create', { error: 'Error creating project', users });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const memberIds = Array.isArray(req.body.members)
      ? req.body.members
      : req.body.members ? [req.body.members] : [];
    const validMembers = await User.find({ _id: { $in: memberIds } }).select('_id');
    await Project.findByIdAndUpdate(req.params.id, {
      name,
      description,
      status,
      members: validMembers.map(u => u._id)
    });
    res.redirect('/projects');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error updating project', backUrl: '/projects' });
  }
};

const deleteProject = async (req, res) => {
  try {
    await Promise.all([
      Task.deleteMany({ project: req.params.id }),
      Project.findByIdAndDelete(req.params.id)
    ]);
    res.redirect('/projects');
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error deleting project', backUrl: '/projects' });
  }
};

const showCreateForm = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.render('projects/create', { error: null, users });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error loading form', backUrl: '/projects' });
  }
};

const showEditForm = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members');
    if (!project) return res.status(404).render('error', { title: 'Not Found', message: 'Project not found', backUrl: '/projects' });
    const users = await User.find().select('-password');
    res.render('projects/edit', { error: null, project, users });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', message: 'Error loading form', backUrl: '/projects' });
  }
};

module.exports = {
  getProjects, getProject, createProject, updateProject,
  deleteProject, showCreateForm, showEditForm
};
