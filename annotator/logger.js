require('colors')
const fs2 = require('fs-extra')
const fs = require('fs')
const path = require('path')

let dir = 'main-process.log'
switch (process.platform) {
  case 'darwin': dir = path.join(process.env.HOME, 'Library', 'Application Support', 'Dance Annotator', dir); break
  case 'win32': dir = path.join(process.env.APPDATA, 'Dance Annotator', dir); break
  case 'linux': dir = path.join(process.env.HOME, '.Dance Annotator', dir); break
}

const Timestamp = () => {
  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toTimeString().substr(0, 'HH:MM:SS'.length)
  return `[${date.gray} ${time.cyan}]`.bgBlack
}

const betterLog = (...s) => {
  s.unshift(Timestamp())
  fs2.ensureFileSync(dir)
  fs.appendFileSync(dir, s.map(t => t.stripColors).join(' ') + '\n')

  console.log(...s)
}

module.exports = {
  debug: (...s) => betterLog('[DANCE]'.magenta.bgBlack, '[LOG]'.white.bgBlack, ...s),
  error: (...s) => betterLog('[DANCE]'.magenta.bgBlack, '[ERROR]'.white.bgRed, ...s),
  success: (...s) => betterLog('[DANCE]'.magenta.bgBlack, '[SUCCESS]'.white.bgGreen, ...s)
}
