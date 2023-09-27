import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

import { Main } from './main';


interface Settings {
    session: string;
    launcher: {
        // settings
    }
}

interface Advice {
    advice : string[];
}

export class SettingsManager {
    public Advice: string[];
    private appData = path.join(app.getPath("appData"), app.getName());
    private file_settings = path.join(this.appData, 'settings.json');
    private file_advice = path.join(this.appData, 'advice.json')
    public Settings : Settings = {
        session: '',
        launcher: {},
    }
    constructor() {
        this.loadSettings()
    
    }
    public loadSettings() {
        if (!fs.existsSync(this.file_settings)) {
            this.Settings = this.Settings;
            return;
        }
        let file =  fs.readFileSync(this.file_settings, 'utf-8');
        this.Settings = JSON.parse(file);

    }

    public saveSettings() {
        let json = JSON.stringify(this.Settings);
        fs.writeFileSync(this.file_settings, json, 'utf-8');
        Main.Logger.info("[APP] Update settings from", this.file_settings)
    }

   /* public loadAdvice() {
        if (!fs.existsSync(this.file_advice)) {
            this.Advice = [];
            //Нет подсказок, может грузить с бека?
        }
        let file =  fs.readFileSync(this.file_settings, 'utf-8');
        let obj : Advice = JSON.parse(file);
        this.Advice = obj.advice;
    }*/
    /*set advice(array: string[]) {
        let obj : Advice = {
            advice: array
        }
        let json = JSON.stringify(obj);
        fs.writeFileSync(this.file_advice, json, 'utf-8');
    }*/
}