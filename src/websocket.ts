import WebSocket from 'ws';
import { Main } from './main'
import { Window } from './window';

interface SendRequest {
    launcher: number;
    type: number;
    token: string;
    data : any;    
}
//Интерфейсы для входящих запросов

interface IncomingRequest {
    type: number;
    response: {
        error: number;
        error_message: string;
    };
}

interface AuthorizationRequest {
    user_id : number;
    user_login: string;
    characters: any[];
    session_token: string;
    two_factor: number;
    token: string;
    launcher_update: boolean;
}

interface NotificationRequest {
    character_name: string;
    date: number;
    status: number;
    text: string;
    account_id: number;
}

interface WidgetRequest {
    type: number;
    url: string;
    header: string;
    description: string;
    display: number;
    image: string;
}



export class WebSocketConnection {  
    private ws: WebSocket | null = null;
    private method;

    public token = '';

    public reconnectionCount: number = 0;

    public typeName = ['none', 'authorization', 'notification', 'logout', 'widget'];


    private methodsMessage: { [key: number]: string } = {
        1: 'Authorization',
        2: 'Notification',
        3: 'Logout',
        4: 'Widget',
    }
 
    constructor() {
        this.method = new WebSocketMethods();
        this.connect();
    }
    private async connect() {
        this.ws = new WebSocket("wss://backend.dev-gambit.ru/launcher/" );
        //this.ws = new WebSocket("ws://45.90.219.11:4327/launcher" );
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = (event) => {
            this.onClose(event);
            this.ws.onclose = this.onClose.bind(this);
        };
        this.ws.onopen = (event) => {
            this.onOpen(event);
            this.ws.onopen = this.onOpen.bind(this);
        };
    }
 
    private onOpen(event: WebSocket.Event) {
        if(Main.InitializedStatus) {
            if(Main.Config.Settings.session != '')
            {
                Main.Session.authorizeByToken();
            } else {
                Window.main.webContents.send("session_not_found");
            }
        }
        Main.Log("SOCKET", 'WebSocket connection opened');
    }
 
    private onMessage(event: WebSocket.MessageEvent) {
        if(event.data == '') {
            return;
        }
        const obj : IncomingRequest = JSON.parse(event.data.toString());
        let log =  `Received ${this.typeName[obj.type]}: `;
        if(Main.isProduction) {
            log += `${obj.response.error != undefined ? obj.response.error_message : "success"}`;
        } else {
            log += `${event.data.toString()}}`;
        }
        Main.Log('SOCKET', log); 
        if(obj.response != null && obj.response.error != undefined) {
            if(obj.response.error == 2 && Main.WS.token != '') { // Access denied
                if(Main.Config.Settings.session != '') {
                    Main.Session.authorizeByToken();
                    return;
                }
                Window.main.webContents.send("logout");
                Main.WS.token = '';
                return;
            } 


            if((obj.response.error == 102 || obj.response.error == 106) && Main.Config.Settings.session != '') {  // Session
               let type = "session_not_found";
                if(Main.WS.token != '') {
                    type = "logout";
                }
                Main.Config.Settings.session = "";
                Main.Config.saveSettings();
                Window.main.webContents.send(type);
            }
            Window.main.webContents.send('error-method', obj.response);
            return;
        }
        this.method.CallFunction(this.methodsMessage[obj.type], obj.response);
    }
 
    private onClose(event:  WebSocket.CloseEvent) {
        if(this.reconnectionCount == 0) {
            this.Reconnect();
        }
    }

    public Reconnect() {
        this.reconnectionCount++;
        let inetrvalReconnect : any;
        inetrvalReconnect =  setInterval(() => {
            if(this.isConnected()) { 
                this.reconnectionCount = 0;
                clearInterval(inetrvalReconnect);
                return;
            }

            Main.Log('SOCKET', `Reconnecting ${Main.WS.reconnectionCount}`);

            Window.main.webContents.send("reconnection", Main.WS.reconnectionCount)

           
            Main.WS.connect();

            Main.WS.reconnectionCount++;
        }, 2000)
    }
 
    private onError(event: WebSocket.ErrorEvent) {
        Main.Log("info", "[SOCKET] "+event.message);
    }

    public async send(message: string) {
         this.ws.send(message);
    }

    public isConnected(): boolean {
        return this.ws.readyState == WebSocket.OPEN; // Иногда выдает ошибку, нужно понять почему
    }
    public sendRequest(key:number, data: any) {
        let obj : SendRequest = {
            launcher: 1,
            token: this.token,
            type : key,
            data : data
        };
        let jsonObj = JSON.stringify(obj);
        let log = `Sending ${this.typeName[key]}`;
        log += Main.isProduction ? '' : jsonObj;
        Main.Log('SOCKET', log); 
        this.ws.send(jsonObj);
    }
}

 class WebSocketMethods {
    [key: string]: (...object: any[]) => any;

    constructor() {}

    CallFunction(key: string, data: any) {
        const fn = this[key]
        if (typeof fn === 'function') {
          return fn(data);
        } else {
          throw new Error(`Function '${key}' not found`);
        }
    }


    private Authorization(data: AuthorizationRequest) {
        let type = 'login-success';
        if (data.token == '') {
            type = 'login-twofactor';
            
        } else {
            Main.WS.token = data.token;
            if(data.session_token != '') {
                Main.Session.saveSession(data.session_token);
            }
        }
            Window.main.webContents.send(type, data);
    }


    private Notification(data: NotificationRequest) {
        Window.main.webContents.send("notification", data);
        
    }

    
    private Logout(data: string) {
        if(data == 'reset') {
            Main.WS.token = "";
            Main.Config.Settings.session = "";
            Main.Config.saveSettings();
            Window.main.webContents.send('logout');
        }
    }

    private Widget(data: WidgetRequest) {
        Window.main.webContents.send("widgets", data);
    }
 }
