# Compute Cross Difference Web Extension

RBD

## Usage

TBD

## Build

```sh
npm i
npm run build       # Firefox
npm run buildChrome # Chrome
```

Extension package will be located in `web-ext-artifacts/` folder.

## Run Tests

```sh
npm test
```

## Install In Developer Mode

Make sure you have built extension.

### Firefox

* Open `about:debugging`
* Click `Load Temporary Add-on`
* Select `dist/manifest.json` file

### Chrome

* Open Chrome Settings
* Select Extensions
* Enable developer mode
* Click Load Unpacked
* Select `dist/` folder

### web-ext

```sh
npx web-ext run
```
