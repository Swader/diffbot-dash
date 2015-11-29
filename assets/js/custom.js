/** Put your custom JS code here **/

var ti = document.getElementById('tokenInput');

var vm = new Vue({
    el: '#app',
    data: {
        info: {
            "name": null,
            "plan": null,
            "token": null
        },
        ui: {
            overlay: false
        }
    },
    ready: function() {
        this.info = this.loadData();
    },
    methods: {
        tokensave: function () {
            this.saveData();
            this.showOverlay(true);
            this.info.token = ti.value;
            this.$http.get('/api.php', {"token": this.info.token}, function (data, status, request) {

                if (data.status == "OK") {
                    data['data']['token'] = this.info.token;
                    this.saveData(data['data']);
                } else {
                    this.resetInfo();
                    swal("Oh noes!", "Looks like something went wrong: " + data.message + " (code: "+ data.code +")", "error");
                }

                this.showOverlay(false);
            });
        },
        tokenshow: function () {
            ti.type = (ti.type == "password") ? "text" : "password";
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
            this.info = {
                "name": null,
                "plan": null,
                "token": null
            }
        },
        showOverlay: function(bool) {
            this.ui.overlay = bool;
        }
    },
    http: {
        root: '/'
    }
});
