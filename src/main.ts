import { WebSocketConnection } from './websocket'

import { SessionManager } from './session'

import { ipcMain } from 'electron';

import { Window } from './window';

export class Main {
    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    private IPCMethods = {
        'login': (e:any, login: string, password: string, save: boolean, twofactor: number) =>{ Main.Session.authorize(login, password, save, twofactor); },
        'logout': (e:any) => { Main.Session.logout(); } 
    }
    constructor() {
        this.init();
    }
    async init() {
        console.log("Starting");
        Window.create();
        await Main.WS.connect().catch(this.errorHandler)
        Main.WS.addErrorListener(this.errorSocketHandler)
        for (const [key, value] of Object.entries(this.IPCMethods)) {
            ipcMain.on(key, value);
        }
        Main.Session.checkSession();
        console.log("init finished");
    }
    errorHandler(error: any) {
        console.log(error);
    }
    errorSocketHandler(error: any) {
        console.log(error);
    }
    
}
