// @todo: convert it into a VueJS component?
var ti = document.getElementById('tokenInput');

var defaultDays = 31;
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

Vue.filter('momentify', function (value) {
    return moment(value).format("DD.MM.YYYY");
});

var vm = new Vue({
    el: '#app',
    data: {
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
    },
    ready: function () {
        this._loadData();
        if (this.info.token) {
            this._requestData(this.info.token, this.options.callsChart.days);
        }

        this.$nextTick(function () {
            vm.initRangePicker();
        });
    },
    methods: {
        tokensave: function (event) {
            event.target.blur();
            localStorage.clear();
            this._requestData(ti.value);
            this.initRangePicker();
        },
        tokenshow: function () {
            ti.type = (ti.type == "password") ? "text" : "password";
        },
        initRangePicker: function () {
            $("#rangepicker").daterangepicker({
                locale: {
                    format: vm.options.dateFormat
                },
                startDate: vm.options.callsChart.startDate,
                endDate: vm.options.callsChart.endDate,
                ranges: {
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 31 Days': [moment().subtract(30, 'days'), moment()],
                    'Last 6 months': [moment().subtract(6, 'months'), moment()],
                    'This year': [moment().startOf('year'), moment()],
                    'Last year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                    'This Month': [moment().startOf('month'), moment()],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                showDropdowns: true,
                maxDate: moment(),
                autoApply: true
            }).on('apply.daterangepicker', function (ev, picker) {
                vm.options.callsChart.days = Math.abs(picker.startDate.diff(moment(), 'days') - 1);
                vm.options.callsChart.startDate = picker.startDate;
                vm.options.callsChart.endDate = picker.endDate;
                vm._requestData(vm.info.token, vm.options.callsChart.days);
            });
        },
        _checkRefreshNeeded: function (days) {

            if (this.info.range === null) {
                console.log("Cached data not present.");
                return true;
            }

            var refreshNeeded = false;

            var nowFormatted = moment().format('YYYY-MM-DD');
            var toFormatted = moment(this.info.range.to).format('YYYY-MM-DD');
            var fromDiff = Math.abs(moment(this.info.range.from).diff(moment(nowFormatted), 'days'));

            //console.log("Comparing NOW (" + nowFormatted + ") VS TO (" + toFormatted + ")");
            if (moment(nowFormatted).isAfter(moment(toFormatted))) {
                //console.log("Now Formatted (" + nowFormatted + ") is after To Formatted (" + toFormatted + ")");
                refreshNeeded = true;
            }

            //console.log("Comparing oldest saved date's diff (" + fromDiff + ") to today is less than number of requested days (" + days + ")");
            if (fromDiff < days) {
                //console.log("Least recent saved date's diff (" + fromDiff + ") to today is less than number of requested days (" + days + ")");
                refreshNeeded = true;
            }

            return refreshNeeded;
        },
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
        // Note that on the API end, if less than 31 days are given, it defaults back to 31
        // This is because shorter timespans don't get returned faster, and we do all the charting
        // and calculating on the client side anyway, so there's no point in doing short-range fetches
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
                        this.chartData(this._filterCallRange(jQuery.extend(true, {}, data['data']['calls'])));
                        this.renderInvoices(data['data']['invoices']);
                    } else {
                        localStorage.clear();
                        this.info = defaultInfo;
                        swal("Oh noes!", "Looks like something went wrong: " + data.message + " (code: " + data.code + ")", "error");
                    }
                    this.showOverlay(false);
                });
            } else {
                // Refresh not needed
                this.chartData(this._filterCallRange(jQuery.extend(true, {}, this.info.calls)));
                this.renderInvoices(this.info.invoices);
                this.showOverlay(false);
            }
        },
        _saveData: function (data) {
            localStorage.setItem('cached', JSON.stringify(data));
            this._loadData();
        },
        _loadData: function () {
            var cached = localStorage.getItem('cached');
            if (cached !== null) {
                cached = JSON.parse(cached);
            }
            this.info = jQuery.extend(true, this.info, cached);
        },
        showOverlay: function (bool) {
            this.options.overlay = bool;
        },
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
        renderInvoices: function(data) {

        }
    },
    http: {
        root: '/'
    }
});