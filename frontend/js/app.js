class app extends view {
    #session = null;
    login(input, check) {
        let login = input[0];
        let password = input[1];
        
        let response = AppAction.login(login, password, check)
    }

}