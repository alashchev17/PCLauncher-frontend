import { app } from "electron";
import { WebSocketConnection } from "./websocket";
import { autoUpdater } from "electron-updater";
import { SessionManager } from "./session";
import { ipcMain } from "electron";
import { Window } from "./window";
import { SettingsManager } from "./settings";
import * as path from "path";

export class Main {
    static isProduction: boolean = false;

    static appData = path.join(app.getPath("appData"), app.getName());

    static WS = new WebSocketConnection();
    static Session = new SessionManager();
    static Initialized: boolean;
    static Config = new SettingsManager();
    static Logger = require("electron-log");
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
        this.logger();
        this.init();
    }
    async init() {
        const startTime = performance.now();

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
        Main.Logger.info(`[APP] Application initialized in ${endTime - startTime} ms`);
        Main.Initialized = true;
    }

    updater() {
        if (!Main.isProduction) {
            this.updateChecked = true;
            return;
        }

        autoUpdater.autoDownload = true;

        autoUpdater.checkForUpdates();

        Main.Logger.info("[UPDATES] Checking for updates");

        autoUpdater.on("update-not-available", () => {
            Main.Logger.info("[UPDATES] No updates");
            this.updateChecked = true;
        });
        autoUpdater.on("update-downloaded", () => {
            Main.Logger.info("[UPDATES] Installing updates");
            autoUpdater.quitAndInstall();
        });
        autoUpdater.on("error", error => {
            Main.Logger.error(error);
        });
    }
    logger() {
        let format = "{d}.{m}.{y} {h}:{i}:{s} {text}";
        Main.Logger.transports.file.level = true;
        Main.Logger.transports.console.level = true;

        Main.Logger.transports.file.format = format;

        Main.Logger.transports.console.format = format;

        Main.Logger.transports.file.rotate = true;
        Main.Logger.transports.file.maxSize = 5 * 1024 * 1024;

        Main.Logger.info(`[APP] Start ${app.getName()} v${app.getVersion()}`);

        Main.Logger.catchErrors();
    }
}
