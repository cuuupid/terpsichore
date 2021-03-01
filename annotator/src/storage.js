const path = require('path')
const fs = require('fs')
const fs2 = require('fs-extra')
const {
  ipcMain, session
} = require('electron')

//! NOTE: dont give this middleware or itll break

module.exports = dir => {
  switch (process.platform) {
    case 'darwin': dir = path.join(process.env.HOME, 'Library', 'Application Support', 'Dance Annotator', dir); break
    case 'win32': dir = path.join(process.env.APPDATA, 'Dance Annotator', dir); break
    case 'linux': dir = path.join(process.env.HOME, '.Dance Annotator', dir); break
  }

  const clean_key = key =>
    key.replace(/[^A-z0-9/\-_]/g, '')

  const Storage = {
    load: key => {
      key = clean_key(key)
      const fp = `${dir}/${key}.json`
      fs2.ensureFileSync(fp)
      const s = fs.readFileSync(fp)
      return s
    },
    save: (key, d) => {
      key = clean_key(key)
      const fp = `${dir}/${key}.json`
      fs2.ensureFileSync(fp)
      const s = JSON.stringify(d)
      fs.writeFileSync(fp, s)
    },
    pop: key => {
      key = clean_key(key)
      const fp = `${dir}/${key}.json`
      fs2.ensureFileSync(fp)
      const s = fs.readFileSync(fp)
      fs.unlinkSync(fp)
      return s
    }
  }

  return Storage
}