Vue.filter('momentify', function (value) {
    return moment(value).format("DD.MM.YYYY");
});

Vue.filter('invoiceslug', function (value) {
    return moment(value).subtract(1, 'month').format("YYYY-MM-DD") + '+' + moment(value).format("YYYY-MM-DD");
});