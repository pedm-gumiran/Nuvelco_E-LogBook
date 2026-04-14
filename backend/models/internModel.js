const db = require('../config/db');

/* READ ALL */
exports.getAllInterns = async () => {
  const [rows] = await db.execute('SELECT id, first_name, middle_initial, last_name, suffix, school_id, course_id, created_at, updated_at FROM intern');
  return rows;
};

/* READ ONE */
exports.getInternById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM intern WHERE id = ?', [id]);
  return rows[0];
};

/* CHECK DUPLICATE BY NAME */
exports.checkDuplicateByName = async (firstName, lastName) => {
  const [rows] = await db.execute(
    'SELECT id FROM intern WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)',
    [firstName, lastName]
  );
  return rows.length > 0;
};

/* CHECK DUPLICATE BY NAME EXCLUDING ID */
exports.checkDuplicateByNameExcludingId = async (firstName, lastName, excludeId) => {
  const [rows] = await db.execute(
    'SELECT id FROM intern WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) AND id != ?',
    [firstName, lastName, excludeId]
  );
  return rows.length > 0;
};

/* CREATE */
exports.createIntern = async (id, firstName, middleInitial, lastName, suffix, schoolId, courseId) => {
  const [result] = await db.execute(
    'INSERT INTO intern (id, first_name, middle_initial, last_name, suffix, school_id, course_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)',
    [id, firstName, middleInitial, lastName, suffix, schoolId, courseId],
  );
  return result.affectedRows;
};

/* UPDATE / EDIT */
exports.updateIntern = async (id, firstName, middleInitial, lastName, suffix, schoolId, courseId) => {
  const [result] = await db.execute(
    'UPDATE intern SET first_name = ?, middle_initial = ?, last_name = ?, suffix = ?, school_id = ?, course_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [firstName, middleInitial, lastName, suffix, schoolId, courseId, id],
  );
  return result.affectedRows;
};

/* DELETE */
exports.deleteIntern = async (id) => {
  const [result] = await db.execute('DELETE FROM intern WHERE id = ?', [id]);
  return result.affectedRows;
};
