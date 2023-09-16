import { app, BrowserWindow, ipcMain } from 'electron';

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1100,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('./frontend/index.html');

  mainWindow.webContents.openDevTools();

  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-all-closed', () => {
    app.quit();
  });

};

app.on('ready', createWindow);


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});