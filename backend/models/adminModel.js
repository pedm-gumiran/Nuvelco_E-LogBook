const db = require("../config/db");

/* READ ALL */
exports.getAllAdmin = async () => {
  const [rows] = await db.execute(
    "SELECT id, first_name, last_name, username, pin_code FROM admin",
  );
  return rows;
};

/* READ ONE */
exports.getAdminById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM admin WHERE id = ?", [id]);
  return rows[0];
};

/* GET BY USERNAME */
exports.getAdminByUsername = async (username) => {
  const [rows] = await db.execute("SELECT * FROM admin WHERE username = ?", [
    username,
  ]);
  return rows[0];
};

/* CREATE */
exports.createAdmin = async (
  firstName,
  lastName,
  username,
  password,
  pinCode,
) => {
  const [result] = await db.execute(
    "INSERT INTO admin (first_name, last_name, username, password, pin_code) VALUES (?, ?, ?, ?, ?)",
    [firstName, lastName, username, password, pinCode],
  );
  return result.insertId;
};

/* UPDATE / EDIT */
exports.updateAdmin = async (id, firstName, lastName, username, pinCode) => {
  const [result] = await db.execute(
    "UPDATE admin SET first_name = ?, last_name = ?, username = ?, pin_code = ? WHERE id = ?",
    [firstName, lastName, username, pinCode, id],
  );
  return result.affectedRows;
};

/* UPDATE PASSWORD */
exports.updatePassword = async (id, password) => {
  const [result] = await db.execute(
    "UPDATE admin SET password = ? WHERE id = ?",
    [password, id],
  );
  return result.affectedRows;
};

/* UPDATE PASSWORD BY USERNAME */
exports.updatePasswordByUsername = async (username, password) => {
  const [result] = await db.execute(
    "UPDATE admin SET password = ? WHERE username = ?",
    [password, username],
  );
  return result.affectedRows;
};

/* DELETE */
exports.deleteAdmin = async (id) => {
  const [result] = await db.execute("DELETE FROM admin WHERE id = ?", [id]);
  return result.affectedRows;
};
