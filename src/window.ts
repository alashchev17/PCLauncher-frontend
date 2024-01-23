import { app, BrowserWindow, ipcMain, ipcRenderer, shell } from 'electron'
import { Main } from './main'
import * as path from 'path'

export class Window {
  static main: BrowserWindow | null = null

  static DomLoad: boolean = false

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
    })

    Window.main.loadFile('./frontend/index.html')

    //Window.main.webContents.openDevTools();

    Window.main.on('system-context-menu', (event, _point) => {
      event.preventDefault()
    })

    Window.main.webContents.on('dom-ready', () => {
      Window.DomLoad = true
      Window.main.webContents.send('page_open', 'login')
    })

    ipcMain.on('minimize', () => {
      if (Window.main) {
        Window.main.minimize()
      }
    })

    let intervalReconnect: any
    ipcMain.on('reconnection', (e, data: number, action: string) => {
      if (action === 'stop') {
        Main.Log('RECONNECT', `Reconnected successfully! | action: ${action}`)
        data = 0
        clearInterval(intervalReconnect)
        Window.main.webContents.send('session_not_found')
        return
      } else {
        clearInterval(intervalReconnect)
        intervalReconnect = setInterval(() => {
          data++
          Main.Log('RECONNECT', `Reconnecting... ${data} | action: ${action}`)
          Window.main.webContents.send('reconnection', data, action)
        }, 2000)
      }
    })

    ipcMain.on('login-twofactor', () => {
      Window.main.webContents.send('login-twofactor')
    })

    ipcMain.on('window-all-closed', () => {
      app.quit()
    })

    ipcMain.on('open-link', (e, link) => {
      shell.openExternal(`https://${link}`)
    })
    ipcMain.on('open_logs', () => {
      shell.openExternal(path.join(Main.appData, 'logs/main.log'))
    })

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (Window.main.isMinimized()) Window.main.restore()
      Window.main.focus()
    })
  }

  static create(): void {
    app.on('ready', Window.createWindow)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        Window.createWindow()
      } else {
        Window.main.show()
      }
    })
  }
}
