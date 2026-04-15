const db = require("../config/db");

/* READ ALL */
exports.getAllInternAttendance = async () => {
  const [rows] = await db.execute(
    "SELECT id, intern_name, school_name, course_name, am_in, am_in_image, am_out, am_out_image, pm_in, pm_in_image, pm_out, pm_out_image, date FROM intern_attendance ORDER BY date DESC, am_in DESC",
  );
  return rows;
};

/* READ ONE */
exports.getInternAttendanceById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM intern_attendance WHERE id = ?",
    [id],
  );
  return rows[0];
};

/* GET BY INTERN NAME */
exports.getAttendanceByInternName = async (internName) => {
  const [rows] = await db.execute(
    "SELECT * FROM intern_attendance WHERE intern_name = ? ORDER BY date DESC",
    [internName],
  );
  return rows;
};

/* GET BY DATE */
exports.getAttendanceByDate = async (date) => {
  const [rows] = await db.execute(
    "SELECT * FROM intern_attendance WHERE DATE(date) = ?",
    [date],
  );
  return rows;
};

/* GET TODAY'S ATTENDANCE */
exports.getTodayAttendance = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM intern_attendance WHERE DATE(date) = CURDATE()",
  );
  return rows;
};

/* RECORD ATTENDANCE (QR Code Scan) - AM/PM Time In/Out with Photo */
exports.recordAttendance = async (internId, photo) => {
  try {
    // First, get intern information including school_id and course_id
    const [internRows] = await db.execute(
      "SELECT id, first_name, last_name, school_id, course_id FROM intern WHERE id = ?",
      [internId],
    );

    if (internRows.length === 0) {
      return { success: false, message: "Intern not found" };
    }

    const intern = internRows[0];
    const internName = `${intern.first_name} ${intern.last_name}`;

    // Lookup school name from school table using school_id
    let schoolName = "";
    if (intern.school_id) {
      const [schoolRows] = await db.execute(
        "SELECT school_name FROM school WHERE id = ?",
        [intern.school_id],
      );
      if (schoolRows.length > 0) {
        schoolName = schoolRows[0].school_name;
      }
    }

    // Lookup course name from course table using course_id
    let courseName = "";
    if (intern.course_id) {
      const [courseRows] = await db.execute(
        "SELECT course_name FROM course WHERE id = ?",
        [intern.course_id],
      );
      if (courseRows.length > 0) {
        courseName = courseRows[0].course_name;
      }
    }

    // Get local date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString("en-CA");
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    // Check if intern already has attendance record for today
    const [existingRows] = await db.execute(
      "SELECT * FROM intern_attendance WHERE intern_name = ? AND DATE(date) = ?",
      [internName, today],
    );

    if (existingRows.length === 0) {
      // No attendance for today - create new record with AM time in, photo, course and school
      // Explicitly set date to avoid timezone issues with database server
      const [result] = await db.execute(
        "INSERT INTO intern_attendance (intern_name, course_name, school_name, am_in, am_in_image, am_out, pm_in, pm_out, date) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?)",
        [internName, courseName, schoolName, currentTime, photo, today],
      );

      return {
        success: true,
        message: "AM time in recorded successfully",
        data: { action: "am_in", time: currentTime, id: result.insertId },
      };
    } else {
      const existing = existingRows[0];

      // Check if this is a valid record (am_in is not default '00:00:00')
      if (existing.am_in === null || existing.am_in === "00:00:00") {
        // Set AM time in with photo, course and school
        await db.execute(
          "UPDATE intern_attendance SET am_in = ?, am_in_image = ?, course_name = ?, school_name = ? WHERE id = ?",
          [currentTime, photo, courseName, schoolName, existing.id],
        );
        return {
          success: true,
          message: "AM time in recorded successfully",
          data: { action: "am_in", time: currentTime, id: existing.id },
        };
      } else if (existing.am_out === null || existing.am_out === "00:00:00") {
        // Has AM time in but no AM time out - update AM time out with photo
        await db.execute(
          "UPDATE intern_attendance SET am_out = ?, am_out_image = ? WHERE id = ?",
          [currentTime, photo, existing.id],
        );
        return {
          success: true,
          message: "AM time out recorded successfully",
          data: { action: "am_out", time: currentTime, id: existing.id },
        };
      } else if (existing.pm_in === null || existing.pm_in === "00:00:00") {
        // Has AM complete but no PM time in - update PM time in with photo
        await db.execute(
          "UPDATE intern_attendance SET pm_in = ?, pm_in_image = ? WHERE id = ?",
          [currentTime, photo, existing.id],
        );
        return {
          success: true,
          message: "PM time in recorded successfully",
          data: { action: "pm_in", time: currentTime, id: existing.id },
        };
      } else if (existing.pm_out === null || existing.pm_out === "00:00:00") {
        // Has PM time in but no PM time out - update PM time out with photo
        await db.execute(
          "UPDATE intern_attendance SET pm_out = ?, pm_out_image = ? WHERE id = ?",
          [currentTime, photo, existing.id],
        );
        return {
          success: true,
          message: "PM time out recorded successfully",
          data: { action: "pm_out", time: currentTime, id: existing.id },
        };
      } else {
        // Already has complete attendance for today (AM and PM)
        return {
          success: false,
          message: "Intern already has complete attendance for today",
        };
      }
    }
  } catch (error) {
    console.error("Error recording intern attendance:", error);
    return { success: false, message: "Failed to record attendance" };
  }
};

