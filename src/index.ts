import { app } from 'electron';

import { Main } from './main'

process.on('uncaughtException', (error) => {
    return;
});

process.on('unhandledRejection', (reason, promise) => {
    return;
});

if (require('electron-squirrel-startup') || !app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let mainProccess = new Main();
}


