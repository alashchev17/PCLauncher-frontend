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
    public authorize(login: string, password: string, twofactor: number) {

    }
}