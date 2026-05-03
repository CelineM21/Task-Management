const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', projectController.getProjects);
// /new must come BEFORE /:id
router.get('/new', requireRole('admin', 'manager'), projectController.showCreateForm);
router.post('/', requireRole('admin', 'manager'), projectController.createProject);
router.get('/:id', projectController.getProject);
router.get('/:id/edit', requireRole('admin', 'manager'), projectController.showEditForm);
router.put('/:id', requireRole('admin', 'manager'), projectController.updateProject);
router.delete('/:id', requireRole('admin'), projectController.deleteProject);

module.exports = router;
