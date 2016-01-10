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

        <template v-if="info.name">
            <span>Information for {{ info.name }}, on {{ info.plan }} plan</span>
            <h4>API calls frequency over the given period. Change period with range picker below.</h4>
        </template>
        <input v-show="info.name" id="rangepicker" type="text"
                   placeholder="Data for last 31 days"/>
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
            if (this.$route.params.from) {
                this.$dispatch('request-data', this.$route.params);
            }
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
        }
    }
});