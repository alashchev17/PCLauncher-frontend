import { WebSocketConnection } from './websocket'

import { SessionManager } from './session'

import { ipcMain } from 'electron';

import { Window } from './window';
import { SettingsManager } from './settings';

import { Updater } from './updater';

export class Main {
    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    static Initialized : boolean;
    static Config = new SettingsManager();
    private IPCMethods = {
        'login': (e:any, login: string, password: string, twofactor: number) =>{ Main.Session.authorize(login, password, twofactor); },
        'logout': (e:any) => { Main.Session.logout(); } 
    }
    constructor() {
        this.init();
    }
    async init() {
        let updater = new Updater()
        const startTime = performance.now();
        console.log("Starting");
        
        for (const [key, value] of Object.entries(this.IPCMethods)) {
            ipcMain.on(key, value);
        }
       
        Window.create();
        
        Main.WS.addErrorListener(this.errorSocketHandler);
        while (!Main.WS.isConnected() || !Window.DomLoad || !updater.download) {
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
        console.log(error);
    }
    errorSocketHandler(error: any) {
        console.log(error);
    }
    
}
