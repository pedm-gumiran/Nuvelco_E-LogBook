const express = require('express');
const router = express.Router();
const internAttendanceController = require('../controllers/internAttendanceController');

/* GET ALL INTERN ATTENDANCE */
router.get('/', internAttendanceController.getAllInternAttendance);

/* GET TODAY'S ATTENDANCE COUNT - Must be before /:id */
router.get('/today-count', internAttendanceController.getTodayCount);

/* GET TODAY'S ATTENDANCE */
router.get('/today/all', internAttendanceController.getTodayAttendance);

/* GET ATTENDANCE BY DATE */
router.get('/date/:date', internAttendanceController.getAttendanceByDate);

/* GET ATTENDANCE BY INTERN NAME */
router.get('/intern/:internName', internAttendanceController.getAttendanceByInternName);

/* GET ATTENDANCE BY ID */
router.get('/:id', internAttendanceController.getInternAttendanceById);

/* RECORD INTERN ATTENDANCE (QR Code Scan) */
router.post('/record', internAttendanceController.recordInternAttendance);

/* CREATE INTERN ATTENDANCE */
router.post('/', internAttendanceController.createInternAttendance);

/* UPDATE AM IN */
router.put('/:id/am-in', internAttendanceController.updateAmIn);

/* UPDATE AM OUT */
router.put('/:id/am-out', internAttendanceController.updateAmOut);

/* UPDATE PM IN */
router.put('/:id/pm-in', internAttendanceController.updatePmIn);

/* UPDATE PM OUT */
router.put('/:id/pm-out', internAttendanceController.updatePmOut);

/* UPDATE INTERN NAME */
router.put('/:id/intern-name', internAttendanceController.updateInternName);

/* DELETE INTERN ATTENDANCE */
router.delete('/:id', internAttendanceController.deleteInternAttendance);

/* DELETE INTERN ATTENDANCE BY COURSE */
router.delete('/course/:courseName', internAttendanceController.deleteInternAttendanceByCourse);

/* DELETE INTERN ATTENDANCE BY INTERN NAME */
router.delete('/intern/:internName', internAttendanceController.deleteInternAttendanceByInternName);

module.exports = router;
