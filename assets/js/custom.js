/** Put your custom JS code here **/

// This input element will be reused a couple of times, so it's best to cache it here
// @todo: convert it into a VueJS component?
var ti = document.getElementById('tokenInput');

// Format for Moment.js
var format = "DD.MM.YYYY.";

// Basic skeleton of the initial data strucutre of the Vue app.
// Still debating with self if this is the way to go.
var info = {
    "name": null,
    "plan": null,
    "token": null,
    "days": 31,
    "callsChart": {
        "startDate": moment().subtract(31, 'days'),
        "endDate": moment()
    }
};

// When set to true, outputs full stack trace with every warning
Vue.config.debug = true;

var vm = new Vue({
    el: '#app',
    data: {
        info: info,
        // Initialize basic UI flags here - overlay is used when loading
        ui: {
            overlay: false
        }
    },
    ready: function () {
        this.info = jQuery.extend(true, this.info, this.loadData());
        if (this.info.token) {
            this.requestData(this.info.token, this.info.days);
        }

        this.$nextTick(function () {
            vm.initRangePicker();
        });
    },
    methods: {
        tokensave: function () {
            this.saveData();
            this.requestData(ti.value);
            this.initRangePicker();
        },
        tokenshow: function () {
            ti.type = (ti.type == "password") ? "text" : "password";
        },
        initRangePicker: function () {
            $("#rangepicker").daterangepicker({
                locale: {
                    format: format
                },
                startDate: vm.info.callsChart.startDate,
                endDate: vm.info.callsChart.endDate,
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
                vm.info.days = Math.abs(picker.startDate.diff(moment(), 'days') - 1);
                vm.info.callsChart.startDate = picker.startDate;
                vm.info.callsChart.endDate = picker.endDate;
                vm.requestData(vm.info.token, vm.info.days);
            });
        },
        // Note that on the API end, if less than 31 days are given, it defaults back to 31
        // This is because shorter timespans don't get returned faster, and we do all the charting
        // and calculating on the client side anyway, so there's no point in doing short-range fetches
        requestData: function (token, days) {
            if (days === undefined || days === null) {
                days = 31;
            }
            this.showOverlay(true);
            this.$http.get('/api.php', {
                "token": token,
                "days": days
            }, function (data, status, request) {

                if (data.status == "OK") {

                    var keys = Object.keys(data['data']['calls']);
                    var dlen = keys.length;

                    for (var i = 0; i < dlen; i++) {
                        var startCheck = moment(this.info.callsChart.startDate.format()).subtract(1, 'days');
                        var endCheck = this.info.callsChart.endDate;
                        if (!moment(keys[i]).isBetween(startCheck, endCheck)) {
                            delete data['data']['calls'][keys[i]];
                        }
                    }

                    data['data']['token'] = token;
                    this.saveData(data['data']);
                    this.chartData(data['data']['calls']);

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
                "token": localStorage.getItem("token"),
                "days": localStorage.getItem("days") || 31
            }
        },
        resetInfo: function () {
            this.info = info;
        },
        showOverlay: function (bool) {
            this.ui.overlay = bool;
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
        }
    },
    http: {
        root: '/'
    }
});