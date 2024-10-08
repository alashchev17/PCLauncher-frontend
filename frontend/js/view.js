console.log('view.js loaded')

const { ipcRenderer } = require('electron') // eslint-disable-line

class View {
  #selectors = {
    // Simulator buttons
    reconnectButton: 'sim--reconnect',
    authButton: 'sim--auth',
    // UI Components
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
    onlineCounter: 'mainpage__online-number',
    // Settings
    settingButton: 'mainpage__tray-button--settings',
    settingBlock: 'settings',
    settingSubmitButton: 'settings__button--primary',
    settingLogButton: 'settings__button--logs',
    settingVersion: 'settings__version',
    // Login
    profileButton: 'button__profile',
    loginLogo: 'login__logotype',
    loginAside: 'login__aside',
    loginButton: 'login__button',
    loginButtonTest: 'login__button-test',
    loginInputNick: 'login__nick',
    loginInputPass: 'login__password',
    loginInput2FA: 'login__twofactor',
    errorMsgBlock: 'error-block',
    errorMsgBlockText: 'error-block__name',
    reconnectionTimer: 'reconnection-timer',
    errorReason: 'error__reason',
    errorReasonText: 'error__reason-text',
    errorWaitingPoints: 'points',
    // Tip Blocks
    errorTipBlock: 'error__tip',
    errorTipTitle: 'error__tip-title',
    errorTipText: 'error__tip-text',
    preloaderTipBlock: 'preloader__tip',
    preloaderTipTitle: 'preloader__tip-title',
    preloaderTipText: 'preloader__tip-text',
    preloaderTitle: 'preloader__heading',
    // User Block (Characters & Notifications)
    userBlock: 'user',
    userGreeting: 'user__greeting',
    userLogout: 'user__logout',
    userCharactersList: 'user__characters',
    userNotificationsList: 'user__notifications',
    userGoToNotifications: 'user__link--notifications',
    userGoToCharacters: 'user__link--characters',
    userCharacters: 'user__characters-item',
    userCharactersContent: 'user__content--characters',
    userNotificationsContent: 'user__content--notifications',
    // Crashreports Page
    crashButton: 'crash__button',
    crashCode: 'crash__code',
    //Pages
    loginPage: 'login',
    mainPage: 'main',
    preloaderPage: 'preloader',
    errorPage: 'error',
    crashPage: 'crash',
  }
  #selectorsID = {
    // Settings checkboxes (with IDs)
    settingCheckboxLaunchOnLoad: 'launchOnLoad',
    settingCheckboxWideScreen: 'wideScreen',
    settingCheckboxWindowScreen: 'windowScreen',
    settingCheckboxDebugLog: 'debugLog',
    settingCheckboxMaxDownloadSpeed: 'maxDownloadSpeed',
    // News blocks
    mainpageRegularNews: 'regularNews',
    mainpageSliderNews: 'sliderNews',
    mainpageFixedNews: 'fixedNews',
  }

  #userCharactersNew
  #userNotificationsNew
  #settings = {}

  #active = '--active'
  #hidden = '--hidden'
  #disabled = '--disabled'
  #denied = '--denied'
  #notification = '--notification'
  #play_button = `
    <button class="mainpage__button mainpage__button--ready">
        Запустить
        <svg class="mainpage__button-icon" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx="17" fill="black"/>
        <path d="M23.5849 16.1914C24.1384 16.5508 24.1384 17.4492 23.5849 17.8086L14.2453 23.8735C13.6918 24.2329 13 23.7837 13 23.0649L13 10.9351C13 10.2163 13.6918 9.76709 14.2453 10.1265L23.5849 16.1914Z" fill="white"/>
        </svg>
    </button>
    `
  page_name = 'preloader'
  lastPage
  widgetsData

  tipTexts = [
    {
      title: 'Подсказка',
      text: 'Чтобы приобрести дом или квартиру, вы можете посетить Центр Купли-Продаж в Сан-Фиерро и ознакомиться с предлагаемыми вариантами.',
    },
    {
      title: 'Подсказка',
      text: "В случае блокировки, вы можете обратиться в раздел 'Жалобы на администрацию' и подать заявление на амнистию.",
    },
    {
      title: 'Совет',
      text: 'Нажмите клавишу Y на клавиатуре, чтобы открыть меню взаимодействия.',
    },
    {
      title: 'Подсказка',
      text: 'Обратиться за внутриигровой помощью или пожаловаться на игрока можно через /ask и /rep соответственно.',
    },
  ]

  count = 0

  constructor() {
    for (var key in this.#selectors) {
      if (key != 'userCharacters') {
        let selectr = document.querySelector('.' + this.#selectors[key])
        this.#selectors[key] = selectr
      } else {
        let selectr = document.querySelectorAll('.' + this.#selectors[key])
        this.#selectors[key] = selectr
      }
    }

    for (let key in this.#selectorsID) {
      let selectr = document.querySelector('#' + this.#selectorsID[key])
      this.#selectorsID[key] = selectr
    }

    let sl = this.#selectors
    let selectorsID = this.#selectorsID

    console.log(selectorsID)

    //events
    this.events(sl, selectorsID)

    //Circle
    this.radius = sl.progressRing.r.baseVal.value
    this.circumference = 2 * Math.PI * this.radius
    sl.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`
    sl.progressRing.style.strokeDashoffset = this.circumference
  }
  set progressCircle(percent) {
    let sl = this.#selectors
    const offset = this.circumference - (percent / 100) * this.circumference
    sl.progressRing.style.strokeDashoffset = offset
  }
  set progressBar(percent) {
    let sl = this.#selectors
    sl.progressBar.style.width = `${percent}%`
  }
  set update(percent) {
    let sl = this.#selectors
    if (percent == 1) {
      sl.downloadButton.remove()
      this.selectors_toggle([sl.progressBlock, sl.downloadInfo, sl.progressBar, sl.onlineBlock])
    }
    this.progressBar = percent
    this.progressCircle = percent
    if (percent == 100) {
      this.selectors_toggle([sl.progressBlock, sl.downloadInfo, sl.progressBar, sl.onlineBlock])
      sl.downloadBlock.innerHTML = this.#play_button
      sl.progressHover.classList.add(sl.progressHover.classList[0] + this.#active)
    }
  }
  set page(p) {
    let sl = this.#selectors[p + 'Page']
    if (p != this.page_name) {
      this.page = this.page_name
    }
    sl.classList.toggle(sl.classList[0] + this.#active)
    this.lastPage = this.page_name
    this.page_name = p
  }
  get page() {
    return this.#selectors[this.page_name + 'Page']
  }
  get pageLast() {
    return this.#selectors[this.lastPage + 'Page']
  }
  timeConverter(UNIX_timestamp) {
    let a = new Date(UNIX_timestamp * 1000)
    let months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    let year = a.getFullYear()
    let month = months[a.getMonth()]
    let date = a.getDate()
    let hour = a.getHours()
    let min = a.getMinutes()
    let sec = a.getSeconds()
    // формируем строку со временем по формату "00 мес 0000 00:00:00"
    let time = `${date} ${month} ${year} `
    time += (hour < 10 ? '0' : '') + hour
    time += (min < 10 ? ':0' : ':') + min
    time += (sec < 10 ? ':0' : ':') + sec
    return time
  }
  events(sl, selectorsID) {
    ipcRenderer.on('error-method', (event, data) => {
      switch (data.error) {
        case 101:
          // text: "Заполните все поля!"
          this.errorBlockHandle(sl, 'Заполните все поля', 101)
          break
        case 102:
          if (this.page_name == 'error') {
            sl.userCharactersList.innerHTML = ''
            sl.mainPage.classList.add(sl.mainPage.classList[0] + this.#hidden)
            if (sl.errorReason.classList.contains(sl.errorReason.classList[0] + this.#active)) {
              sl.errorReason.classList.remove(sl.errorReason.classList[0] + this.#active)
            }
            sl.errorTipBlock.classList.remove(sl.errorTipBlock.classList[0] + this.#active)
            setTimeout(() => {
              sl.errorReasonText.textContent = 'Подключение восстановлено, перенаправление!'
              sl.reconnectionTimer.textContent = ''
              sl.errorWaitingPoints.textContent = ''
              sl.errorReason.classList.add(sl.errorReason.classList[0] + this.#active)
              setTimeout(() => {
                this.page.classList.add(this.page.classList[0] + this.#hidden)
                setTimeout(() => {
                  this.page = 'login'
                  setTimeout(() => {
                    sl.loginLogo.classList.remove(sl.loginLogo.classList[1] + this.#hidden)
                    sl.loginAside.classList.remove(sl.loginAside.classList[0] + this.#hidden)
                    this.errorBlockHandle(sl, 'Такого пользователя не существует или сессия истекла', 102)
                    this.count = 0
                  }, 100)
                }, 500)
                if (sl.loginInput2FA.hasAttribute('required')) {
                  sl.loginInput2FA.value = ''
                  sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#hidden)
                  setTimeout(() => {
                    sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#active)
                    sl.loginInput2FA.removeAttribute('required')
                  }, 300)
                }
              }, 1000)
            }, 300)
          } else {
            this.errorBlockHandle(sl, 'Такого пользователя не существует или сессия истекла', 102)
          }
          break
        case 103:
          // text: "Вы уже авторизованы под этим аккаунтом!"
          this.errorBlockHandle(sl, 'Вы уже авторизованы под этим аккаунтом', 103)
          break
        case 104:
          // text: "Вы ввели неверный пароль!"
          this.errorBlockHandle(sl, 'Вы ввели неверный пароль', 104)
          break
        case 105:
          // text: "Неверный код двухфакторной аутентификации!"
          this.errorBlockHandle(sl, 'Неверный код двухфакторной аутентификации', 105)
          break
        case 106:
          break
        case 107:
          // text: "Произошла ошибка отправки кода. Возможно вы уже отправляли его менее минуты назад."
          this.errorBlockHandle(sl, 'Произошла ошибка отправки кода. Возможно, вы уже отправляли его менее минуты назад', 107)
          break
        case 109:
          this.errorBlockHandle(sl, 'Данный аккаунт заблокирован', 109)
      }
    })

    ipcRenderer.on('login-success', (event, data) => {
      console.log(data)
      sl.userGreeting.textContent = `Добро пожаловать, ${data.user_login}!`
      if (data.characters !== null) {
        for (let i = 0; i != data.characters.length; i++) {
          sl.userCharactersList.innerHTML += `
                        <li class="user__characters-item${data.characters[i].game === false ? ' user__characters-item--disabled' : ''}${
            data.characters[i].status == 'Отклонен' || data.characters[i].status == 'На одобрении' ? ' user__characters-item--denied' : ''
          }" data-game=${data.characters[i].game}>
                            <div class="user__characters-image skin" data-skin=${data.characters[i].skin}></div>
                            <div class="user__characters-info">
                                <span class="user__characters-nickname">${data.characters[i].name}</span>
                                <span class="user__characters-status">${data.characters[i].status}</span>
                            </div>
                            <!-- /.user__characters-info -->
                        </li>
                    `
        }
        ipcRenderer.on('console', (event, data) => {
          console.log(data)
        })

        this.#userCharactersNew = [].slice.call(document.querySelectorAll('.user__characters-item'))

        let userCharacters = this.#userCharactersNew
        let activeCharacter = null
        let activeNickname = null

        userCharacters.forEach((userCharacter) => {
          userCharacter.addEventListener('click', () => {
            if (
              !userCharacter.classList.contains(userCharacter.classList[0] + this.#disabled) &&
              !userCharacter.classList.contains(userCharacter.classList[0] + this.#denied)
            ) {
              if (activeCharacter) {
                // Удаляем активный класс с предыдущего активного элемента
                activeCharacter.classList.remove(activeCharacter.classList[0] + this.#active)
              }
              if (activeCharacter == userCharacter) {
                // Уведомляем пользователя о том, что персонаж уже выбран
                this.errorBlockHandle(sl, 'Вы уже выбрали данного персонажа', 200)
              }
              // Добавляем активный класс к текущему элементу
              userCharacter.classList.add(userCharacter.classList[0] + this.#active)
              activeNickname = userCharacter.querySelector('.user__characters-nickname').textContent
              activeCharacter = userCharacter
            } else {
              this.errorBlockHandle(sl, 'Данный персонаж недоступен для игры', 403)
            }
          })
        })
      } else {
        sl.userCharactersList.innerHTML =
          '<h2 class="user__title">Персонажей нет</h2><p class="user__characters-empty">Добавьте персонажа в своём <a href="gambit-rp.ru/account/profile" target="_blank" class="user__link">Личном Кабинете</a></p>'
        let emptyCharactersLink = document.querySelector('.user__characters-empty').querySelector('.user__link')
        emptyCharactersLink.ondragstart = function () {
          return false
        }
        emptyCharactersLink.addEventListener('click', (e) => {
          e.preventDefault()
          const href = emptyCharactersLink.getAttribute('href')
          ipcRenderer.send('open-link', href)
        })
      }

      if (this.page_name == 'preloader') {
        sl.preloaderTitle.classList.remove(sl.preloaderTitle.classList[0] + this.#active)
        sl.preloaderTipBlock.classList.remove(sl.preloaderTipBlock.classList[0] + this.#active)
        setTimeout(() => {
          sl.preloaderTitle.textContent = 'Подключение установлено'
          sl.preloaderTitle.classList.add(sl.preloaderTitle.classList[0] + this.#active)
          setTimeout(() => {
            sl.loginLogo.classList.add(sl.loginLogo.classList[1] + this.#hidden)
            sl.loginAside.classList.add(sl.loginAside.classList[0] + this.#hidden)
            setTimeout(() => {
              this.page = 'main'
              this.count = 0
              setTimeout(() => {
                sl.mainPage.classList.remove(sl.mainPage.classList[0] + this.#hidden)
              }, 100)
            }, 300)
          }, 1000)
        }, 300)
        return
      }
      if (this.page_name == 'error') {
        if (sl.errorReason.classList.contains(sl.errorReason.classList[0] + this.#active)) {
          sl.errorReason.classList.remove(sl.errorReason.classList[0] + this.#active)
        }
        sl.errorTipBlock.classList.remove(sl.errorTipBlock.classList[0] + this.#active)
        setTimeout(() => {
          sl.errorReasonText.textContent = 'Подключение восстановлено, перенаправление!'
          sl.reconnectionTimer.textContent = ''
          sl.errorWaitingPoints.textContent = ''
          sl.errorReason.classList.add(sl.errorReason.classList[0] + this.#active)
          setTimeout(() => {
            this.page.classList.add(this.page.classList[0] + this.#hidden)
            setTimeout(() => {
              this.page = this.lastPage
              setTimeout(() => {
                this.page.classList.remove(this.page.classList[0] + this.#hidden)
                this.count = 0
              }, 300)
            }, 500)
          }, 1000)
        }, 300)
        return
      }
      sl.loginLogo.classList.add(sl.loginLogo.classList[1] + this.#hidden)
      sl.loginAside.classList.add(sl.loginAside.classList[0] + this.#hidden)
      setTimeout(() => {
        this.page = 'main'
        setTimeout(() => {
          sl.mainPage.classList.remove(sl.mainPage.classList[0] + this.#hidden)
        }, 100)
      }, 300)
    })

    ipcRenderer.on('login-twofactor', (event, data) => {
      sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#hidden)
      setTimeout(() => {
        sl.loginInput2FA.focus()
        sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#active)
        sl.loginInput2FA.setAttribute('required', 'required')
      }, 300)
    })

    ipcRenderer.on('settings', (event, data, relaunch, version) => {
      this.#settings.data = data
      this.#settings.relaunch = relaunch

      sl.settingVersion.textContent = version
      selectorsID.settingCheckboxLaunchOnLoad.checked = data.launchOnLoad
      selectorsID.settingCheckboxWideScreen.checked = data.wideScreen
      selectorsID.settingCheckboxWindowScreen.checked = data.windowScreen
      selectorsID.settingCheckboxDebugLog.checked = data.debugLog
      selectorsID.settingCheckboxMaxDownloadSpeed.value = data.maxDownloadSpeed
      if (data.debugLog == true) {
        sl.settingLogButton.classList.remove(sl.settingLogButton.classList[0] + this.#hidden)
      }
    })

    ipcRenderer.on('logout', (event, data) => {
      if (this.page_name == 'error') {
        return
      }
      sl.userCharactersList.innerHTML = ''
      sl.userNotificationsList.innerHTML = ''
      sl.profileButton.classList.remove(sl.profileButton.classList[1] + this.#notification)
      sl.userGoToNotifications.classList.remove(sl.userGoToNotifications.classList[0] + this.#active)
      sl.mainPage.classList.add(sl.mainPage.classList[0] + this.#hidden)
      setTimeout(() => {
        this.page = 'login'
        setTimeout(() => {
          sl.loginLogo.classList.remove(sl.loginLogo.classList[1] + this.#hidden)
          sl.loginAside.classList.remove(sl.loginAside.classList[0] + this.#hidden)
          selectorsID.mainpageRegularNews.innerHTML = ''
          selectorsID.mainpageSliderNews.innerHTML = ''
          selectorsID.mainpageFixedNews.innerHTML = ''
        }, 100)
      }, 500)
      if (sl.loginInput2FA.hasAttribute('required')) {
        sl.loginInput2FA.value = ''
        sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#hidden)
        setTimeout(() => {
          sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#active)
          sl.loginInput2FA.removeAttribute('required')
        }, 300)
      }
    })

    ipcRenderer.on('session_not_found', (event, data) => {
      selectorsID.mainpageRegularNews.innerHTML = ''
      selectorsID.mainpageSliderNews.innerHTML = ''
      selectorsID.mainpageFixedNews.innerHTML = ''
      if (this.page_name == 'preloader') {
        sl.preloaderTitle.classList.remove(sl.preloaderTitle.classList[0] + this.#active)
        sl.preloaderTipBlock.classList.remove(sl.preloaderTipBlock.classList[0] + this.#active)
        setTimeout(() => {
          sl.preloaderTitle.textContent = 'Подключение установлено'
          sl.preloaderTitle.classList.add(sl.preloaderTitle.classList[0] + this.#active)
          setTimeout(() => {
            this.page = 'login'
            this.count = 0
          }, 1500)
        }, 300)
      } else if (this.page_name == 'error') {
        if (sl.errorReason.classList.contains(sl.errorReason.classList[0] + this.#active)) {
          sl.errorReason.classList.remove(sl.errorReason.classList[0] + this.#active)
        }
        sl.errorTipBlock.classList.remove(sl.errorTipBlock.classList[0] + this.#active)
        setTimeout(() => {
          sl.errorReasonText.textContent = 'Подключение восстановлено, перенаправление!'
          sl.reconnectionTimer.textContent = ''
          sl.errorWaitingPoints.textContent = ''
          sl.errorReason.classList.add(sl.errorReason.classList[0] + this.#active)
          setTimeout(() => {
            this.page.classList.add(this.page.classList[0] + this.#hidden)
            setTimeout(() => {
              this.page = 'login'
              setTimeout(() => {
                sl.loginLogo.classList.remove(sl.loginLogo.classList[1] + this.#hidden)
                sl.loginAside.classList.remove(sl.loginAside.classList[0] + this.#hidden)
                this.count = 0
              }, 100)
            }, 500)
          }, 1000)
        }, 300)
      }
    })

    ipcRenderer.on('console', (event, data) => {
      console.log(data)
    })

    ipcRenderer.on('page_open', (event, data) => {
      this.page = data
    })

    ipcRenderer.on('reconnection', (event, data) => {
      if (this.page_name == 'error') {
        //Просто выводим количество переподключений (data)
        sl.reconnectionTimer.textContent = data
        if (typeof data === 'number' && data % 3 === 0) {
          if (this.count != this.tipTexts.length) {
            this.tipHandle(sl, this.tipTexts[this.count], this.page_name)
            this.count++
          } else {
            this.tipHandle(sl, this.tipTexts[0], this.page_name)
            this.count = 1
          }
        }
        return
      } else if (this.page_name == 'preloader') {
        sl.preloaderTitle.classList.remove(sl.preloaderTitle.classList[0] + this.#active)
        setTimeout(() => {
          sl.preloaderTitle.textContent = 'Проблемы с подключением, переподключаемся...'
          sl.preloaderTitle.classList.add(sl.preloaderTitle.classList[0] + this.#active)
          if (typeof data === 'number' && data % 3 === 0) {
            if (this.count != this.tipTexts.length) {
              this.tipHandle(sl, this.tipTexts[this.count], this.page_name)
              this.count++
            } else {
              this.tipHandle(sl, this.tipTexts[0], this.page_name)
              this.count = 1
            }
          }
        }, 300)
        return
      }
      sl.userCharactersList.innerHTML = ''
      sl.userNotificationsList.innerHTML = ''
      sl.errorReasonText.textContent = 'Переподключение '
      sl.reconnectionTimer.textContent = '1'
      sl.errorWaitingPoints.textContent = '...'
      if (this.page_name == 'login') {
        setTimeout(() => {
          this.page = 'error'
          setTimeout(() => {
            sl.loginLogo.classList.add(sl.loginLogo.classList[1] + this.#hidden)
            sl.loginAside.classList.add(sl.loginAside.classList[0] + this.#hidden)
            setTimeout(() => {
              this.page.classList.remove(this.page.classList[0] + this.#hidden)
            }, 500)
          }, 100)
        }, 500)
        return
      }
      this.page.classList.add(this.page.classList[0] + this.#hidden)
      setTimeout(() => {
        this.page = 'error'
        setTimeout(() => {
          this.page.classList.remove(this.page.classList[0] + this.#hidden)
        }, 500)
      }, 300)
      // Обновляем страницу при первом переподключении
    })

    ipcRenderer.on('online', (event, data) => {
      sl.onlineCounter.innerHTML = data
    })

    ipcRenderer.on('widgets', (event, data) => {
      console.log(data)
      let firstDisplayElements, secondDisplayElements, thirdDisplayElements
      if (data == null) {
        firstDisplayElements = []
        secondDisplayElements = []
        thirdDisplayElements = []
      } else {
        firstDisplayElements = data.filter((item) => item.display == 1)
        secondDisplayElements = data.filter((item) => item.display == 2)
        thirdDisplayElements = data.filter((item) => item.display == 3)
      }

      let types = ['none', 'Cообщество', 'Мероприятие']

      if (!firstDisplayElements.length == 0) {
        for (let i = 0; i != firstDisplayElements.length; i++) {
          this.#selectorsID.mainpageRegularNews.innerHTML += `
                    <a tabindex="-1" href="${firstDisplayElements[i].url}" title="${
            firstDisplayElements[i].header
          }" target="_blank" class="mainpage__update-link">
                        <img src="${firstDisplayElements[i].image}" alt="${
            firstDisplayElements[i].header
          }" class="mainpage__update-image" />
                        <div class="mainpage__update-info">
                            <h2 class="mainpage__update-title">${firstDisplayElements[i].header}</h2>
                            <p class="mainpage__update-subtitle">${firstDisplayElements[i].description}</p>
                            <span class="mainpage__update-date">${this.timeConverter(firstDisplayElements[i].date)}</span>
                        </div>
                        <!-- /.mainpage__update-info -->
                    </a>
                    `
        }
      } else {
        this.#selectorsID.mainpageRegularNews.classList.add(this.#selectorsID.mainpageRegularNews.classList[0] + this.#active)
        this.#selectorsID.mainpageRegularNews.innerHTML = `
                <span class="mainpage__updates-empty">Информация отсутствует</span>
                `
      }

      if (!secondDisplayElements.length == 0) {
        for (let i = 0; i != secondDisplayElements.length; i++) {
          this.#selectorsID.mainpageSliderNews.innerHTML += `
                    <a tabindex="-1" href="${secondDisplayElements[i].url}" target="_blank" title="${
            secondDisplayElements[i].header
          }" class="swiper-slide">
                        <span class="slider__topic">${types[secondDisplayElements[i].type]}</span>
                        <img class="slider__image" src="${secondDisplayElements[i].image}" alt="${secondDisplayElements[i].header}" />
                    </a>
                    `
        }
        const swiper = new /* eslint-disable-line */ Swiper('.mainpage__update-slider', {
          // Optional parameters
          direction: 'horizontal',
          loop: true,

          autoplay: {
            disableOnInteraction: false,
            delay: 3500,
          },

          // If we need pagination
          pagination: {
            el: '.swiper-pagination',
          },

          // Navigation arrows
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        })
      } else {
        sl.mainpageSlider.classList.add(sl.mainpageSlider.classList[1] + this.#active)
        sl.mainpageSlider.innerHTML = `
                <span class="mainpage__updates-empty">Нет данных</span>
                `
      }

      if (!thirdDisplayElements.length == 0) {
        for (let i = 0; i != thirdDisplayElements.length; i++) {
          if (i != 2) {
            this.#selectorsID.mainpageFixedNews.innerHTML += `
                        <a tabindex="-1" href="${thirdDisplayElements[i].url}" title="${
              thirdDisplayElements[i].header
            }" target="_blank" class="mainpage__update-important">
                            <span class="mainpage__update-topic">${types[thirdDisplayElements[i].type]}</span>
                            <img
                                class="mainpage__update-image"
                                src="${thirdDisplayElements[i].image}"
                                alt="${thirdDisplayElements[i].header}"
                            />
                        </a>
                        `
          }
        }
      } else {
        this.#selectorsID.mainpageFixedNews.classList.add(this.#selectorsID.mainpageFixedNews.classList[0] + this.#active)
        this.#selectorsID.mainpageFixedNews.innerHTML = `
                <div class="mainpage__update-content mainpage__update-content--active nodrag">
                    <span class="mainpage__updates-empty">Информация отсутствует</span>
                </div>
                <!-- /.mainpage__update-content -->
                `
      }

      // Открытие ссылок в новой вкладке и отключение драга
      document.querySelectorAll("a[target='_blank']").forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault()
          const href = link.getAttribute('href')
          ipcRenderer.send('open-link', href)
        })
      })

      document.querySelectorAll('a').forEach((link) => {
        link.ondragstart = function () {
          return false
        }
      })

      //Все параметры в websocket.ts WidgetRequest
      //display(1 - Скролл меню, 2 - слайдер, 3 - два блока)
      //type(1 - Сообщество, 2 - Мероприятие... Функционально, возможно добавим или изменим)
      //Остальное думаю понятно. Если header и description некуда выводить(в случае 2 и 3 дисплея), можно попробовать у ссылки тайтл сделать(как ты в тг предложил)
    })

    ipcRenderer.on('notification', (event, data) => {
      if (data.messages !== null) {
        if (sl.userNotificationsList.hasChildNodes()) {
          sl.userNotificationsList.removeChild(sl.userNotificationsList.childNodes[0])
        }
        for (let i = 0; i != data.messages.length; i++) {
          let date = this.timeConverter(data.messages[i].date)
          let classes = `user__notifications-item${data.messages[i].status == -1 ? ' user__notifications-item--active' : ''}`

          let card = document.createElement('li')
          card.className = `${classes}`
          card.innerHTML = `
                        <span class="user__notifications-date">${date}</span>
                        <p class="user__notifications-info">${data.messages[i].text}</p>
                    `
          sl.userNotificationsList.prepend(card)
        }

        if (data.messages.some((item) => item.status == -1)) {
          // Какая-то логика для индикации непрочитанных уведомлений
          sl.profileButton.classList.add(sl.profileButton.classList[1] + this.#notification)
          sl.userGoToNotifications.classList.add(sl.userGoToNotifications.classList[0] + this.#active)
        } else {
          // Какая-то логика для удаления индикации непрочитанных уведомлений
          sl.profileButton.classList.remove(sl.profileButton.classList[1] + this.#notification)
          sl.userGoToNotifications.classList.remove(sl.userGoToNotifications.classList[0] + this.#active)
        }

        this.#userNotificationsNew = [].slice.call(document.querySelectorAll('.user__notifications-item'))
        this.notificationsHandler(sl, this.#userNotificationsNew)
      } else {
        console.log('Список уведомлений пуст.')
        sl.userNotificationsList.innerHTML = "<h2 class='user__title'>Уведомлений нет</h2>"
      }
    })

    sl.burgerButton.addEventListener('click', () => {
      this.selectors_toggle([sl.burgerButton, sl.burgerMenu])
    })

    sl.downloadButton.addEventListener('click', () => {
      // this.update = 1;
      /* УДАЛИТЬ КОД 96-99 строк на проде, снять комментарий с 94-ой строки */
      this.percent_update(1)
    })

    sl.downloadButton.addEventListener('mouseenter', () => {
      sl.progressHover.classList.add(sl.progressHover.classList[0] + this.#active)
    })

    sl.downloadButton.addEventListener('mouseleave', () => {
      sl.progressHover.classList.remove(sl.progressHover.classList[0] + this.#active)
    })

    sl.settingButton.addEventListener('click', () => {
      if (this.page_name == 'preloader' || this.page_name == 'error') {
        return
      }
      this.selectors_toggle([sl.settingButton, sl.settingBlock])
    })

    sl.settingLogButton.addEventListener('click', (e) => {
      e.preventDefault()
      ipcRenderer.send('open_logs')
    })

    sl.settingSubmitButton.addEventListener('click', (e) => {
      e.preventDefault()
      //this.selectors_toggle([sl.settingButton, sl.settingBlock]);
      let speed = selectorsID.settingCheckboxMaxDownloadSpeed.value

      speed = speed < 1000 || speed == '' ? 1000 : speed

      selectorsID.settingCheckboxMaxDownloadSpeed.value = speed

      let object = {
        launchOnLoad: selectorsID.settingCheckboxLaunchOnLoad.checked,
        wideScreen: selectorsID.settingCheckboxWideScreen.checked,
        windowScreen: selectorsID.settingCheckboxWindowScreen.checked,
        debugLog: selectorsID.settingCheckboxDebugLog.checked,
        maxDownloadSpeed: speed,
      }

      let message = 'Настройки были сохранены успешно'

      for (const key in object) {
        // if (object[key] != this.#settings.data[key] && this.#settings.relaunch.includes(key)) {
        if (object[key]) {
          message = 'Настройки успешно сохранены. Приложение будет перезапущено.'
        }
      }
      this.errorBlockHandle(sl, message, 'saveSettings')
      ipcRenderer.send('saveSettings', object)
      this.#settings.data = object
    })

    sl.hideButton.addEventListener('click', () => {
      ipcRenderer.send('minimize')
    })
    // SIMULATOR BUTTONS EVENTS START
    sl.loginButtonTest.addEventListener('click', () => {
      ipcRenderer.send('loginTestSuccess')
    })
    sl.reconnectButton.addEventListener('click', () => {
      let isReconnecting = sl.reconnectButton.dataset.reconnecting
      ipcRenderer.send('reconnection', 1, isReconnecting === 'false' ? 'start' : 'stop')
      // sl.reconnectButton.setAttribute("disabled", "disabled");
      sl.reconnectButton.textContent = isReconnecting === 'false' ? 'Stop Reconnection' : 'Initiate Reconnect'
      sl.reconnectButton.dataset.reconnecting = isReconnecting === 'false' ? 'true' : 'false'
    })
    sl.authButton.addEventListener('click', () => {
      ipcRenderer.send('login-twofactor')
      sl.authButton.setAttribute('disabled', 'disabled')
    })
    // SIMULATOR BUTTONS EVENTS END
    sl.closeButton.addEventListener('click', () => {
      ipcRenderer.send('window-all-closed')
    })

    sl.profileButton.addEventListener('click', () => {
      if (!sl.userCharactersContent.classList.contains(sl.userCharactersContent.classList[0] + this.#active)) {
        this.userContentHandle(sl, 'notifications')
      }
      if (sl.userBlock.classList.contains(sl.userBlock.classList[0] + this.#hidden)) {
        sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#hidden)
        setTimeout(() => {
          sl.profileButton.classList.toggle(sl.profileButton.classList[1] + this.#active)
          sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#active)
        }, 100)
      } else {
        sl.profileButton.classList.toggle(sl.profileButton.classList[1] + this.#active)
        sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#active)
        setTimeout(() => {
          sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#hidden)
        }, 300)
      }
    })

    sl.userLogout.addEventListener('click', (e) => {
      e.preventDefault()
      sl.profileButton.classList.toggle(sl.profileButton.classList[1] + this.#active)
      sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#active)
      setTimeout(() => {
        sl.userBlock.classList.toggle(sl.userBlock.classList[0] + this.#hidden)
        ipcRenderer.send('logout')
      }, 300)
    })

    sl.userGoToNotifications.addEventListener('click', (e) => {
      e.preventDefault()
      this.userContentHandle(sl, 'characters')
    })

    sl.userGoToCharacters.addEventListener('click', (e) => {
      e.preventDefault()
      this.userContentHandle(sl, 'notifications')
    })

    sl.loginButton.addEventListener('click', (e) => {
      let login = sl.loginInputNick.value.trim()
      let password = sl.loginInputPass.value.trim()
      let twofactor = sl.loginInput2FA.value.trim() == '' ? 0 : new Number(sl.loginInput2FA.value.trim())
      if (login.length == 0 || password.length == 0 || (sl.loginInput2FA.hasAttribute('required') && twofactor == '')) {
        return
      }
      e.preventDefault()
      ipcRenderer.send('login', login, password, twofactor)
    })

    sl.crashButton.addEventListener('click', (e) => {
      e.preventDefault()
      ipcRenderer.send('window-all-closed')
    })

    document.querySelectorAll("a[target='_blank']").forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const href = link.getAttribute('href')
        ipcRenderer.send('open-link', href)
      })
    })

    document.querySelectorAll('a').forEach((link) => {
      link.ondragstart = function () {
        return false
      }
    })
  }

  selectors_toggle(selectors) {
    selectors.forEach((selector) => {
      selector.classList.toggle(selector.classList[0] + this.#active)
    })
  }

  percent_update(percent) {
    if (percent <= 100) {
      this.update = percent
      setTimeout(() => {
        this.percent_update(percent + 1)
      }, 100)
    } else {
      return
    }
  }
  // percent_update() удалить на проде
  setText(cl, text) {
    document.querySelector('.' + cl).innerHTML = text
  }

  hideTwoFactor(sl) {
    sl.loginInput2FA.classList.remove(sl.loginInput2FA.classList[0] + this.#active)
    setTimeout(() => {
      sl.loginInput2FA.classList.add(sl.loginInput2FA.classList[0] + this.#hidden)
      sl.loginInput2FA.removeAttribute('required')
    }, 300)
    return
  }

  errorBlockHandle(sl, text, type) {
    sl.errorMsgBlockText.textContent = text
    if (type == 'saveSettings') {
      if (!sl.errorMsgBlock.classList.contains(sl.errorMsgBlock.classList[0] + '--access')) {
        sl.errorMsgBlock.classList.add(sl.errorMsgBlock.classList[0] + '--access')
      }
    } else {
      if (sl.errorMsgBlock.classList.contains(sl.errorMsgBlock.classList[0] + '--access')) {
        sl.errorMsgBlock.classList.remove(sl.errorMsgBlock.classList[0] + '--access')
      }
    }

    sl.errorMsgBlock.classList.toggle(sl.errorMsgBlock.classList[0] + this.#active)
    setTimeout(() => {
      sl.errorMsgBlock.classList.toggle(sl.errorMsgBlock.classList[0] + this.#active)
    }, 3000)

    switch (type) {
      case 102:
      case 103:
        sl.loginInputNick.value = ''
        sl.loginInputPass.value = ''
        break
      case 104:
        sl.loginInputPass.value = ''
        break
      case 105:
      case 107:
        sl.loginInput2FA.value = ''
        break
      case 109:
        break
      case 200:
        break
      case 403:
        break
    }
  }

  tipHandle(sl, text, page_name) {
    if (page_name == 'error') {
      if (sl.errorTipBlock.classList.contains(sl.errorTipBlock.classList[0] + this.#active)) {
        sl.errorTipBlock.classList.remove(sl.errorTipBlock.classList[0] + this.#active)
      }
      setTimeout(() => {
        sl.errorTipTitle.textContent = text.title
        sl.errorTipText.textContent = text.text
        setTimeout(() => {
          sl.errorTipBlock.classList.add(sl.errorTipBlock.classList[0] + this.#active)
        }, 500)
      }, 500)
      return
    } else if (page_name == 'preloader') {
      if (sl.preloaderTipBlock.classList.contains(sl.preloaderTipBlock.classList[0] + this.#active)) {
        sl.preloaderTipBlock.classList.remove(sl.preloaderTipBlock.classList[0] + this.#active)
      }
      setTimeout(() => {
        sl.preloaderTipTitle.textContent = text.title
        sl.preloaderTipText.textContent = text.text
        setTimeout(() => {
          sl.preloaderTipBlock.classList.add(sl.preloaderTipBlock.classList[0] + this.#active)
        }, 500)
      }, 500)
      return
    }
  }

  userContentHandle(sl, currentContent) {
    if (currentContent == 'characters') {
      sl.userCharactersContent.classList.toggle(sl.userCharactersContent.classList[0] + this.#active)
      setTimeout(() => {
        sl.userCharactersContent.classList.toggle(sl.userCharactersContent.classList[0] + this.#hidden)
        sl.userNotificationsContent.classList.toggle(sl.userNotificationsContent.classList[0] + this.#hidden)
        setTimeout(() => {
          sl.userNotificationsContent.classList.toggle(sl.userNotificationsContent.classList[0] + this.#active)
        })
      }, 300)
    } else if (currentContent == 'notifications') {
      sl.userNotificationsContent.classList.toggle(sl.userNotificationsContent.classList[0] + this.#active)
      setTimeout(() => {
        sl.userNotificationsContent.classList.toggle(sl.userNotificationsContent.classList[0] + this.#hidden)
        sl.userCharactersContent.classList.toggle(sl.userCharactersContent.classList[0] + this.#hidden)
        setTimeout(() => {
          sl.userCharactersContent.classList.toggle(sl.userCharactersContent.classList[0] + this.#active)
        })
      }, 300)
    }
  }

  notificationsHandler(sl, notificationsArray) {
    if (notificationsArray.some((item) => item.classList.contains(item.classList[0] + this.#active))) {
      // Обновление логики индикации непрочтённых уведомлений
    }
    notificationsArray.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault()
        item.classList.remove(item.classList[0] + this.#active)
        if (!notificationsArray.some((item) => item.classList.contains(item.classList[0] + this.#active))) {
          // Удаление любой индикации непрочтённости уведомлений
          sl.profileButton.classList.remove(sl.profileButton.classList[1] + this.#notification)
          sl.userGoToNotifications.classList.remove(sl.userGoToNotifications.classList[0] + this.#active)
        }
      })
    })
  }
}
