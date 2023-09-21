
console.log("view.js loaded");


class view {
    #selectors = {
        burgerButton: 'button__burger',
        burgerMenu: 'burger__menu',
        downloadButton: 'mainpage__button',
        downloadBlock: 'mainpage__download',
        downloadInfo: 'mainpage__info',
        mainpageSlider: 'mainpage__update-slider',
        progressBlock: 'mainpage__progress',
        progressHover: 'mainpage__blur-hover',
        progressBar: 'mainpage__progress-bar',
        progressRing: 'progress-ring__circle',
        onlineBlock: 'mainpage__online',
        hideButton: 'mainpage__tray-button--hide',
        closeButton: 'mainpage__tray-button--close',
        settingButton: 'mainpage__tray-button--settings',
        settingBlock: 'settings',
        profileButton: 'button__profile',
        loginLogo: 'login__logotype',
        loginAside: 'login__aside',
        loginButton: 'login__button',
        loginInputNick: 'login__nick',
        loginInputPass: 'login__password',
        loginInput2FA: 'login__twofactor',
        loginCheck: 'login__checkbox',
        errorMsgBlock: 'error-block',
        errorMsgBlockText: 'error-block__name',
        reconnectionTimer: 'reconnection-timer',
        errorReason: 'error__reason',
        errorReasonText: 'error__reason-text',
        errorWaitingPoints: 'points',
        preloaderTitle: 'preloader__heading',
        //Pages
        loginPage: 'login',
        mainPage: 'main',
        preloaderPage: 'preloader',
        errorPage: 'error',

    };
    #active = "--active";
    #hidden = "--hidden";
    #play_button = `
    <button class="mainpage__button mainpage__button--ready">
        Запустить
        <svg class="mainpage__button-icon" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx="17" fill="black"/>
        <path d="M23.5849 16.1914C24.1384 16.5508 24.1384 17.4492 23.5849 17.8086L14.2453 23.8735C13.6918 24.2329 13 23.7837 13 23.0649L13 10.9351C13 10.2163 13.6918 9.76709 14.2453 10.1265L23.5849 16.1914Z" fill="white"/>
        </svg>
    </button>
    `;
    page_name = "preloader";
    lastPage;
  
    constructor() {
        for (var key in this.#selectors) {
            let selectr = document.querySelector("." + this.#selectors[key]);
            this.#selectors[key] = selectr;
            
        }
        let sl = this.#selectors; 
        //events
        this.events(sl);
  
        //Circle
        this.radius = sl.progressRing.r.baseVal.value;
        this.circumference = 2 * Math.PI * this.radius;
        sl.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        sl.progressRing.style.strokeDashoffset = this.circumference;
        

    }
    set progressCircle(percent) {
        let sl = this.#selectors;
        const offset = this.circumference - (percent / 100) * this.circumference;
        sl.progressRing.style.strokeDashoffset = offset;
    }
    set progressBar(percent) {
        let sl = this.#selectors;
        sl.progressBar.style.width = `${percent}%`;
    }
    set update(percent) {
        let sl = this.#selectors;
        if (percent == 1) {
            sl.downloadButton.remove();
            this.selectors_toggle([sl.progressBlock, sl.downloadInfo, sl.progressBar, sl.onlineBlock]);
        }
        this.progressBar = percent;
        this.progressCircle = percent;
        if (percent == 100) {
            this.selectors_toggle([sl.progressBlock, sl.downloadInfo, sl.progressBar, sl.onlineBlock]);
            sl.downloadBlock.innerHTML = this.#play_button;
            sl.progressHover.classList.add(sl.progressHover.classList[0] + this.#active);
        }
    }
    set page(p) {
        let sl = this.#selectors[p + 'Page'];
        if(p != this.page_name) {
          this.page = this.page_name;
        }
        sl.classList.toggle(sl.classList[0] + this.#active);
        this.lastPage = this.page_name;
        this.page_name = p;
    }
    events(sl) {
        ipcRenderer.on("error-method", (event, data) => {
            switch (data.error) {
                case 101:
                    // text: "Заполните все поля!"
                    this.errorBlockHandle(sl, "Заполните все поля", 101);
                    break;
                case 102:
                    if(page_name == 'preloader') {
                        this.page = 'login';
                    }
                    this.errorBlockHandle(sl, "Такого пользователя не существует", 102);
                    break;
                case 103:
                    // text: "Вы уже авторизованы под этим аккаунтом!"
                    this.errorBlockHandle(sl, "Вы уже авторизованы под этим аккаунтом", 103);
                    break;
                case 104:
                    // text: "Вы ввели неверный пароль!"
                    this.errorBlockHandle(sl, "Вы ввели неверный пароль", 104);
                    break;
                case 105:
                    // text: "Неверный код двухфакторной аутентификации!"
                    this.errorBlockHandle(sl, "Неверный код двухфакторной аутентификации", 105);
                    break;
                case 106:
                    this.page = 'login';
                    break;
                case 107:
                    // text: "Произошла ошибка отправки кода. Возможно вы уже отправляли его менее минуты назад."
                    this.errorBlockHandle(sl, "Произошла ошибка отправки кода. Возможно, вы уже отправляли его менее минуты назад", 107);
                    break;
            }
        });
        ipcRenderer.on("login-success", (event, data) => {
            sl.loginLogo.classList.add(sl.loginLogo.classList[1] + this.#hidden);
            sl.loginAside.classList.add(sl.loginAside.classList[0] + this.#hidden);
            setTimeout(() => {
                this.page = 'main';
                setTimeout(() => {
                    sl.mainPage.classList.remove(sl.mainPage.classList[0] + this.#hidden);
                }, 100);
            }, 300);
        })
        ipcRenderer.on("login-twofactor", (event, data) => {
            sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#hidden);
            setTimeout(() => {
                sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#active);
                sl.loginInput2FA.setAttribute("required", "required");
            }, 300);
        });

        ipcRenderer.on("logout", (event, data) => {
            sl.mainPage.classList.add(sl.mainPage.classList[0] + this.#hidden);
            setTimeout(() => {
                this.page = 'login';
                setTimeout(() => {
                    sl.loginLogo.classList.remove(sl.loginLogo.classList[1] + this.#hidden);
                    sl.loginAside.classList.remove(sl.loginAside.classList[0] + this.#hidden);
                }, 100);
            }, 500);
            if (sl.loginInput2FA.hasAttribute("required")) {
                sl.loginInput2FA.value = "";
                sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#hidden);
                setTimeout(() => {
                    sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#active);
                    sl.loginInput2FA.removeAttribute("required");
                }, 300);
            }
        });

        ipcRenderer.on("page_open", (event, data) => {
            this.page = data;
        });

        ipcRenderer.on("reconnection", (event, data) => {
            if (this.page_name == 'error') {
                //Просто выводим количество переподключений (data)
                sl.reconnectionTimer.textContent = data;
                return;
            } else if (this.page_name == 'preloader') {
                sl.preloaderTitle.classList.remove(sl.preloaderTitle.classList[0] + this.#active);
                setTimeout(() => {
                    sl.preloaderTitle.textContent = "Проблемы с подключением, переподключаемся...";
                    sl.preloaderTitle.classList.add(sl.preloaderTitle.classList[0] + this.#active);
                }, 300);
                return;
            }
            sl.errorReasonText.textContent = "Переподключение ";
            sl.reconnectionTimer.textContent = "1";
            sl.errorWaitingPoints.textContent = "...";
            this.page = 'error'; // Обновляем страницу при первом переподключении
        });

        ipcRenderer.on("reconnected", (event, data) => {
            if (this.lastPage !== "preloader") {
                if (this.page_name == 'preloader') {
                    sl.preloaderTitle.classList.remove(sl.preloaderTitle.classList[0] + this.#active);
                    setTimeout(() => {
                        sl.preloaderTitle.textContent = "Подключение восстановлено!";
                        sl.preloaderTitle.classList.add(sl.preloaderTitle.classList[0] + this.#active);
                    }, 300);
                    return;
                }
                sl.errorReason.classList.remove(sl.errorReason.classList[0] + this.#active);
                setTimeout(() => {
                    sl.errorReasonText.textContent = "Подключение восстановлено, перенаправление!";
                    sl.reconnectionTimer.textContent = "";
                    sl.errorWaitingPoints.textContent = "";
                    sl.errorReason.classList.add(sl.errorReason.classList[0] + this.#active);
                    setTimeout(() => {
                        this.page = this.lastPage;
                    }, 1000);
                }, 300);
            }
        });
        
        ipcRenderer.on("session_not_found", (event, data) => {
            this.page = 'login';
        });

        sl.burgerButton.addEventListener('click', () => { this.selectors_toggle([sl.burgerButton, sl.burgerMenu]); });
        sl.downloadButton.addEventListener("click", () => {
            // this.update = 1;
            /* УДАЛИТЬ КОД 96-99 строк на проде, снять комментарий с 94-ой строки */
            this.percent_update(1);
        });
        sl.downloadButton.addEventListener("mouseenter", () => { sl.progressHover.classList.add(sl.progressHover.classList[0] + this.#active); })
        sl.downloadButton.addEventListener("mouseleave", () => { sl.progressHover.classList.remove(sl.progressHover.classList[0] + this.#active); })
        sl.settingButton.addEventListener("click", () => {
            if (this.page_name == 'preloader' || this.page_name == 'login') {
                return;
            }
            this.selectors_toggle([sl.settingButton, sl.settingBlock]); 
        });
        sl.hideButton.addEventListener("click", () => { ipcRenderer.send("minimize") });
        sl.closeButton.addEventListener("click", () => { ipcRenderer.send("window-all-closed") });
        sl.profileButton.addEventListener("click", () => {
            ipcRenderer.send('logout');
        });
        sl.loginButton.addEventListener("click", (e) => {
            let login = sl.loginInputNick.value.trim();
            let password = sl.loginInputPass.value.trim();
            let check = false;
            let twofactor = sl.loginInput2FA.value.trim() == '' ? 0 : new Number(sl.loginInput2FA.value.trim());
            if (login.length == 0 || password.length == 0 || (sl.loginInput2FA.hasAttribute("required") && twofactor == '')) {
                return;
            }
            e.preventDefault();
            ipcRenderer.send("login", login, password, check, twofactor);
        
        });

        document.querySelectorAll("a[target='_blank']").forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                const href = link.getAttribute('href');
                ipcRenderer.send("open-link", href);
            });
        });

    }
    selectors_toggle(selectors) {
        selectors.forEach(selector => {
            selector.classList.toggle(selector.classList[0] + this.#active);
        });
    }
    percent_update(percent) {
        if (percent <= 100) {
            this.update = percent;
            setTimeout(() => { this.percent_update(percent + 1) }, 100);
        } else {
            return;
        }
    }
    // percent_update() удалить на проде
    setText(cl, text) {
        document.querySelector("." + cl).innerHTML = text;
    }

    hidetwofactor() {
        sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#active);
        setTimeout(() => {
            sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#hidden);
            sl.loginInput2FA.removeAttribute("required");
        }, 300);
        return;
    }

    errorBlockHandle(sl, text, type) {
        sl.errorMsgBlockText.textContent = text;
        sl.errorMsgBlock.classList.toggle(sl.errorMsgBlock.classList[0] + this.#active);
        setTimeout(() => {
            sl.errorMsgBlock.classList.toggle(sl.errorMsgBlock.classList[0] + this.#active);
        }, 3000);
        switch(type) {
            case 102:
            case 103:
                sl.loginInputNick.value = "";
                sl.loginInputPass.value = "";
                break;
            case 104:
                sl.loginInputPass.value = "";
                break;
            case 105:
            case 107:
                sl.loginInput2FA.value = "";
                break;
        }
    }
}