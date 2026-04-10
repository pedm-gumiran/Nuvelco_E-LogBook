const VisitorAttendance = require('../models/visitorAttendanceModel');

/* GET ALL VISITOR ATTENDANCE */
exports.getAllVisitorAttendance = async (req, res) => {
  try {
    const attendance = await VisitorAttendance.getAllVisitorAttendance();
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch visitor attendance' });
  }
};

/* GET SINGLE ATTENDANCE RECORD */
exports.getVisitorAttendanceById = async (req, res) => {
  try {
    const attendance = await VisitorAttendance.getVisitorAttendanceById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance record' });
  }
};

/* GET ATTENDANCE BY VISITOR NAME */
exports.getAttendanceByVisitorName = async (req, res) => {
  try {
    const attendance = await VisitorAttendance.getAttendanceByVisitorName(req.params.visitorName);
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* GET ATTENDANCE BY DATE */
exports.getAttendanceByDate = async (req, res) => {
  try {
    const attendance = await VisitorAttendance.getAttendanceByDate(req.params.date);
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* GET TODAY'S ATTENDANCE */
exports.getTodayAttendance = async (req, res) => {
  try {
    const attendance = await VisitorAttendance.getTodayAttendance();
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* RECORD VISITOR ATTENDANCE (QR Code Scan) */
exports.recordVisitorAttendance = async (req, res) => {
  try {
    const { visitor_id } = req.body;
    
    if (!visitor_id) {
      return res.status(400).json({ success: false, message: 'Visitor ID is required' });
    }
    
    // Record attendance using visitor ID (handles time in/out logic automatically)
    const result = await VisitorAttendance.recordAttendance(visitor_id);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ 
      success: true, 
      message: result.message,
      data: result.data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
};

/* CREATE VISITOR ATTENDANCE */
exports.createVisitorAttendance = async (req, res) => {
  try {
    const { visitor_name, time_in, purpose, address } = req.body;
    
    if (!visitor_name || !time_in) {
      return res.status(400).json({ success: false, message: 'Visitor name and time in are required' });
    }
    
    const id = await VisitorAttendance.createVisitorAttendance(visitor_name, time_in, null, purpose, address);
    res.status(201).json({ success: true, message: 'Attendance created successfully', data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create attendance' });
  }
};

/* UPDATE TIME IN */
exports.updateTimeIn = async (req, res) => {
  try {
    const { timeIn } = req.body;
    const affectedRows = await VisitorAttendance.updateTimeIn(req.params.id, timeIn);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Time in updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update time in' });
  }
};

/* UPDATE TIME OUT */
exports.updateTimeOut = async (req, res) => {
  try {
    const { timeOut } = req.body;
    const affectedRows = await VisitorAttendance.updateTimeOut(req.params.id, timeOut);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Time out updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update time out' });
  }
};

/* UPDATE VISITOR NAME */
exports.updateVisitorName = async (req, res) => {
  try {
    const { visitorName } = req.body;
    const affectedRows = await VisitorAttendance.updateVisitorName(req.params.id, visitorName);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Visitor name updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update visitor name' });
  }
};

/* DELETE VISITOR ATTENDANCE */
exports.deleteVisitorAttendance = async (req, res) => {
  try {
    const affectedRows = await VisitorAttendance.deleteVisitorAttendance(req.params.id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete attendance record' });
  }
};

/* GET TODAY'S ATTENDANCE COUNT */
exports.getTodayCount = async (req, res) => {
  try {
    const count = await VisitorAttendance.getTodayCount();
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch today\'s attendance count' });
  }
};
