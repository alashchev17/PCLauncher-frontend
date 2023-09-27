import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { Main } from './main';
import * as path from 'path';


export class Window {
  static main: BrowserWindow | null = null;

  static DomLoad: boolean = false;

  static createWindow(): void {
    Window.main = new BrowserWindow({
      height: 800,
      width: 1100,
      frame: false,
      resizable: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    Window.main.loadFile('./frontend/index.html');

    //Window.main.webContents.openDevTools();

    Window.main.on('system-context-menu', (event, _point) => {
      event.preventDefault();
    });

    Window.main.webContents.on('dom-ready', () => {
      Window.DomLoad = true;
    })

    ipcMain.on('minimize', () => {
      if (Window.main) {
        Window.main.minimize();
      }
    });

    ipcMain.on('window-all-closed', () => {
      app.quit();
    });
    ipcMain.on('open-link', (e, link) => {
        shell.openExternal(`https://${link}`);
    });
    ipcMain.on('open_logs', () => {
        shell.openExternal(path.join(Main.appData, 'logs/main.log'))
    });
  }

  static create(): void {
    app.on('ready', Window.createWindow);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        Window.createWindow();
      }
    });
  }
}