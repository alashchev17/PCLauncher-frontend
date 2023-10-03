import * as fs from 'fs';
import * as path from 'path';
import { Main } from './main';
import { Window } from './window';
import { app } from 'electron';
import { machineIdSync  } from 'node-machine-id'


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
    public file_settings = path.join(Main.appData, '.session');
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
    public relaunch : string[] = ['debugLog'];
    constructor() {
        this.loadSettings()
    
    }
    public loadSettings() {
        if (!fs.existsSync(this.file_settings)) {
            this.Settings = this.Settings;
            return;
        }
        let data =  fs.readFileSync(this.file_settings, 'utf-8');
        try {
            this.Settings = JSON.parse(this.decrypted(data));
        } catch (e) {
            fs.unlink(this.file_settings, (err) => {
                if (err) {
                    Main.Logger.error(err);
                } else {
                    this.loadSettings();
                }
            });
        }

    }

    public saveSettings() {
        let json = this.encrypted(JSON.stringify(this.Settings));
        fs.writeFileSync(this.file_settings, json, 'utf-8');
    }

    public updateSettings(data: SettingsLauncher) {
        let relaunch : boolean;
        if(data == undefined) {
            return;
        }
        for (const k in this.Settings.launcher) {
            let key = k as keyof SettingsLauncher;
            if (this.Settings.launcher[key] != data[key]) {
                if(this.relaunch.includes(key)) {
                    relaunch = true;
                }

                switch (key) {
                    case "launchOnLoad": 
                        app.setLoginItemSettings({openAtLogin: data[key]});
                        break;
                }

                Main.Log('SETTING', `${key}: ${data[key]} `);
            }
        }
        this.Settings.launcher = data;

        this.saveSettings();

        if(relaunch) {
            app.relaunch();
            setTimeout(() => {
                Main.Log('SETTING', `Restarting the application`);
                app.relaunch();
                app.quit();
            }, 3000);
        }

    }

    public send() {
        let version = `${app.getName()} v${app.getVersion()}`;
        Window.main.webContents.send("settings", this.Settings.launcher, this.relaunch, version);
    }

    private encrypted(data : string) {
        let params = this.getCryptoParams();
        const cipher = Main.crypto.createCipheriv('aes-256-cbc', params[0], params[1]);
        let encryptedData = cipher.update(data, 'utf8', 'binary');
        encryptedData += cipher.final('binary');
        return encryptedData;
    }
    
    private decrypted(encryptedData : string) {
        let params = this.getCryptoParams();
        const decipher = Main.crypto.createDecipheriv('aes-256-cbc',  params[0],  params[1]); 
        let decryptedData = decipher.update(encryptedData, 'binary', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData
    }
    private getCryptoParams() {
        let machine = machineIdSync();
        return [machine.slice(32, 64), machine.slice(10, 26)];
    }
}