Vue.filter('invoiceslug', function (value) {
    return moment(value).subtract(1, 'month').format("YYYY-MM-DD") + '+' + moment(value).format("YYYY-MM-DD");
});

Vue.component('diffbot-invoice', {
    template: `
        <div class="invoice {{ inv.status }}">
        <h4 class="invoice-title"><a v-link="{ name: 'chart', params: {from: from, to: to} }"
                title="Show on chart">{{ inv.date.date | momentify }}</a></h4>
        <div class="sexy_line"></div>
        <span class="amount">{{ inv.totalAmount | currency }}</span>
        <span class="amount smaller overage"
              v-if="inv.overageAmount > 0">of which overage: {{ inv.overageAmount | currency }}!</span>
        <span class="amount smaller">{{ inv.totalCalls }} calls</span>
        <div class="sexy_line"></div>
        <span class="plan">{{ inv.plan | capitalize }} plan</span>
        <div class="price_badge" title="paid" v-if="inv.status == 'paid'">
            <i class="fa fa-thumbs-up"></i>
        </div>
        <div class="price_badge yella" title="unpaid"
             v-if="inv.status != 'paid'">
            <i class="fa fa-exclamation-circle"></i>
        </div>
    </div>
    `,
    props: ['inv'],
    data: function () {
        return {
            from: moment(this.inv.date.date).subtract(1, 'month').format("YYYY-MM-DD"),
            to: moment(this.inv.date.date).format("YYYY-MM-DD")
        }
    }

});
