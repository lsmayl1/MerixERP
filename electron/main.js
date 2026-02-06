const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
let backendProcess;
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../frontend/public/icon.png"),
    partition: "persist:main",
  });

  // React build dosyalarını yükle
  win.loadFile(path.join(__dirname, "../build/index.html"));
  win.maximize();

  // Geliştirme sırasında React server’a bağlanabilirsin:
  // win.loadURL("http://localhost:3000");
}

// function startBackend() {
//   // backend.js senin Node server dosyan (ör: Express)
//   const backendPath = path.join(__dirname, "../backend/index.js");

//   backendProcess = spawn("node", [backendPath], {
//     cwd: path.join(__dirname, "../backend"),
//     stdio: "pipe",
//   });

//   backendProcess.on("close", (code) => {
//     console.log(`Backend process exited with code ${code}`);
//   });
// }

app.whenReady().then(() => {
  // startBackend(); // önce backend’i başlat
  // setTimeout(createWindow, 2000); // biraz beklet, sonra window’u aç
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (backendProcess) backendProcess.kill();
});
