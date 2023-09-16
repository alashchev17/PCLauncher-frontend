
console.log("view.js loaded");

class view {
    #selectors = {
        burgerButton: 'button__burger',
        burgerMenu: 'burger__menu',
        downloadButton: 'mainpage__button',
        downloadBlock: 'mainpage__download',
        downloadInfo: 'mainpage__info',
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
        loginButton: 'login__button',
        loginInput: 'login__input',
        loginCheck: 'login__checkbox',
        //Pages
        loginPage: 'login',
        mainPage: 'main',
        preloaderPage: 'preloader',
        // ErrorPage: 'error',

    };
    #active = "--active";
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
        this.page_name = p;
    }
    events(sl) {
        sl.burgerButton.addEventListener('click', () => { this.selectors_toggle([sl.burgerButton, sl.burgerMenu]); });
        sl.downloadButton.addEventListener("click", () => {
            // this.update = 1;
            /* УДАЛИТЬ КОД 96-99 строк на проде, снять комментарий с 94-ой строки */
            this.percent_update(1);
            if (sl.progressHover.classList.contains(sl.progressHover.classList[0] + this.#active)) {
                sl.progressHover.classList.remove(sl.progressHover.classList[0] + this.#active);
            }
        });
        sl.downloadButton.addEventListener("mouseenter", () => { sl.progressHover.classList.add(sl.progressHover.classList[0] + this.#active); })
        sl.downloadButton.addEventListener("mouseleave", () => { sl.progressHover.classList.remove(sl.progressHover.classList[0] + this.#active); })
        sl.settingButton.addEventListener("click", () => { if (this.page_name != 'preloader') this.selectors_toggle([sl.settingButton, sl.settingBlock]); });
        sl.hideButton.addEventListener("click", () => { ipcRenderer.send("minimize") });
        sl.closeButton.addEventListener("click", () => { ipcRenderer.send("window-all-closed") });
        sl.profileButton.addEventListener("click", () => { this.page = 'login' });
        sl.loginButton.addEventListener("click", function (e) {
            event.preventDefault;
            this.login(sl.loginInput, sl.loginCheck);
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
}
