# Diffbot Dashboard

This is a version of [AdminLTE](https://github.com/almasaeed2010/AdminLTE) configured to work out of the box with non-NodeJS asset compilers as per [this post](http://www.sitepoint.com/look-ma-no-nodejs-a-php-front-end-workflow-without-node/).

## Key Differences:

- [VueJS](http://vuejs.org) included
- [FastClick](https://github.com/ftlabs/fastclick) and [SlimScroll](https://github.com/rochal/jQuery-slimScroll) added into compiled files by default
- BowerPHP, Robo and Mini-Asset support out of the box as per [this post](http://www.sitepoint.com/look-ma-no-nodejs-a-php-front-end-workflow-without-node/) so no need for NodeJS or npm, meaning this works flawlessly on VMs on any host OS
- File structure changed so that all non-dist files reside outside public/
- Expanded `.gitignore`
- Removed the CSS files. You MUST use Less and compile stuff. It's easy. See "compilation" below.
- Removed all traces of NodeJS - no grunting, no packages, no node modules.

## Compilation

### Manually compiling assets

Inside the `assets` folder:

```
../vendor/bin/mini_asset build --config assets.ini
```

Or with robo:

```
../vendor/bin/robo assets:build
```

To build them from scratch (deleting previously built ones):

```
../vendor/bin/robo assets:build --clear
```

To have the files auto-rebuild after every change to the sources:

```
../vendor/bin/robo assets:watch
```

### To change the theme

- change the theme in `index.html` as per instructions in comments
- change theme to compile in `assets/assets.ini`
- recompile assets (see above)

---

For AdminLTE docs, see the original repo.

Full tutorial coming soon.