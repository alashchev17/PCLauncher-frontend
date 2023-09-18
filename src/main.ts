import { WebSocketConnection } from './websocket'

import {  SessionManager } from './session'


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
        //this.Session = new SessionManager(this.WS);
    }
    errorHandler(error: any) {
    }
    errorSocketHandler(error: any) {
    }
    
}
