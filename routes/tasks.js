const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', taskController.getTasks);
router.get('/new', taskController.showCreateForm);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.get('/:id/edit', taskController.showEditForm);
router.put('/:id', taskController.updateTask);
router.delete('/:id', requireRole('admin', 'manager'), taskController.deleteTask);

module.exports = router;
