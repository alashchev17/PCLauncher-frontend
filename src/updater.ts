import { autoUpdater } from 'electron'

export class Updater {
    public download: boolean;
    constructor() {
          
        autoUpdater.checkForUpdates()

        autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this));
        autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
        autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
        autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
        autoUpdater.on('error', this.onUpdateError.bind(this));
    }
    
    onCheckingForUpdate() {
        console.info('Проверка наличия обновлений...');
    }
    
    onUpdateNotAvailable() {
        this.download = true;
    }
    
    onUpdateAvailable() {
    }
    
    onUpdateDownloaded() {
        autoUpdater.quitAndInstall()
    }

    onUpdateError(message : any)  {
        console.error('There was a problem updating the application')
        console.error(message)
    }
}