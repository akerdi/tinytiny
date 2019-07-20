const electron = require('vue-electron')

export function HTTPSend (eventName, message={}) {
  message = { eventName: eventName, data: message }
  electron.ipcRenderer.send('http', message)
}

export function HTTPCallback (eventName, callback) {
  electron.ipcRenderer.on('http', (event, msg) => {
    callback
  })
}