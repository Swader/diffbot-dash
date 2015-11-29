/** Put your custom JS code here **/

var ti = document.getElementById('tokenInput');

var info = {
    "name": null,
    "plan": null,
    "token": null
};

var vm = new Vue({
    el: '#app',
    data: {
        info: info,
        ui: {
            overlay: false
        }
    },
    ready: function () {
        this.info = this.loadData();
        if (this.info.token) {
            this.requestData(this.info.token);
        }
    },
    methods: {
        tokensave: function () {
            this.saveData();
            this.requestData(ti.value);
        },
        tokenshow: function () {
            ti.type = (ti.type == "password") ? "text" : "password";
        },
        requestData: function (token) {
            this.showOverlay(true);
            this.$http.get('/api.php', {"token": token}, function (data, status, request) {

                if (data.status == "OK") {
                    data['data']['token'] = token;
                    this.saveData(data['data']);
                } else {
                    this.resetInfo();
                    swal("Oh noes!", "Looks like something went wrong: " + data.message + " (code: " + data.code + ")", "error");
                }

                this.showOverlay(false);
            });
        },
        saveData: function (data) {
            if (data !== undefined) {
                this.saveData();
                for (var property in data) {
                    if (data.hasOwnProperty(property)) {
                        localStorage.setItem(property, data[property]);
                        this.info[property] = data[property];
                    }
                }
            } else {
                localStorage.clear();
            }
        },
        loadData: function () {
            return {
                "name": localStorage.getItem("name"),
                "plan": localStorage.getItem("plan"),
                "token": localStorage.getItem("token")
            }
        },
        resetInfo: function () {
            this.info = info;
        },
        showOverlay: function (bool) {
            this.ui.overlay = bool;
        }
    },
    http: {
        root: '/'
    }
});
