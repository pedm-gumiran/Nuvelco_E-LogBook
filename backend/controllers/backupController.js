const pool = require('../config/db');

// Tables to backup/restore
const TABLES = [
  'admin',
  'intern',
  'intern_attendance',
  'visitor',
  'visitor_attendance'
];

// Helper to convert ISO date strings to MySQL format
const formatValueForMySQL = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Check if it's an ISO date string (e.g., "2026-04-05T16:00:00.000Z")
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    // Return YYYY-MM-DD format for date columns
    return date.toISOString().split('T')[0];
  }
  
  return value;
};

const backupController = {
  // Create backup of all tables
  createBackup: async (req, res) => {
    try {
      const backup = {};
      
      for (const table of TABLES) {
        const [rows] = await pool.query(`SELECT * FROM ${table}`);
        backup[table] = rows;
      }
      
      // Add metadata
      backup._metadata = {
        createdAt: new Date().toISOString(),
        database: process.env.DB_NAME,
        tables: TABLES
      };
      
      res.status(200).json({
        success: true,
        message: 'Backup created successfully',
        backup
      });
    } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create backup',
        error: error.message
      });
    }
  },

  // Restore data from backup
  restoreBackup: async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      // Parse the backup file
      let backupData;
      
      if (req.file) {
        // File uploaded via multipart/form-data
        const fileContent = req.file.buffer.toString('utf8');
        backupData = JSON.parse(fileContent);
      } else if (req.body.backup) {
        // JSON data sent in request body
        backupData = typeof req.body.backup === 'string' 
          ? JSON.parse(req.body.backup) 
          : req.body.backup;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No backup data provided'
        });
      }

      // Start transaction
      await connection.beginTransaction();
      
      // Restore each table
      for (const table of TABLES) {
        if (backupData[table] && Array.isArray(backupData[table])) {
          // Clear existing data
          await connection.query(`DELETE FROM ${table}`);
          
          // Reset auto-increment if table is empty
          await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
          
          // Insert backup data
          if (backupData[table].length > 0) {
            const rows = backupData[table];
            const columns = Object.keys(rows[0]);
            
            for (const row of rows) {
              const values = columns.map(col => formatValueForMySQL(row[col]));
              const placeholders = columns.map(() => '?').join(', ');
              
              await connection.query(
                `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
                values
              );
            }
          }
        }
      }
      
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: 'System data restored successfully',
        restoredTables: TABLES.filter(t => backupData[t] !== undefined)
      });
    } catch (error) {
      await connection.rollback();
      console.error('Restore error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore backup',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
};

module.exports = backupController;
