import { Main } from './main'

import * as crypto from 'crypto';

import { Window } from './window';


export class SessionManager {
    public checked: boolean = false;

    constructor() {
    }
    
    
    private checkSession() {
        //Проверяем файл или чет на существовании сессии
        this.checked = true;
    }
    public authorize(login: string, password: string, save:boolean, twofactor: number) {
        let hashPassword = crypto.createHash('sha256').update(password).digest('hex');
        let data = {login:login, password:hashPassword, code:0}
        if(twofactor != 0) {
            data.code = twofactor;
        };     
        Main.WS.sendRequest(1, data);
        
    }
    public logout() {
        Main.WS.sendRequest(3, {}); 
        
    }

    public saveSession (data: any) {
        //Сохраняем сессию в файл
    }
}