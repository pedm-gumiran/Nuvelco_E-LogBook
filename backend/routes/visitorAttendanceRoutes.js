const express = require('express');
const router = express.Router();
const visitorAttendanceController = require('../controllers/visitorAttendanceController');

/* GET ALL VISITOR ATTENDANCE */
router.get('/', visitorAttendanceController.getAllVisitorAttendance);

/* GET TODAY'S ATTENDANCE COUNT - Must be before /:id */
router.get('/today-count', visitorAttendanceController.getTodayCount);

/* GET TODAY'S ATTENDANCE */
router.get('/today/all', visitorAttendanceController.getTodayAttendance);

/* GET ATTENDANCE BY DATE */
router.get('/date/:date', visitorAttendanceController.getAttendanceByDate);

/* GET ATTENDANCE BY VISITOR NAME */
router.get('/visitor/:visitorName', visitorAttendanceController.getAttendanceByVisitorName);

/* GET ATTENDANCE BY ID */
router.get('/:id', visitorAttendanceController.getVisitorAttendanceById);

/* RECORD VISITOR ATTENDANCE (QR Code Scan) */
router.post('/record', visitorAttendanceController.recordVisitorAttendance);

/* CREATE VISITOR ATTENDANCE */
router.post('/', visitorAttendanceController.createVisitorAttendance);

/* UPDATE TIME IN */
router.put('/:id/time-in', visitorAttendanceController.updateTimeIn);

/* UPDATE TIME OUT */
router.put('/:id/time-out', visitorAttendanceController.updateTimeOut);

/* UPDATE VISITOR NAME */
router.put('/:id/visitor-name', visitorAttendanceController.updateVisitorName);

/* DELETE VISITOR ATTENDANCE */
router.delete('/:id', visitorAttendanceController.deleteVisitorAttendance);

module.exports = router;
