const db = require('../config/db');

/* READ ALL */
exports.getAllAdmin = async () => {
  const [rows] = await db.execute('SELECT id, first_name, last_name, email, pin_code FROM admin');
  return rows;
};

/* READ ONE */
exports.getAdminById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM admin WHERE id = ?', [id]);
  return rows[0];
};

/* GET BY EMAIL */
exports.getAdminByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM admin WHERE email = ?', [email]);
  return rows[0];
};

/* CREATE */
exports.createAdmin = async (firstName, lastName, email, password, pinCode) => {
  const [result] = await db.execute(
    'INSERT INTO admin (first_name, last_name, email, password, pin_code) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, email, password, pinCode],
  );
  return result.insertId;
};

/* UPDATE / EDIT */
exports.updateAdmin = async (id, firstName, lastName, email, pinCode) => {
  const [result] = await db.execute(
    'UPDATE admin SET first_name = ?, last_name = ?, email = ?, pin_code = ? WHERE id = ?',
    [firstName, lastName, email, pinCode, id],
  );
  return result.affectedRows;
};

/* UPDATE PASSWORD */
exports.updatePassword = async (id, password) => {
  const [result] = await db.execute(
    'UPDATE admin SET password = ? WHERE id = ?',
    [password, id],
  );
  return result.affectedRows;
};

/* UPDATE PASSWORD BY EMAIL */
exports.updatePasswordByEmail = async (email, password) => {
  const [result] = await db.execute(
    'UPDATE admin SET password = ? WHERE email = ?',
    [password, email],
  );
  return result.affectedRows;
};

/* DELETE */
exports.deleteAdmin = async (id) => {
  const [result] = await db.execute('DELETE FROM admin WHERE id = ?', [id]);
  return result.affectedRows;
};
