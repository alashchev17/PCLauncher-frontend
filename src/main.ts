import { app } from "electron";
import { WebSocketConnection } from "./websocket";
import { autoUpdater } from "electron-updater";
import { SessionManager } from "./session";
import { ipcMain } from "electron";
import { Window } from "./window";
import { SettingsManager } from "./settings";
import * as path from "path";

export class Main {

    public startTime = performance.now();
    static isProduction: boolean = false;

    static appData = path.join(app.getPath("appData"), app.getName());

    static Logger = require("electron-log")
    static crypto = require("crypto");

    static Config = new SettingsManager();
    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    static InitializedStatus: number;
    private updateChecked: boolean;
    private IPCMethods = {
        login: (e: any, login: string, password: string, twofactor: number) => {
            Main.Session.authorize(login, password, twofactor);
        },
        logout: (e: any) => {
            Main.Session.logout();
        },
        saveSettings: (e: any, data: any) => {
            Main.Config.updateSettings(data);
        },
    };
    constructor() {
        Main.InitializedStatus++;
        Main.Log('APP', `Start ${app.getName()} v${app.getVersion()}`);
        this.init();
    }
    async init() {

        for (const [key, value] of Object.entries(this.IPCMethods)) {
            ipcMain.on(key, value);
        }

        Window.create();

        this.updater();

        while (!Main.WS.isConnected() || !Window.DomLoad || !this.updateChecked) {
            if (Main.WS.reconnectionCount == 0) {
                Main.WS.Reconnect();
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        Main.Session.checkSession();

        Main.Config.send();

        const endTime = performance.now();
        Main.Log('APP', `Application initialized in ${endTime - this.startTime} ms`);
        Main.InitializedStatus++;
    }

    updater() {
        if (!Main.isProduction) {
            this.updateChecked = true;
            return;
        }

        autoUpdater.autoDownload = true;

        autoUpdater.checkForUpdates();

        Main.Log('UPDATE', "Checking for updates");

        autoUpdater.on("update-not-available", () => {
            Main.Log('UPDATE', "No updates");
            this.updateChecked = true;
        });
        autoUpdater.on("update-downloaded", () => {
            Main.Log('UPDATE', "Installing updates");
            autoUpdater.quitAndInstall();
        });
        autoUpdater.on("error", error => {
            Main.Logger.error(error);
        });
        
    }
    static Log(type: string, message: string) {
        if (Main.Logger.transports.file.level == 'silly') {
            let format = "{d}.{m}.{y} {h}:{i}:{s} {text}";
            let status = Main.Config.Settings.launcher.debugLog

            Main.Logger.transports.file.level = status;
            Main.Logger.transports.console.level = status;
            Main.Logger.transports.file.format = format;
            Main.Logger.transports.console.format = format;
            Main.Logger.transports.file.rotate = true;
            
            Main.Logger.transports.file.maxSize = 5 * 1024 * 1024;
            Main.Logger.catchErrors();
        }

        message = message.replace(/("token"|"session"|"password"|"session_token"):"[^"]+"/g, '$1:"hidden"');
        Main.Logger.debug(`[${type}] ${message}`);
    }

    public GetInitializedStatus(): number {
        return Main.InitializedStatus;
    }
}
