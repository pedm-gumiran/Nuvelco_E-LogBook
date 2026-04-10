const User = require('../models/adminModel');

exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.getAllAdmin();
    res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch admin' });
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
      count: admins ? admins.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to check admin existence' });
  }
};

/* DEBUG: GET ALL ADMINS */
exports.getAllAdminsDebug = async (req, res) => {
  try {
    const admins = await User.getAllAdmin();
    res.status(200).json({ 
      success: true, 
      data: admins,
      count: admins ? admins.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
};

/* LOGIN ADMIN */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
    }
    
    // Find admin by email
    const admin = await User.getAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid credentials'
      });
    }
    
    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      data: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/* REGISTER ADMIN */
exports.registerAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, password, pin_code } = req.body;
    
    if (!first_name || !last_name || !email || !password || !pin_code) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if admin already exists
    const existingAdmin = await User.getAdminByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'Admin with this email already exists' });
    }
    
    // Create admin account
    const adminId = await User.createAdmin(first_name, last_name, email, password, pin_code);
    
    res.status(201).json({ 
      success: true, 
      message: 'Admin registered successfully', 
      data: { id: adminId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to register admin' });
  }
};

/* DELETE ADMIN (for rollback) */
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Admin ID is required' });
    }
    
    const affectedRows = await User.deleteAdmin(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
};

/* VERIFY IDENTITY FOR PASSWORD RESET */
exports.verifyIdentity = async (req, res) => {
  try {
    const { email, pin_code } = req.body;
    
    if (!email || !pin_code) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Find admin by email
    const admin = await User.getAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (admin.pin_code !== parseInt(pin_code)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Identity verified successfully',
      data: { email: admin.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const affectedRows = await User.updatePasswordByEmail(email, newPassword);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};
