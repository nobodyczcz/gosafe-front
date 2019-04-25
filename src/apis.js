import $ from 'jquery';


class APIs {
    constructor() {
        this.url = window.serverUrl;
        this.tokenKey = 'accessToken';


    }

    callApi(api,data,success,error) {

            var token = sessionStorage.getItem(this.tokenKey);
            var headers = {};
            if (token) {
                headers.Authorization = 'Bearer ' + token;
            }

            $.ajax({
                type: 'POST',
                url: this.url+api,
                headers: headers,
                data: JSON.stringify(data)
            }).done(success).fail(error);
    
    }


    register(regdata,success,error) {

        console.log(JSON.stringify(regdata))
        $.ajax({
            type: 'POST',
            url: this.url+'api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(regdata)
        }).done(
            success
            ).fail(error
            );
    }

    login(loginData,success,error) {

        $.ajax({
            type: 'POST',
            url: this.url+'/Token',
            data: loginData
        }).done(function (data) {
            // Cache the access token in session storage.
            sessionStorage.setItem(this.tokenKey, data.access_token);
            success(data);
            }).fail(error);
    }

    logout(error) {
        // Log out from the cookie based logon.
        var token = sessionStorage.getItem(this.tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'POST',
            url: this.url+'/api/Account/Logout',
            headers: headers
        }).done(function (data) {
            // Successfully logged out. Delete the token.
            this.user('');
            sessionStorage.removeItem(this.tokenKey);
        }).fail(error);
    }

}

export default APIs;