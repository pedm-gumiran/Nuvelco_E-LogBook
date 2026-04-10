const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

/* GET ALL SCHOOLS */
router.get('/', schoolController.getAllSchools);

/* GET SCHOOL BY ID */
router.get('/:id', schoolController.getSchoolById);

/* CREATE SCHOOL */
router.post('/', schoolController.createSchool);

/* UPDATE SCHOOL */
router.put('/:id', schoolController.updateSchool);

/* DELETE SCHOOL */
router.delete('/:id', schoolController.deleteSchool);

module.exports = router;
