import { Main } from './main'

//import { Window } from './window';


export class SessionManager {
    private session: string;
    public checked: boolean = false;

    constructor() {
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
        Main.WS.send(this.generateRequest(1, data));       
        
    }
    public logout() {
    }
    private generateRequest(key:number, data: any) : string{
        let obj  = {
            type: key,
            data: data
        }; 
        return JSON.stringify(obj);

    }
}