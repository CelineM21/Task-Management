const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', userController.getUsers);
router.get('/new', userController.showCreateForm);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.get('/:id/edit', userController.showEditForm);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
