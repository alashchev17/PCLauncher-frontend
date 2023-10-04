import { app } from 'electron';

import { Main } from './main'

if (require('electron-squirrel-startup') || !app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let mainProccess = new Main();
}


