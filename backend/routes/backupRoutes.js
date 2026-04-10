const express = require('express');
const router = express.Router();
const multer = require('multer');
const backupController = require('../controllers/backupController');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create backup
router.post('/create', backupController.createBackup);

// Restore backup (accepts file upload)
router.post('/restore', upload.single('backupFile'), backupController.restoreBackup);

module.exports = router;
