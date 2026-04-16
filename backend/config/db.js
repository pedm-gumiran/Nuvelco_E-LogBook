const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

// Load .env file explicitly for Electron environment
const isElectron = process.versions && process.versions.electron;

if (isElectron) {
  console.log("🔧 Running in Electron environment");

  // Try to find and load .env file
  const envPaths = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(process.resourcesPath, "app", ".env"),
    path.join(process.resourcesPath, "backend", ".env"),
  ];

  let envLoaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log("📄 Found .env file at:", envPath);
      require("dotenv").config({ path: envPath });
      envLoaded = true;
      break;
    }
  }

  if (!envLoaded) {
    console.log("⚠️  No .env file found, using fallback values");
  }
} else {
  console.log("🌐 Running in development environment");
  require("dotenv").config();
}

// Database configuration with fallbacks
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "nuvelco_elogbook",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log("Database configuration:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  hasPassword: !!dbConfig.password,
  isElectron: isElectron,
});

const pool = mysql.createPool(dbConfig);

module.exports = pool;

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      fatal: err.fatal,
    });
  }
})();
