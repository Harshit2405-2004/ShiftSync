const controller = require('../controllers/form.controller');
const { verifyToken, isOwner } = require('../middleware/auth.middleware');
const express = require('express');
const router = express.Router();

// --- Public/Viewable Routes ---
// Any authenticated user can access these.
router.get('/', [verifyToken], controller.getAllForms);
router.get('/:id', [verifyToken], controller.getFormById);

// --- Protected Write Routes ---
// Only an authenticated user can create a form.
router.post('/', [verifyToken], controller.createForm);

// --- Owner-Only Routes ---
// You must be the owner to update or delete.
router.put('/:id', [verifyToken, isOwner], controller.updateForm);
router.delete('/:id', [verifyToken, isOwner], controller.deleteForm);

module.exports = router;