import { WebSocketConnection } from './websocket'


export class SessionManager {
    private session: string;
    private WS : WebSocketConnection
    public checked: boolean = false;

    constructor(ws: WebSocketConnection) {
        this.WS = ws;
    }
    
    
    private checkSession() {
        //Проверяем файл или чет на существовании сессии
        this.checked = true;
    }
    public authorize(login: string, password: string, save:boolean, twofactor: number) {
        let data = {login:login, password:password, twofactor:0}
        if(twofactor != 0) {
            data.twofactor = twofactor;
        };
        this.WS.send(this.generateRequest(1, data));
    }
    private generateRequest(key:number, data: any) : string{
        let obj  = {
            type: key,
            data: data
        }; 
        return JSON.stringify(obj);

    }
}