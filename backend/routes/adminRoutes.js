const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdmin);

/* CHECK IF ADMIN EXISTS */
router.get('/exists', adminController.checkAdminExists);

/* DEBUG: GET ALL ADMINS (for troubleshooting) */
router.get('/debug/all', adminController.getAllAdminsDebug);

/* LOGIN ADMIN */
router.post('/login', adminController.loginAdmin);

/* VERIFY IDENTITY FOR PASSWORD RESET */
router.post('/verify-identity', adminController.verifyIdentity);

/* REGISTER ADMIN */
router.post('/register', adminController.registerAdmin);

/* DELETE ADMIN (for rollback) */
router.delete('/:id', adminController.deleteAdmin);

/* RESET PASSWORD */
router.post('/reset-password', adminController.resetPassword);

/* ADMIN PROFILE */
router.get('/profile/:id', adminController.getAdminProfile);
router.put('/profile/:id', adminController.updateAdminProfile);

module.exports = router;
