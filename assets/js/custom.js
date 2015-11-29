/** Put your custom JS code here **/

var ti = document.getElementById('tokenInput');

var vm = new Vue({
    el: '#app',
    data: {
        token: loadData('token')
    },
    methods: {
        tokensave: function() {
            this.token = ti.value;
            saveData({token: this.token});

        },
        tokenshow: function() {
            if (ti.type == "password") {
                ti.type = "text";
            } else {
                ti.type = "password";
            }
        },
        doThis: function() {
            this.$http.get('/api.php', {}, function(data, status, request) {
                console.log(data, status, request);
            });
        }
    },
    http: {
        root: '/'
    }
});

/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    Non-vue logic here
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **/

/**
 * Saves data to localStorage, clears old data first
 * @param data
 */
function saveData(data) {
    if (data !== undefined) {
        saveData();

        for (property in Object.keys(data))

        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                localStorage.setItem(property, data[property]);
            }
        }
    } else {
        localStorage.clear();
    }
}

/**
 * Loads given value from localStorage, or empty string if it isn't set.
 * @param key
 * @returns {string}
 */
function loadData(key) {
    if (key !== undefined) {
        return localStorage.getItem(key) || '';
    }
    console.error("Key must be defined! I don't know what to load!");
}