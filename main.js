const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// 1. Start your Backend automatically
// Point this to your main backend file (e.g., server.js or app.js)
const server = require("./backend/server.js");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(
      __dirname,
      "frontend",
      "public",
      "system_logo_electron.png",
    ),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 2. Load the React Frontend through the Express server
  // This ensures all assets are served correctly
  win.loadURL("http://localhost:5000");
}

app.whenReady().then(createWindow);
// Remove the default menu bar
Menu.setApplicationMenu(null);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
