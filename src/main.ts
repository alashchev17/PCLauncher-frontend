import { WebSocketConnection } from './websocket'

import { SessionManager } from './session'

import { ipcMain } from 'electron';

import { Window } from './window';
import { SettingsManager } from './settings';

export class Main {
    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    static Config = new SettingsManager();
    private IPCMethods = {
        'login': (e:any, login: string, password: string, save: boolean, twofactor: number) =>{ Main.Session.authorize(login, password, save, twofactor); },
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
        
        Main.WS.addErrorListener(this.errorSocketHandler);
        while (!Main.WS.isConnected() || !Window.DomLoad) {
            if(Main.WS.reconnectionCount == 0) {
                Main.WS.Reconnect();
            }
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }
        
        Main.Session.checkSession();
        
        const endTime = performance.now();
        console.log(`Application initialized in ${endTime - startTime} ms`)
    }
    errorHandler(error: any) {
        console.log(error);
    }
    errorSocketHandler(error: any) {
        console.log(error);
    }
    
}
