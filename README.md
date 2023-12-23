# Getting Started

## How to install and launch?

-   Clone **git repository** in terminal:
    For MacOS/Linux/Windows:
    ```
    mkdir directory-name
    cd ./directory-name
    git clone https://github.com/alashchev17/PCLauncher-frontend
    ```
-   If you didn't install any of available package managers, make sure that you have installed [NodeJS](https://nodejs.org/en/download) and then type in a terminal next command:
    ```
    npm -v
    ```
-   Install dependencies from `package.json` file by writing next command in terminal:
    `npm install` or `yarn install`

*   Launch a project via `npm start` or `yarn start`

-   If you have installed and started project correctly, you'll get next logs in a console:
    ```
    23.12.2023 14:57:48 [APP] Start Gambit Launcher v0.1.7
    23.12.2023 14:57:48 [APP] Application initialized in XX.XXXX ms
    ```

---

## How to inspect project and its features?

It seems to be easy. In the top you have 2 buttons, **"Initiate Reconnect"** and **"Initiate 2FA"**.

The **first one** will immitate reconnection process due to some "server error" to visualize **Error Screen** while server is offline. If reconnection is currently started, you can stop reconnection by pressing the same button.

The **second one** will immitate 2FA Authentication code request on a Login Screen.

---

## Project functionality and features

### Screens and content

-   Login Screen
    -   Login form
-   Preloader Screen
-   Error Screen (on reconnection)
    -   Reconnection counter
    -   Game tips each 3 counts up
-   Main Screen
    -   Project's resources and links
    -   News widgets
    -   Profile menu
        -   Game character list
        -   Notification Center
    -   Download Manager
-   Settings Screen
    -   Launcher Settings form
    -   If debug log is enabled, ability to open logs file folder of the Application

---

## Screenshots

### Login Screen

<img src="/screenshots/login.png" alt="Login Screen" style="border-radius: 10px;" />

### Main Screen

<img src="/screenshots/main.png" alt="Main Screen" style="border-radius: 10px;" />

### Main Screen (extended)

<img src="/screenshots/main-extended.png" alt="Main Screen (extended)" style="border-radius: 10px;" />

### Settings Screen

<img src="/screenshots/settings.png" alt="Settings Screen" style="border-radius: 10px;" />

### Error Screen

<img src="/screenshots/error.png" alt="Settings Screen" style="border-radius: 10px;" />
