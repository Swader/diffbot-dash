# Diffbot Dashboard

This is a version of [AdminLTE](https://github.com/almasaeed2010/AdminLTE) configured to work out of the box with non-NodeJS asset compilers as per [this post](http://www.sitepoint.com/look-ma-no-nodejs-a-php-front-end-workflow-without-node/).

## Key Differences:

- [VueJS](http://vuejs.org) added in
- [UpUp](https://www.talater.com/upup/) added in for offline-first support (configure in app.js)
- [FastClick](https://github.com/ftlabs/fastclick) and [SlimScroll](https://github.com/rochal/jQuery-slimScroll) added in
- BowerPHP, Robo and Mini-Asset support out of the box as per [this post](http://www.sitepoint.com/look-ma-no-nodejs-a-php-front-end-workflow-without-node/) so no need for NodeJS or npm, meaning this works flawlessly on VMs on any host OS
- File structure changed so that all non-dist files reside outside public/
- Expanded `.gitignore`

For AdminLTE docs, see the original repo.

Full tutorial coming soon.