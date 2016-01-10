// When set to true, outputs full stack trace with every warning
Vue.config.debug = true;

var store = {
        config: {
            dateFormat: "DD.MM.YYYY.",
            apiUrl: "/api.php",
            callsChart: {
                "days": 31,
                "startDate": moment().subtract(31, 'days'),
                "endDate": moment()
            }
        },
        state: {
            overlay: false,
            token: localStorage.getItem('token')
        },
        showOverlay: function (bool) {
            this.state.overlay = (bool === true);
        },
        updateToken: function(token) {
            this.state.token = token;
            localStorage.setItem('token', token);
        }
    };

var App = Vue.extend({
    data: function () {
        return {
            sharedState: store.state,
            privateState: {}
        }
    },
    events: {
        'token-saved': function(value) {
            store.updateToken(value);
        },
        'request-data': function(range) {
            var days = Math.abs(moment(range.from).diff(moment(), 'days')) + 1;
            store.config.callsChart.startDate = range.from;
            store.config.callsChart.endDate = range.to;
            this._requestData(days);
        }
    },
    ready: function() {
        if (store.state.token) {
            console.log("Token ready:" + store.state.token);
        } else {
            console.log("Nope");
        }
    },
    methods: {
        _requestData(days) {
            console.log(days);
        }
    }
});


/*****************************************************************************
 * Router configuration below
 *****************************************************************************/

var router = new VueRouter({
    hashbang: false,
    linkActiveClass: 'active'
});

router.map({
    '/dashboard': {
        component: Dashboard
    },
    '/dashboard/chart/:from/:to': {
        name: 'chart',
        component: Dashboard
    },
    '/extra': {
        component: Something
    }
});

router.redirect({
    '/': '/dashboard'
});

router.start(App, '#app');