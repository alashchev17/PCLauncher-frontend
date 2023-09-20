import WebSocket from 'ws';
import { Main } from './main'

import { Window } from './window';

export class WebSocketConnection {
    private ws: WebSocket | null = null;
    private method;

    public token = '';

    private errorListeners: ((error: any) => void)[] = [];

    private methodsMessage: { [key: number]: string } = {
        1: 'Authorization',
        2: 'Notification',
        3: 'Logout'
    }

    private notsentErrors: [106];
 
    constructor() {
        this.method = new WebSocketMethods();
    }
 
    public async connect() {
        return new Promise<void>((resolve, reject) => {
            try {
                this.ws = new WebSocket("ws://45.90.219.11:4327/launcher");
                this.ws.onmessage = this.onMessage.bind(this);
                this.ws.onerror = this.onError.bind(this);
                this.ws.onclose = (event) => {
                    this.onClose(event);
                    this.ws.onclose = this.onClose.bind(this);
                    resolve();
                };
                this.ws.onopen = (event) => {
                    this.onOpen(event);
                    this.ws.onopen = this.onOpen.bind(this);
                    resolve();
                };
            } catch (error) {
                reject(error);
            }
        });
    }
 
    private onOpen(event: WebSocket.Event) {
        console.log('WebSocket connection opened:', event);
    }
 
    private onMessage(event: WebSocket.MessageEvent) {
        console.log(event.data.toString());
        const obj = JSON.parse(event.data.toString());
        if(obj.response.error != undefined) {
            Window.main.webContents.send('error', obj.response);
            return;
        }
        this.method.CallFunction(this.methodsMessage[obj.type], obj.response);
    }
 
    private onClose(event:  WebSocket.CloseEvent) {
        console.log('WebSocket connection closed:', event);
    }
 
    private onError(event: WebSocket.ErrorEvent) {
        console.error('WebSocket error:', event);
        this.emitError(event);
    }

    public async send(message: string) {
        if (this.ws) {
            this.ws.send(message);
        } else {
            this.emitError('WebSocket connection is not established');
        }
    }

    public isConnected(): boolean {
        return this.ws.readyState == WebSocket.OPEN;
    }

    private emitError(error: any) {
        for (const listener of this.errorListeners) {
            listener(error);
        }
    }

    public addErrorListener(listener: (error: any) => void) {
        this.errorListeners.push(listener);
    }

    public removeErrorListener(listener: (error: any) => void) {
        const index = this.errorListeners.indexOf(listener);
        if (index !== -1) {
            this.errorListeners.splice(index, 1);
        }
    }
    public sendRequest(key:number, data: any) {
        let obj  = {
            type: key,
            data: data,
            token: this.token,
        }; 
        let jsonObj = JSON.stringify(obj);
        console.log(jsonObj);
        this.ws.send(jsonObj);
    }
}

 class WebSocketMethods {
    [key: string]: (...object: any[]) => any;

    constructor() {

    }
    CallFunction(key: string, data: any) {
        const fn = this[key]
        if (typeof fn === 'function') {
          return fn(data);
        } else {
          throw new Error(`Function '${key}' not found`);
        }
    }

    private Authorization(data: any) {
        let type = 'login-success';
        if (data.token == '') {
            type = 'login-twofactor';
        } else {
            Main.WS.token = data.token;
            if(data.save) {
                Main.Session.saveSession(data);
            }
        }
        Window.main.webContents.send(type, data);
    }
    private Notification(data: any) {
    }
    private Logout(data: any) {
        if(data == 'reset') {
            Main.WS.token = "";
            Window.main.webContents.send('logout');
        }
    }
 }
