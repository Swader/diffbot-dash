Vue.filter('momentify', function (value) {
    return moment(value).format("DD.MM.YYYY");
});
