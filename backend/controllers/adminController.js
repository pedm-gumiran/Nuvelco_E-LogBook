const User = require("../models/adminModel");
const bcrypt = require("bcryptjs");

exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.getAllAdmin();
    res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin" });
  }
};

/* CHECK IF ADMIN EXISTS */
exports.checkAdminExists = async (req, res) => {
  try {
    const admins = await User.getAllAdmin();
    const exists = admins && admins.length > 0;
    res.status(200).json({
      success: true,
      exists: exists,
      count: admins ? admins.length : 0,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to check admin existence" });
  }
};

/* DEBUG: GET ALL ADMINS */
exports.getAllAdminsDebug = async (req, res) => {
  try {
    const admins = await User.getAllAdmin();
    res.status(200).json({
      success: true,
      data: admins,
      count: admins ? admins.length : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch admins" });
  }
};

/* LOGIN ADMIN */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find admin by username
    const admin = await User.getAdminByUsername(username);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

/* REGISTER ADMIN */
exports.registerAdmin = async (req, res) => {
  try {
    const { first_name, last_name, username, password, pin_code } = req.body;

    if (!first_name || !last_name || !username || !password || !pin_code) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if admin already exists by username
    const existingAdminByUsername = await User.getAdminByUsername(username);
    if (existingAdminByUsername) {
      return res.status(409).json({
        success: false,
        message: "Admin with this username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin account
    const adminId = await User.createAdmin(
      first_name,
      last_name,
      username,
      hashedPassword,
      pin_code,
    );

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: { id: adminId },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to register admin" });
  }
};

/* DELETE ADMIN (for rollback) */
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Admin ID is required" });
    }

    const affectedRows = await User.deleteAdmin(id);

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete admin" });
  }
};

/* VERIFY IDENTITY FOR PASSWORD RESET */
exports.verifyIdentity = async (req, res) => {
  try {
    const { username, pin_code } = req.body;

    if (!username || !pin_code) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Find admin by username
    const admin = await User.getAdminByUsername(username);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (admin.pin_code !== parseInt(pin_code)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Identity verified successfully",
      data: { username: admin.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const affectedRows = await User.updatePasswordByUsername(
      username,
      hashedPassword,
    );

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update password" });
  }
};

/* GET ADMIN PROFILE */
exports.getAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.getAdminById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

/* UPDATE ADMIN PROFILE */
exports.updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, username, password, pin_code } = req.body;

    // Check required fields (password and pin_code are now optional for the update)
    if (!first_name || !last_name || !username) {
      return res.status(400).json({ success: false, message: "First name, last name, and username are required" });
    }

    // Fetch the current admin to get existing data if none is provided
    const currentAdmin = await User.getAdminById(id);
    if (!currentAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Use new values if provided, otherwise keep existing
    let finalPassword = currentAdmin.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(password, salt);
    }
    const finalPinCode = pin_code || currentAdmin.pin_code;

    await User.updateAdmin(
      id,
      first_name,
      last_name,
      username,
      finalPassword,
      finalPinCode
    );

    res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
