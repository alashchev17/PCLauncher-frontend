import { WebSocketConnection } from './websocket'

import {  SessionManager } from './session'

import { IpcMain, ipcMain } from 'electron';


export class Main {
    WS: WebSocketConnection
    Session: SessionManager;
    constructor() {
        this.init();
    }
    async init() {
        console.log("Starting");
        this.WS =  new WebSocketConnection();
        await this.WS.connect().catch(this.errorHandler)
        this.WS.addErrorListener(this.errorSocketHandler)
        console.log("Stopped");
        this.Session = new SessionManager(this.WS);
        ipcMain.on('login', (event, login, password, save, twofactor) => { 
            this.Session.authorize(login, password, save, twofactor);
        });
    }
    errorHandler(error: any) {
        console.log(error);
    }
    errorSocketHandler(error: any) {
        console.log(error);
    }
    
}
