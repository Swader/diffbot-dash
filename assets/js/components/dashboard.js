var Dashboard = Vue.extend({
    template: `
        <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">

            <h1>
                Diffbot Account Dashboard
                <small>API calls per date, invoice information and status</small>
            </h1>

        </section>

        <!-- Main content -->
        <section class="content">

            <template v-if="info.name">
                <span>Information for {{ info.name }}, on {{ info.plan }} plan</span>
                <h4>API calls frequency over the given period. Change period with range picker below.</h4>
            </template>
            <input v-show="info.name" id="rangepicker" type="text"
                   placeholder="Data for last 31 days"/>
            <div id="dashchart"></div>

            <div v-if="info.invoices">
                <h4>Invoice data (click date to render period on chart)</h4>
                <div class="invoice-container">
                    <template v-for="invoice in info.invoices">
                        <diffbot-invoice :inv="invoice"></diffbot-invoice>
                    </template>
                </div>
            </div>

        </section><!-- /.content -->
    </div>
    `,
    props: ['info', 'options'],
    ready: function () {
        this.$nextTick(function () {
            this.initRangePicker();
        }.bind(this));

        if (this.info.calls) {
            this.$parent.chartData(this.$parent._filterCallRange(jQuery.extend(true, {}, this.info.calls)));
        }
    },
    events: {
        'token-saved': function(token) {
            this.initRangePicker();
        }
    },
    methods: {
        initRangePicker: function () {
            $("#rangepicker").daterangepicker({
                locale: {
                    format: this.options.dateFormat
                },
                startDate: this.options.callsChart.startDate,
                endDate: this.options.callsChart.endDate,
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
                this.$dispatch('request-data', this.info.token, this.options.callsChart.days, picker);
            }.bind(this));
        }
    }
});