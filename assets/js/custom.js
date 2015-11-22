/** Put your custom JS code here **/

var ti = document.getElementById('tokenInput');

var vm = new Vue({
    el: '#app',
    data: {
        token: localStorage.getItem('token') || ''
    },
    methods: {
        tokensave: function() {
            this.token = ti.value;
            localStorage.setItem('token', this.token);

        },
        tokenshow: function() {
            console.log("here1");
            if (ti.type == "password") {
                ti.type = "text";
            } else {
                ti.type = "password";
            }
        }
    }
});