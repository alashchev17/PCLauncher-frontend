import { app } from 'electron'
import { AuthorizationRequest } from './websocket'
import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'
import { Window } from './window'
import { SettingsManager } from './settings'
import * as path from 'path'
import fetch, { Response } from 'node-fetch'

interface Online {
  response?: {
    last_update: number
    players: number
    max_players: number
  }
}

export class Main {
  public startTime = performance.now()
  static isProduction: boolean = false

  static appData = path.join(app.getPath('appData'), app.getName())

  static Logger = require('electron-log')
  static crypto = require('crypto')

  static Config = new SettingsManager()
  // static WS = new WebSocketConnection();
  // static Session = new SessionManager();
  static InitializedStatus: boolean
  private updateChecked: boolean
  private IPCMethods = {
    // login: (e: any, login: string, password: string, twofactor: number) => {
    //     Main.Session.authorize(login, password, twofactor);
    // },
    logout: (e: any) => {
      // Main.Session.logout();
      Window.main.webContents.send('logout')
    },
    saveSettings: (e: any, data: any) => {
      Main.Config.updateSettings(data)
    },
    loginTestSuccess: (e: any) => {
      Window.main.webContents.send('login-success', {
        user_id: 1,
        user_login: 'alashchev17',
        characters: [
          {
            id: 1,
            name: 'Mattew_Ball',
            skin: 0,
            status: 'Отклонен',
            game: false,
          },
          {
            id: 2,
            name: 'Jessica_Thompson',
            skin: 0,
            status: 'Заблокирован до 31.12.2025',
            game: false,
          },
          {
            id: 3,
            name: 'Stephan_Bykowsky',
            skin: 0,
            status: 'На одобрении',
            game: false,
          },
          {
            id: 4,
            name: 'Melissa_Hogwarts',
            skin: 0,
            status: 'Одобрен',
            game: true,
          },
          {
            id: 5,
            name: 'Simon_Redwood',
            skin: 0,
            status: 'Одобрен',
            game: true,
          },
          {
            id: 6,
            name: 'Molly_Stuart',
            skin: 0,
            status: 'Одобрен',
            game: true,
          },
        ],
        session_token: '2020138925789hjkxdbaj',
        two_factor: 0,
        token: '218378hdjksbae278hibcja',
        launcher_update: false,
      } as AuthorizationRequest)
      Window.main.webContents.send('notification', {
        messages: [
          {
            character_name: 'Simon_Redwood',
            date: 1703071905,
            status: -1,
            text: 'Administrator changed your nickname to Simon_Redwood',
            account_id: 1,
          },
          {
            character_name: 'Simon_Redwood',
            date: 1703071005,
            status: 0,
            text: 'Administrator changed your bank balance from 0/10000 to 10000/10000',
            account_id: 1,
          },
          {
            character_name: 'Jessica_Thompson',
            date: 1703070005,
            status: -1,
            text: 'Administrator blocked character Jessica_Thompson until 31.12.2025',
            account_id: 1,
          },
        ],
      })
      Window.main.webContents.send('widgets', [
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Обновление игрового мода v4.2!',
          description:
            'В обновлении были добавлены Казино, реализована Рулетка, Покер, Блекджек и многое другое! Для начала игры необходимо обновить игровой клиент.',
          display: 1,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Обновление игрового мода v4.2!',
          description:
            'В обновлении были добавлены Казино, реализована Рулетка, Покер, Блекджек и многое другое! Для начала игры необходимо обновить игровой клиент.',
          display: 1,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Обновление игрового мода v4.2!',
          description:
            'В обновлении были добавлены Казино, реализована Рулетка, Покер, Блекджек и многое другое! Для начала игры необходимо обновить игровой клиент.',
          display: 1,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Обновление игрового мода v4.2!',
          description:
            'В обновлении были добавлены Казино, реализована Рулетка, Покер, Блекджек и многое другое! Для начала игры необходимо обновить игровой клиент.',
          display: 1,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
        {
          type: 2,
          url: 'https://github.com/alashchev17',
          header: 'Widget Header',
          description: 'Widget description',
          display: 2,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Widget Header',
          description: 'Widget description',
          display: 2,
          image: './img/background.png',
          date: 1703071005,
        },
        {
          type: 2,
          url: 'https://github.com/alashchev17',
          header: 'Widget Header',
          description: 'Widget description',
          display: 3,
          image: './img/update-bg-2.png',
          date: 1703071005,
        },
        {
          type: 1,
          url: 'https://github.com/alashchev17',
          header: 'Widget Header',
          description: 'Widget description',
          display: 3,
          image: './img/update-bg-1.png',
          date: 1703071005,
        },
      ])
    },
  }
  constructor() {
    Main.Log('APP', `Start ${app.getName()} v${app.getVersion()}`)
    this.init()
  }

  async init() {
    for (const [key, value] of Object.entries(this.IPCMethods)) {
      ipcMain.on(key, value)
    }

    Window.create()

    this.updater()

    // while (!Main.WS.isConnected() || !Window.DomLoad || !this.updateChecked) {
    //     if (Main.WS.reconnectionCount == 0) {
    //         Main.WS.Reconnect();
    //     }
    //     await new Promise(resolve => setTimeout(resolve, 500));
    // }
    // Main.Session.checkSession();

    // Main.Config.send();

    // Main.WS.sendRequest(4, {}); // Получение виджетов
    // this.updateOnline();
    const endTime = performance.now()
    Main.Log('APP', `Application initialized in ${endTime - this.startTime} ms`)
    Main.InitializedStatus = true
  }

  updater() {
    if (!Main.isProduction) {
      this.updateChecked = true
      return
    }

    autoUpdater.autoDownload = true

    autoUpdater.checkForUpdates()

    Main.Log('UPDATE', 'Checking for updates')

    autoUpdater.on('update-not-available', () => {
      Main.Log('UPDATE', 'No updates')
      this.updateChecked = true
    })
    autoUpdater.on('update-downloaded', () => {
      Main.Log('UPDATE', 'Installing updates')
      autoUpdater.quitAndInstall()
    })
    autoUpdater.on('error', (error) => {
      Main.Logger.error(error)
    })
  }
  static Log(type: string, message: string) {
    if (Main.Logger.transports.file.level == 'silly') {
      let format = '{d}.{m}.{y} {h}:{i}:{s} {text}'
      let status = Main.Config.Settings.launcher.debugLog

      Main.Logger.transports.file.level = status
      Main.Logger.transports.console.level = status
      Main.Logger.transports.file.format = format
      Main.Logger.transports.console.format = format
      Main.Logger.transports.file.rotate = true

      Main.Logger.transports.file.maxSize = 5 * 1024 * 1024
      Main.Logger.catchErrors()
    }

    message = message.replace(
      /("token"|"session"|"password"|"session_token"):"[^"]+"/g,
      '$1:"hidden"'
    )
    Main.Logger.debug(`[${type}] ${message}`)
  }

  public GetInitializedStatus(): boolean {
    return Main.InitializedStatus
  }

  private async updateOnline() {
    const url = 'https://api.volkdev.su/v1/server/online?id=grp'
    let response: Response
    try {
      response = await fetch(url)
      const jsonData = (await response.json()) as Online
      Window.main.webContents.send('online', jsonData.response.players)

      setTimeout(() => this.updateOnline(), 60000)
    } catch (error) {
      Main.Log('ONLINE', `Error ${error.message}`)
    }
  }
}
