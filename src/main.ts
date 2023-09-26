import { WebSocketConnection } from './websocket'

import { autoUpdater } from 'electron-updater'

import { SessionManager } from './session'

import { ipcMain } from 'electron';

import { Window } from './window';
import { SettingsManager } from './settings';

export class Main {
    static isProduction : boolean = true;


    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    static Initialized : boolean;
    static Config = new SettingsManager();
    private updateChecked : boolean;
    private IPCMethods = {
        'login': (e:any, login: string, password: string, twofactor: number) =>{ Main.Session.authorize(login, password, twofactor); },
        'logout': (e:any) => { Main.Session.logout(); } 
    }
    constructor() {
        this.init();
    }
    async init() {
        const startTime = performance.now();
        console.log("Starting");
        
        for (const [key, value] of Object.entries(this.IPCMethods)) {
            ipcMain.on(key, value);
        }
       
        Window.create();

        this.updater();
        
        Main.WS.addErrorListener(this.errorSocketHandler);
        while (!Main.WS.isConnected() || !Window.DomLoad || !this.updateChecked) {
            if(Main.WS.reconnectionCount == 0) {
                Main.WS.Reconnect();
            }
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }
        Main.Session.checkSession();
        
        const endTime = performance.now();
        console.log(`Application initialized in ${endTime - startTime} ms`)
        Main.Initialized = true;
    }
    errorHandler(error: any) {
        Window.main.webContents.send("console", error);
    }
    errorSocketHandler(error: any) {
        console.log(error);
    }

    updater() {
        if(!Main.isProduction) {
            this.updateChecked = true;
            return;
        }

        autoUpdater.autoDownload = true;
          
        autoUpdater.checkForUpdates();


        autoUpdater.on('update-not-available', () => {
            this.updateChecked = true;
        });;
        autoUpdater.on('update-downloaded', () => {
            autoUpdater.quitAndInstall()
        });
        autoUpdater.on('error', this.errorHandler)
    }
    
}
