// Default date range to load at first
var defaultDays = 31;
// Default data structure to be used - also used to reset to initial state
var defaultInfo = {
    name: null,
    plan: null,
    token: null,
    range: null,
    calls: null,
    invoices: null
};

// When set to true, outputs full stack trace with every warning
Vue.config.debug = true;

var App = Vue.extend({
    data: function () {
        return {
            info: defaultInfo,
            options: {
                overlay: false,
                dateFormat: "DD.MM.YYYY.",
                apiUrl: "/api.php",
                callsChart: {
                    "days": defaultDays,
                    "startDate": moment().subtract(defaultDays, 'days'),
                    "endDate": moment()
                }
            }
        }
    },
    /**
     * When the main component loads (is ready),
     * cached data is restored and, if needed, re-fetched
     */
    ready: function () {
        this._loadData();
        if (this.info.token) {
            this._requestData(this.info.token, this.options.callsChart.days);
        }
    },
    events: {
        /**
         * This event occurs when the token input field is used
         * Once the data is reset and the ground is cleared for the new token,
         * new data for 31 days is fetched and all child components are notified
         * of the token change via $broadcast.
         * @param token
         */
        'token-saved': function (token) {
            localStorage.clear();
            this._requestData(token);
            this.$broadcast('token-saved', token);
        },
        /**
         * In progress - needs work
         * @param token
         * @param days
         * @param picker
         */
        'request-data': function (token, days, picker) {
            if (typeof days === 'object' && days !== null) {
                // date route
                this.options.callsChart.startDate = moment(days.from);
                this.options.callsChart.endDate = moment(days.to);
                this.options.callsChart.days = Math.abs(this.options.callsChart.startDate.diff(moment(), 'days') - 1);
            } else {
                // standard
                this.options.callsChart.days = Math.abs(picker.startDate.diff(moment(), 'days') - 1);
                this.options.callsChart.startDate = picker.startDate;
                this.options.callsChart.endDate = picker.endDate;
            }
            this._requestData(token, this.options.callsChart.days);
        },
        'hello': function (msg) {
            console.log(msg);
        }
    },
    methods: {
        /**
         * Used to fetch data from cache and put it into the App instance
         * @private
         */
        _loadData: function () {
            var cached = localStorage.getItem('cached');
            if (cached !== null) {
                cached = JSON.parse(cached);
            }
            this.info = jQuery.extend(true, this.info, cached);
        },
        /**
         * Note that on the API end, if less than 31 days are given, it defaults
         * back to 31. This is because shorter timespans don't get returned
         * faster, and we do all the charting and calculating on the client side
         * anyway, so there's no point in doing short-range fetches.
         *
         * @todo: needs work
         * @param token
         * @param days
         * @private
         */
        //
        _requestData: function (token, days) {
            if (days === undefined || days === null) {
                days = 31;
            }
            this.showOverlay(true);

            if (this._checkRefreshNeeded(days)) {
                this.$http.get(this.options.apiUrl, {
                    "token": token,
                    "days": days
                }, function (data, status, request) {
                    if (data.status == "OK") {
                        data['data']['token'] = token;
                        this._saveData(data['data']);

                        var filtered = this._filterCallRange(jQuery.extend(true, {}, data['data']['calls']));

                        this.chartData(filtered);
                    } else {
                        localStorage.clear();
                        this.info = defaultInfo;
                        swal("Oh noes!", "Looks like something went wrong: " + data.message + " (code: " + data.code + ")", "error");
                    }
                    this.showOverlay(false);
                }.bind(this));
            } else {
                // Refresh not needed
                var filtered = this._filterCallRange(jQuery.extend(true, {}, this.info.calls));
                this.chartData(filtered);
                this.showOverlay(false);
            }
        },
        /**
         * A refresh of data for a given token is needed if it's been more than
         * a day since the last fetch, if there is no cached data at all, and
         * if the requested range is bigger than the range in the cache.
         * @param days
         * @returns {boolean}
         * @private
         */
        _checkRefreshNeeded: function (days) {

            var refreshNeeded = false;

            if (this.info.range === null) {
                return true;
            }

            var nowFormatted = moment().format('YYYY-MM-DD');
            var toFormatted = moment(this.info.range.to).format('YYYY-MM-DD');
            var fromDiff = Math.abs(moment(this.info.range.from).diff(moment(nowFormatted), 'days'));

            if (moment(nowFormatted).isAfter(moment(toFormatted)) || fromDiff < days) {
                refreshNeeded = true;
            }

            return refreshNeeded;
        },
        /**
         * Saves the fetched data into localStorage
         * @param data
         * @private
         */
        _saveData: function (data) {
            localStorage.setItem('cached', JSON.stringify(data));
            this._loadData();
        },
        /**
         * Removes all the call values that aren't in the requested date range.
         * This is used for displaying on the chart.
         * @todo: needs work - where do we put this?
         * @param calls
         * @returns {*}
         * @private
         */
        _filterCallRange: function (calls) {
            var keys = Object.keys(calls);
            var dlen = keys.length;

            var startCheck = moment(this.options.callsChart.startDate.format()).subtract(1, 'days');
            var endCheck = this.options.callsChart.endDate;

            for (var i = 0; i < dlen; i++) {
                if (!moment(keys[i]).isBetween(startCheck, endCheck)) {
                    delete calls[keys[i]];
                }
            }
            return calls;
        },
        /**
         * Initializes the chart and plots the data passed in
         * @todo: to be moved into the Dashboard component
         * @param data
         */
        chartData: function (data) {

            var vals = Object.keys(data).map(function (key) {
                return data[key];
            });

            c3.generate({
                bindto: '#dashchart',
                data: {
                    x: 'x',
                    type: "bar",
                    columns: [
                        ['x'].concat(Object.keys(data)),
                        ['Number of calls'].concat(vals)
                    ],
                    axes: {
                        data1: 'y'
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%d.%m.%Y.'
                        }
                    }
                }
            });
        },
        /**
         * Switches the loading overlay on/off
         * @param bool
         */
        showOverlay: function (bool) {
            this.options.overlay = bool;
        }
    },
    http: {
        root: '/'
    }
});

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