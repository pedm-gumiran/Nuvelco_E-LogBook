const db = require('../config/db');

/* READ ALL */
exports.getAllVisitorAttendance = async () => {
  const [rows] = await db.execute(
    'SELECT id, visitor_name, time_in, date, purpose, address FROM visitor_attendance ORDER BY date DESC, time_in DESC'
  );
  return rows;
};

/* READ ONE */
exports.getVisitorAttendanceById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM visitor_attendance WHERE id = ?',
    [id]
  );
  return rows[0];
};

/* GET BY VISITOR NAME */
exports.getAttendanceByVisitorName = async (visitorName) => {
  const [rows] = await db.execute(
    'SELECT * FROM visitor_attendance WHERE visitor_name = ? ORDER BY date DESC',
    [visitorName]
  );
  return rows;
};

/* GET BY DATE */
exports.getAttendanceByDate = async (date) => {
  const [rows] = await db.execute(
    'SELECT * FROM visitor_attendance WHERE DATE(date) = ?',
    [date]
  );
  return rows;
};

/* GET TODAY'S ATTENDANCE */
exports.getTodayAttendance = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM visitor_attendance WHERE DATE(date) = CURDATE()'
  );
  return rows;
};

/* RECORD ATTENDANCE (QR Code Scan) */
exports.recordAttendance = async (visitorId) => {
  try {
    // First, get visitor information
    const [visitorRows] = await db.execute(
      'SELECT id, first_name, last_name FROM visitor WHERE id = ?',
      [visitorId]
    );
    
    if (visitorRows.length === 0) {
      return { success: false, message: 'Visitor not found' };
    }
    
    const visitor = visitorRows[0];
    const visitorName = `${visitor.first_name} ${visitor.last_name}`;
    
    // Get local date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString('en-CA');
    
    // Check if visitor already has any attendance record for today
    const [existingRows] = await db.execute(
      'SELECT * FROM visitor_attendance WHERE visitor_name = ? AND DATE(date) = ?',
      [visitorName, today]
    );
    
    console.log('Visitor attendance check:', { visitorName, today, existingCount: existingRows.length, existingRows });
    
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    
    if (existingRows.length === 0) {
      // No attendance for today - create new record with time in, explicitly set time_out to NULL
      // Let database set date via DEFAULT CURRENT_TIMESTAMP
      const [result] = await db.execute(
        'INSERT INTO visitor_attendance (visitor_name, time_in, time_out) VALUES (?, ?, NULL)',
        [visitorName, currentTime]
      );
      
      return { 
        success: true, 
        message: 'Time in recorded successfully',
        data: { action: 'time_in', time: currentTime, id: result.insertId }
      };
    } else {
      const existing = existingRows[0];
      
      // Check if this is a valid record (time_in is not default '00:00:00')
      if (existing.time_in === '00:00:00') {
        // Invalid record - update time_in instead
        await db.execute(
          'UPDATE visitor_attendance SET time_in = ? WHERE id = ?',
          [currentTime, existing.id]
        );
        
        return { 
          success: true, 
          message: 'Time in recorded successfully',
          data: { action: 'time_in', time: currentTime, id: existing.id }
        };
      }
      
      // Check for time out - should be NULL for new records
      if (existing.time_out === null) {
        // Has time in but no time out - update time out
        await db.execute(
          'UPDATE visitor_attendance SET time_out = ? WHERE id = ?',
          [currentTime, existing.id]
        );
        
        return { 
          success: true, 
          message: 'Time out recorded successfully',
          data: { action: 'time_out', time: currentTime, id: existing.id }
        };
      } else {
        // Already has both time in and time out for today - reject additional scans
        return { 
          success: false, 
          message: 'Visitor already has complete attendance for today' 
        };
      }
    }
  } catch (error) {
    console.error('Error recording visitor attendance:', error);
    return { success: false, message: 'Failed to record attendance' };
  }
};

/* CREATE */
exports.createVisitorAttendance = async (visitorName, timeIn, timeOut, purpose, address) => {
  const [result] = await db.execute(
    'INSERT INTO visitor_attendance (visitor_name, time_in, purpose, address) VALUES (?, ?, ?, ?)',
    [visitorName, timeIn, purpose || null, address || null],
  );
  return result.insertId;
};

/* UPDATE TIME IN */
exports.updateTimeIn = async (id, timeIn) => {
  const [result] = await db.execute(
    'UPDATE visitor_attendance SET time_in = ? WHERE id = ?',
    [timeIn, id],
  );
  return result.affectedRows;
};

/* UPDATE TIME OUT */
exports.updateTimeOut = async (id, timeOut) => {
  const [result] = await db.execute(
    'UPDATE visitor_attendance SET time_out = ? WHERE id = ?',
    [timeOut, id],
  );
  return result.affectedRows;
};

/* UPDATE VISITOR NAME */
exports.updateVisitorName = async (id, visitorName) => {
  const [result] = await db.execute(
    'UPDATE visitor_attendance SET visitor_name = ? WHERE id = ?',
    [visitorName, id],
  );
  return result.affectedRows;
};

/* DELETE */
exports.deleteVisitorAttendance = async (id) => {
  const [result] = await db.execute('DELETE FROM visitor_attendance WHERE id = ?', [id]);
  return result.affectedRows;
};

/* GET TODAY'S ATTENDANCE COUNT */
exports.getTodayCount = async () => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) as count FROM visitor_attendance WHERE DATE(date) = CURDATE()'
  );
  return rows[0].count;
};
