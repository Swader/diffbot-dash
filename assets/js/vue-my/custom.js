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
            token: localStorage.getItem('token'),
            cached: JSON.parse(localStorage.getItem('cached'))
        },
        showOverlay: function (bool) {
            this.state.overlay = (bool === true);
        },
        updateToken: function(token) {
            this.state.token = token;
            localStorage.clear();
            localStorage.setItem('token', token);
            this.cache(null);
        },
        cache: function (data) {
            this.state.cached = data;
            localStorage.setItem('cached', JSON.stringify(data));
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
            this._requestData();
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
            this._requestData();
        }
    },
    methods: {
        _requestData(days) {
            if (days === undefined || days === null) {
                days = 31;
            }
            store.showOverlay(true);

            if (this._dataRefreshNeeded(days)) {
                this.$http.get(store.config.apiUrl, {
                    "token": this.sharedState.token,
                    "days": days
                }, function (data, status, request) {
                    if (data.status == "OK") {
                        store.cache(data['data']);
                        this.$broadcast('data-refreshed', data['data']);
                    } else {
                        localStorage.clear();
                        swal("Oh noes!", "Looks like something went wrong: " + data.message + " (code: " + data.code + ")", "error");
                    }
                    store.showOverlay(false);
                }.bind(this));
            } else {
                this.$broadcast('data-refreshed', this.sharedState.cached);
                store.showOverlay(false);
            }
        },
        _dataRefreshNeeded(days) {
            if (this.sharedState.cached === null || this.sharedState.cached.range === null) {
                return true;
            }
            var nowFormatted = moment().format('YYYY-MM-DD');
            var toFormatted = moment(this.sharedState.cached.range.to).format('YYYY-MM-DD');
            var fromDiff = Math.abs(moment(this.sharedState.cached.range.from).diff(moment(nowFormatted), 'days'));

            return !!(moment(nowFormatted).isAfter(moment(toFormatted)) || fromDiff < (days - 1));

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