/* CREATE */
exports.createInternAttendance = async (
  internName,
  amIn,
  amOut,
  pmIn,
  pmOut,
) => {
  const [result] = await db.execute(
    "INSERT INTO intern_attendance (intern_name, am_in, am_out, pm_in, pm_out) VALUES (?, ?, ?, ?, ?)",
    [internName, amIn, amOut, pmIn, pmOut],
  );
  return result.insertId;
};

/* UPDATE AM IN */
exports.updateAmIn = async (id, amIn) => {
  const [result] = await db.execute(
    "UPDATE intern_attendance SET am_in = ? WHERE id = ?",
    [amIn, id],
  );
  return result.affectedRows;
};

/* UPDATE AM OUT */
exports.updateAmOut = async (id, amOut) => {
  const [result] = await db.execute(
    "UPDATE intern_attendance SET am_out = ? WHERE id = ?",
    [amOut, id],
  );
  return result.affectedRows;
};

/* UPDATE PM IN */
exports.updatePmIn = async (id, pmIn) => {
  const [result] = await db.execute(
    "UPDATE intern_attendance SET pm_in = ? WHERE id = ?",
    [pmIn, id],
  );
  return result.affectedRows;
};

/* UPDATE PM OUT */
exports.updatePmOut = async (id, pmOut) => {
  const [result] = await db.execute(
    "UPDATE intern_attendance SET pm_out = ? WHERE id = ?",
    [pmOut, id],
  );
  return result.affectedRows;
};

/* UPDATE INTERN NAME */
exports.updateInternName = async (id, internName) => {
  const [result] = await db.execute(
    "UPDATE intern_attendance SET intern_name = ? WHERE id = ?",
    [internName, id],
  );
  return result.affectedRows;
};

/* DELETE */
exports.deleteInternAttendance = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM intern_attendance WHERE id = ?",
    [id],
  );
  return result.affectedRows;
};

/* DELETE BY COURSE */
exports.deleteInternAttendanceByCourse = async (courseName) => {
  const [result] = await db.execute(
    "DELETE FROM intern_attendance WHERE course_name = ?",
    [courseName],
  );
  return result.affectedRows;
};

/* DELETE BY INTERN NAME */
exports.deleteInternAttendanceByInternName = async (internName) => {
  const [result] = await db.execute(
    "DELETE FROM intern_attendance WHERE intern_name = ?",
    [internName],
  );
  return result.affectedRows;
};

/* GET TODAY'S ATTENDANCE COUNT */
exports.getTodayCount = async () => {
  const [rows] = await db.execute(
    "SELECT COUNT(*) as count FROM intern_attendance WHERE DATE(date) = CURDATE()",
  );
  return rows[0].count;
};
