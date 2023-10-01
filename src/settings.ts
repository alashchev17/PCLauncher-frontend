import * as fs from 'fs';
import * as path from 'path';
import { Main } from './main';
import { Window } from './window';
import { app } from 'electron';


interface SettingsLauncher {
    launchOnLoad: boolean;
    wideScreen: boolean;
    windowScreen: boolean;
    debugLog: boolean;
    maxDownloadSpeed: number;
}

interface Settings {
    session: string;
    launcher: SettingsLauncher
}

export class SettingsManager {
    public Advice: string[];
    private file_settings = path.join(Main.appData, 'settings.json');
    public Settings : Settings = {
        session: '',
        launcher: {
            launchOnLoad: false,
            wideScreen: false,
            windowScreen: false,
            debugLog: true,
            maxDownloadSpeed: 10000,
        },
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
        Main.Logger.info("[APP] Save settings from", this.file_settings)
    }

    public updateSettings(data: SettingsLauncher) {
        let relaunch : boolean;
        if(data == undefined) {
            return;
        }
        if(this.Settings.launcher.launchOnLoad != data.launchOnLoad) {
            app.setLoginItemSettings({
                openAtLogin: data.launchOnLoad    
            }) 
        }
        if(this.Settings.launcher.debugLog != data.debugLog) {
            Main.Logger.info(`[APP] Disabling debug logging`)
            relaunch = true;
        }
        this.Settings.launcher = data;

        this.saveSettings()

        if(relaunch) {
            app.relaunch();
            app.quit();
        }

    }

    public send() {
        let version = `${app.getName()} v${app.getVersion()}`;
        Window.main.webContents.send("settings", this.Settings.launcher, version);
    }
    
}