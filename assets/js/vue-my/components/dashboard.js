var Dashboard = Vue.extend({
    template: `<div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">

        <h1>
            Diffbot Account Dashboard
            <small>API calls per date, invoice information and status</small>
        </h1>

    </section>

    <!-- Main content -->
    <section class="content">

    <template v-if="!sharedState.token">
        Use the input field on the left to enter a token to analyze.
    </template>

        <template v-if="sharedState.cached">
            <span>Information for {{ sharedState.cached.name }}, on {{ sharedState.cached.plan }} plan</span>
            <h4>API calls frequency over the given period. Change period with range picker below.</h4>
        </template>
        <input v-show="sharedState.cached" id="rangepicker" type="text"
                   placeholder="Data for last 31 days"/>
        <div id="dashchart"></div>

        <div v-if="sharedState.cached">
            <h4>Invoice data (click date to render period on chart)</h4>
            <div class="invoice-container">
                <template v-for="invoice in sharedState.cached.invoices">
                    <diffbot-invoice :inv="invoice"></diffbot-invoice>
                </template>
            </div>
        </div>
    </section><!-- /.content -->
</div>
    `,
    ready: function () {
        this.$nextTick(function () {
            this.initRangePicker();
        });
    },
    data: function () {
        return {
            sharedState: store.state,
            privateState: {}
        }
    },
    route: {
        data: function () {
            if (this.sharedState.token) {
                if (this.$route.params.from) {
                    this.$dispatch('request-data', this.$route.params);
                } else {
                    this.$dispatch('request-data', {
                        from: moment().subtract(31, 'days').format('YYYY-MM-DD'),
                        to: moment().format('YYYY-MM-DD')
                    });
                }
            } else {
                router.go('/dashboard');
            }
        }
    },
    events: {
        'data-refreshed': function (data) {
            var filteredCalls = this._filterCallRange(jQuery.extend(true, {}, data['calls']));
            this.$nextTick(function () {
                this.chartData(filteredCalls);
            });

        }
    },
    methods: {
        initRangePicker: function () {
            $("#rangepicker").daterangepicker({
                locale: {
                    format: store.config.dateFormat
                },
                startDate: store.config.callsChart.startDate,
                endDate: store.config.callsChart.endDate,
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
                router.go({
                    name: 'chart',
                    params: {
                        from: picker.startDate.format("YYYY-MM-DD"),
                        to: picker.endDate.format("YYYY-MM-DD")
                    }
                });
            }.bind(this));
        },
        /**
         * Removes all the call values that aren't in the requested date range.
         * This is used for displaying on the chart.
         * @param calls
         * @returns {*}
         * @private
         */
        _filterCallRange: function (calls) {
            var keys = Object.keys(calls);
            var dlen = keys.length;

            var startCheck = moment(store.config.callsChart.startDate).subtract(1, 'days');
            var endCheck = store.config.callsChart.endDate;

            for (var i = 0; i < dlen; i++) {
                if (!moment(keys[i]).isBetween(startCheck, endCheck)) {
                    delete calls[keys[i]];
                }
            }
            return calls;
        },
        /**
         * Initializes the chart and plots the data passed in
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

    }
});