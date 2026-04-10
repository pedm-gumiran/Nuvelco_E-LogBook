const InternAttendance = require('../models/internAttendanceModel');

/* GET ALL INTERN ATTENDANCE */
exports.getAllInternAttendance = async (req, res) => {
  try {
    const attendance = await InternAttendance.getAllInternAttendance();
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch intern attendance' });
  }
};

/* GET SINGLE ATTENDANCE RECORD */
exports.getInternAttendanceById = async (req, res) => {
  try {
    const attendance = await InternAttendance.getInternAttendanceById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance record' });
  }
};

/* GET ATTENDANCE BY INTERN NAME */
exports.getAttendanceByInternName = async (req, res) => {
  try {
    const attendance = await InternAttendance.getAttendanceByInternName(req.params.internName);
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* GET ATTENDANCE BY DATE */
exports.getAttendanceByDate = async (req, res) => {
  try {
    const attendance = await InternAttendance.getAttendanceByDate(req.params.date);
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* GET TODAY'S ATTENDANCE */
exports.getTodayAttendance = async (req, res) => {
  try {
    const attendance = await InternAttendance.getTodayAttendance();
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

/* RECORD INTERN ATTENDANCE (QR Code Scan) */
exports.recordInternAttendance = async (req, res) => {
  try {
    const { intern_id, photo } = req.body;
    
    if (!intern_id) {
      return res.status(400).json({ success: false, message: 'Intern ID is required' });
    }
    
    // Record attendance using intern ID with photo (handles AM/PM time in/out logic automatically)
    const result = await InternAttendance.recordAttendance(intern_id, photo);
    
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

/* CREATE INTERN ATTENDANCE */
exports.createInternAttendance = async (req, res) => {
  try {
    const { internName, amIn, amOut, pmIn, pmOut } = req.body;
    
    if (!internName || !amIn) {
      return res.status(400).json({ success: false, message: 'Intern name and AM in are required' });
    }
    
    const id = await InternAttendance.createInternAttendance(internName, amIn, amOut, pmIn, pmOut);
    res.status(201).json({ success: true, message: 'Attendance created successfully', data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create attendance' });
  }
};

/* UPDATE AM IN */
exports.updateAmIn = async (req, res) => {
  try {
    const { amIn } = req.body;
    const affectedRows = await InternAttendance.updateAmIn(req.params.id, amIn);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'AM in updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update AM in' });
  }
};

/* UPDATE AM OUT */
exports.updateAmOut = async (req, res) => {
  try {
    const { amOut } = req.body;
    const affectedRows = await InternAttendance.updateAmOut(req.params.id, amOut);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'AM out updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update AM out' });
  }
};

/* UPDATE PM IN */
exports.updatePmIn = async (req, res) => {
  try {
    const { pmIn } = req.body;
    const affectedRows = await InternAttendance.updatePmIn(req.params.id, pmIn);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'PM in updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update PM in' });
  }
};

/* UPDATE PM OUT */
exports.updatePmOut = async (req, res) => {
  try {
    const { pmOut } = req.body;
    const affectedRows = await InternAttendance.updatePmOut(req.params.id, pmOut);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'PM out updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update PM out' });
  }
};

/* UPDATE INTERN NAME */
exports.updateInternName = async (req, res) => {
  try {
    const { internName } = req.body;
    const affectedRows = await InternAttendance.updateInternName(req.params.id, internName);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Intern name updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update intern name' });
  }
};

/* DELETE INTERN ATTENDANCE */
exports.deleteInternAttendance = async (req, res) => {
  try {
    const affectedRows = await InternAttendance.deleteInternAttendance(req.params.id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete attendance record' });
  }
};

/* DELETE INTERN ATTENDANCE BY COURSE */
exports.deleteInternAttendanceByCourse = async (req, res) => {
  try {
    const affectedRows = await InternAttendance.deleteInternAttendanceByCourse(req.params.courseName);
    
    res.status(200).json({ 
      success: true, 
      message: `Attendance records deleted successfully`,
      affectedRows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete attendance records' });
  }
};

/* DELETE INTERN ATTENDANCE BY INTERN NAME */
exports.deleteInternAttendanceByInternName = async (req, res) => {
  try {
    const affectedRows = await InternAttendance.deleteInternAttendanceByInternName(req.params.internName);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Attendance records not found for this intern' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Attendance records deleted successfully',
      affectedRows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete attendance records' });
  }
};

/* GET TODAY'S ATTENDANCE COUNT */
exports.getTodayCount = async (req, res) => {
  try {
    const count = await InternAttendance.getTodayCount();
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch today\'s attendance count' });
  }
};
