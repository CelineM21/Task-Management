const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { app } = require('../app');
const authRoutes = require('../routes/auth');
const taskRoutes = require('../routes/tasks');
const projectRoutes = require('../routes/projects');
const userRoutes = require('../routes/users');
const authController = require('../controllers/authController');
const taskController = require('../controllers/taskController');
const projectController = require('../controllers/projectController');
const userController = require('../controllers/userController');
const { authenticateToken, attachCurrentUser, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

function getRouteSignatures(router) {
  return router.stack
    .filter(layer => layer.route)
    .flatMap(layer => Object.keys(layer.route.methods).map(method => `${method.toUpperCase()} ${layer.route.path}`));
}

test('app exports an Express application without starting the server', () => {
  assert.equal(typeof app.use, 'function');
  assert.equal(typeof app.set, 'function');
});

test('models define validations and relationships required by the project', () => {
  const invalidUser = new User({});
  const userValidation = invalidUser.validateSync();
  assert.ok(userValidation.errors.name);
  assert.ok(userValidation.errors.email);
  assert.ok(userValidation.errors.password);

  assert.equal(User.schema.path('role').defaultValue, 'user');
  assert.deepEqual(User.schema.path('role').enumValues, ['user', 'admin']);
  assert.equal(Task.schema.path('assignedUser').options.ref, 'User');
  assert.equal(Task.schema.path('project').options.ref, 'Project');
  assert.equal(Project.schema.obj.members[0].ref, 'User');
});

test('controllers export the expected MVC handlers', () => {
  ['register', 'login', 'logout', 'showRegister', 'showLogin'].forEach(name => {
    assert.equal(typeof authController[name], 'function');
  });

  ['getTasks', 'getTask', 'createTask', 'updateTask', 'deleteTask', 'showCreateForm', 'showEditForm'].forEach(name => {
    assert.equal(typeof taskController[name], 'function');
  });

  ['getProjects', 'getProject', 'createProject', 'updateProject', 'deleteProject', 'showCreateForm', 'showEditForm'].forEach(name => {
    assert.equal(typeof projectController[name], 'function');
  });

  ['getUsers', 'getUser', 'createUser', 'updateUser', 'deleteUser', 'showCreateForm', 'showEditForm'].forEach(name => {
    assert.equal(typeof userController[name], 'function');
  });
});

test('routers expose CRUD and authentication endpoints', () => {
  const authPaths = getRouteSignatures(authRoutes);
  const taskPaths = getRouteSignatures(taskRoutes);
  const projectPaths = getRouteSignatures(projectRoutes);
  const userPaths = getRouteSignatures(userRoutes);

  ['GET /register', 'POST /register', 'GET /login', 'POST /login', 'POST /logout'].forEach(route => {
    assert.ok(authPaths.includes(route));
  });

  ['GET /', 'GET /new', 'POST /', 'GET /:id', 'GET /:id/edit', 'PUT /:id', 'DELETE /:id'].forEach(route => {
    assert.ok(taskPaths.includes(route));
    assert.ok(projectPaths.includes(route));
    assert.ok(userPaths.includes(route));
  });
});

test('authentication middleware accepts valid JWTs and enforces roles', async () => {
  const token = jwt.sign({ id: 'abc123', role: 'admin' }, process.env.JWT_SECRET);

  const attachedUser = await new Promise((resolve, reject) => {
    const req = { cookies: { token } };
    attachCurrentUser(req, {}, error => {
      if (error) {
        reject(error);
        return;
      }

      resolve(req.user);
    });
  });

  assert.equal(attachedUser.role, 'admin');

  await new Promise((resolve, reject) => {
    const req = { cookies: { token } };
    const res = {
      redirect: destination => reject(new Error(`Unexpected redirect to ${destination}`))
    };

    authenticateToken(req, res, error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  const denial = await new Promise(resolve => {
    const middleware = requireRole('admin');
    const req = { user: { role: 'user' } };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      send(message) {
        resolve({ code: this.statusCode, message });
      }
    };

    middleware(req, res, () => resolve({ code: 200, message: 'ok' }));
  });

  assert.equal(denial.code, 403);
  assert.equal(denial.message, 'Access denied');
});

test('deployment and submission artifacts are present', () => {
  [
    '.github/workflows/ci.yml',
    '.env.example',
    'render.yaml',
    'submission-info.txt'
  ].forEach(file => {
    assert.ok(fs.existsSync(path.join(__dirname, '..', file)), `${file} should exist`);
  });
});
