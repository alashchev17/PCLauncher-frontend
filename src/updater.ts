import { autoUpdater } from 'electron-updater'

import { Window } from './window';

export class Updater {
    public download: boolean;
    constructor() {

        this.download = true;
          
        autoUpdater.checkForUpdates()

       // Window.main.webContents.send("console", autoUpdater.checkForUpdates());

        autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this));
        autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
        autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
        autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
        autoUpdater.on('error', this.onUpdateError.bind(this));
    }
    
    onCheckingForUpdate() {
        console.info('Проверка наличия обновлений...');
        Window.main.webContents.send("console", "update check");
    }
    
    onUpdateNotAvailable() {
        Window.main.webContents.send("console", "Нет обнов");
        this.download = true;
    }
    
    onUpdateAvailable() {
        Window.main.webContents.send("console", "Есть обновы" );
    }
    
    onUpdateDownloaded() {
        Window.main.webContents.send("console", "Загрузили");
        autoUpdater.quitAndInstall()
    }

    onUpdateError(message : any)  {
        Window.main.webContents.send("console", "Ошибка");
        console.error('There was a problem updating the application')
        console.error(message)
    }
}