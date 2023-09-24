import { Main } from './main'

import * as crypto from 'crypto';

import { Window } from './window';

interface Authorize {
    login: string;
    password: string;
    code: number;
    save: boolean;
}

interface AuthorizeToken {
    session: string;
}


export class SessionManager {
    public checked: boolean = false;

    constructor() {
    }
    
    
    public checkSession() {
        this.authorizeByToken()
    }
    public authorize(login: string, password: string, twofactor: number) {
        let hashPassword = crypto.createHash('sha256').update(password).digest('hex');
        let data : Authorize = {
            login:login, 
            password:hashPassword, 
            code:0, 
            save:true}
        if(twofactor != 0) {
            data.code = twofactor;
        };     
        Main.WS.sendRequest(1, data);
        
    }
    public authorizeByToken() {
        let session = Main.Config.Settings.session;
        if (session == '') {
            this.checked = true;
            Window.main.webContents.send('session_not_found')
            console.log("Send Session Not Found");
            return;
        }
        let data : AuthorizeToken = {
            session: Main.Config.Settings.session
        }
        Main.WS.sendRequest(1, data);
        
    }
    public logout() {
        Main.WS.sendRequest(3, {}); 
        
    }

    public saveSession (token: string) {
        Main.Config.Settings.session = token;
        Main.Config.saveSettings(); 
    }
}