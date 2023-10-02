import {app } from 'electron';

import { Main } from './main'

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainProccess = new Main();

