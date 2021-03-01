//? Sentry will keep track of bugs and error reports
const Sentry = require('@sentry/electron')
Sentry.init({ dsn: "https://6ddade58c447464b9ee60213b9190eb0@o342681.ingest.sentry.io/5655769" });

//? Logger :)
const Log = require('./src/logger')

//? Expose commit hash for versioning
Log.debug("Building commit hash")
const { commit_hash, dev } = (() => {
  let commit_hash
  let dev = false
  try {
    commit_hash = require('child_process')
      .execSync('git rev-parse HEAD')
      .toString().trim()
    dev = true
  } catch (e) {
    commit_hash = null
    dev = false
  }
  return { commit_hash, dev }
})()
Log.debug("Dev mode?", !!dev, "Commit Hash:", commit_hash)

//? Electron
const os = require('os')
const { app, BrowserWindow, ipcMain, dialog, autoUpdater } = require('electron')

//? Checks to make sure we're not in the midst of installation
if (require('electron-squirrel-startup')) {
  app.quit()
  process.exit(0)
}

//? Post-production versioning
const platform = os.platform() // + '_' + os.arch()
const version = app.getVersion()
if (!dev) commit_hash = platform + '-' + version

//! Auto-updating is disabled currently
// autoUpdater.setFeedURL({ url: 'your nuts URL here' + platform + '/' + version })

//! Bug in electron rejects self-signed certs (e.g. YouTube's)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

//? Set up cache
Log.debug('Building cache...')
require('./src/cache')('datasets')

//? Define entry scripts
const entry = () => {
  win.loadURL(`file://${__dirname}/public/index.html#${commit_hash}`, {
    //* have to pretend to be Chrome to pass some checks
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4101.0 Safari/537.36 Edg/83.0.474.0'
  })
}
ipcMain.handle('reentry', (_, __) => entry())

//? Adblock
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')

//? Launch scripts
const init = async () => {
  const Sentinel = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)

  win = new BrowserWindow({
    show: false,
    frame: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#312f2e',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    },
  })

  win.maximize()
  win.show()
  win.focus()

  entry()

  Sentinel.enableBlockingInSession(win.webContents.session)
  win.on('closed', () => {
    win = null
  })
}

//? LAUNCH TIME 🚀🚀🚀🚀🚀🚀
app.allowRendererProcessReuse = false
app.on('ready', init)

//! Prevents app from needing to be quit from dock on mac
app.on('window-all-closed', () => app.quit())

//! If it somehow is not quit above, will spawn a new window when clicked on in dock on mac
app.on('activate', () => {
  if (win === null) init()
})

//? Expose platform in case we need it for CSS
module.exports = {
  platform: process.platform
}