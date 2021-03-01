const path = require('path')
const fs = require('fs')
const fs2 = require('fs-extra')
const Storage = require('./storage')
const Comms = require('./comms')

module.exports = dir => {

  const Annotations = Storage(path.join(dir, 'annotations'))

  switch (process.platform) {
    case 'darwin': dir = path.join(process.env.HOME, 'Library', 'Application Support', 'Dance Annotator', dir); break
    case 'win32': dir = path.join(process.env.APPDATA, 'Dance Annotator', dir); break
    case 'linux': dir = path.join(process.env.HOME, '.Dance Annotator', dir); break
  }

  //? Represented as an array of valid dataset keys
  const Legend = (() => {
    const filepath = path.join(dir, 'legend.json')
    fs2.ensureFileSync(filepath)
    const load = () => {
      try {
        data = JSON.parse(fs.readFileSync(filepath) || '{}')
      } catch { data = [] }
      return data
    }
    const save = d => {
      const s = JSON.stringify(d)
      fs.writeFileSync(filepath, s)
      return load()
    }
    load()
    return { load, save }
  })()

  //? IPC Handlers
  Comms.register('list datasets', _ => Legend.load())
  Comms.register('save datasets', ({ datasets }) => Legend.save(datasets))
  Comms.register('load dataset', ({ key }) => Annotations.load(key))
  Comms.register('save dataset', ({ key, data }) => Annotations.save(key, data))

}