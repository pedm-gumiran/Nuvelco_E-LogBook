const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

/* GET ALL COURSES */
router.get('/', courseController.getAllCourses);

/* GET COURSE BY ID */
router.get('/:id', courseController.getCourseById);

/* CREATE COURSE */
router.post('/', courseController.createCourse);

/* UPDATE COURSE */
router.put('/:id', courseController.updateCourse);

/* DELETE COURSE */
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
