const { ipcMain } = require('electron')
const WebSocket = require('ws')
const net = require('net')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
// reinitialized every restart :) black box
const key = crypto.randomBytes(32).toString('hex') // 32 bytes = 64 hex chars = 256 bits 💪

ipcMain.handle('key exchange', async (_, q) => {
  const { secret } = q
  // this is what the client needs to send to auth requests
  const token = jwt.sign({ token: secret }, key, { expiresIn: 60 * 60 * 24 * 7 })
  // we double sign the result payload
  const payload = jwt.sign({ token }, secret, { expiresIn: 60 * 60 * 24 * 7 })
  return payload
})

ipcMain.handle('status', async (_,__) => {
  return {success: true}
})

const DEFUALT_PORT = 41604

const unused_port = async () => {
  const look_for_port = p => new Promise((s, _) => {
    const port = DEFUALT_PORT

    const serv = net.createServer()
    serv.listen(port, _ => {
      serv.once('close', () => s(port))
      serv.close()
    })
    serv.on('error', _ => look_for_port(port + 1))
  })

  return await look_for_port(DEFUALT_PORT)
}

/*
  ? Usage:

  * get a tag:
        const tag = ipcStream.tag()

  * send data:
        await ipcStream.send(tag, myData)

  * Respond via normal IPC with {stream: tag}
*/
const ipcStream = {
  port: null,
  send: (..._) => { throw 'WebSocket server has not yet been started!' },
  tag: () => crypto.randomBytes(32).toString('hex')
}
ipcMain.handle('start websocket server', async (_, q) => {
  if (ipcStream.port) return ipcStream.port

  const port = await unused_port()
  ipcStream.port = port
  const wss = new WebSocket.Server({
    port
    // TODO: custom config for compression, etc
  })

  wss.on('connection', ws => {
    const outgoing = {}
    ws.on('message', m => {
      const { stream } = JSON.parse(m)
      if (outgoing[stream]) outgoing[stream]()
    })
    ipcStream.send = (tag, data) => new Promise((s, j) => {
      outgoing[tag] = s
      ws.send(JSON.stringify({ tag, data }))
    })
  })

  return port
})

//? Encode/Decode utility functions
const decode = async t => { // incoming
  if (!t) throw 'Missing token'
  const { token } = jwt.verify(t, key) // returns {token: secret}
  return token
}
const encode = (secret, d) => { // outgoing
  return jwt.sign(d, secret, { expiresIn: 60 * 60 * 24 * 7 })
}

//? Registers a handler to an IPC channel. (handler can be async)
const register = (channel, handler) => {
  ipcMain.handle('please ' + channel, async (_, q) => {
    const { token } = q

    let client_secret; try { client_secret = await decode(token) } catch (e) { return { error: e } }
    if (!client_secret) return { error: "Couldn't decode client secret" };

    const payload = await handler(q)

    return { s: encode(client_secret, { success: true, payload }) }
  })
}

module.exports = {
  '👈': decode,
  '👉': encode,
  register,
  ipcStream
}
