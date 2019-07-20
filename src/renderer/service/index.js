import { ipcRenderer } from 'electron'

let listeners = {}

export function HTTPSend (eventName, message={}) {
  message = { eventName: eventName, data: message }
  ipcRenderer.send('http', message)
}

////////////////////
// listeners

export function LoginHTTPListener (callback) {
  const className = 'login'
  if (listeners[className]) {
    return
  }
  listeners[className] = callback
  ipcRenderer.on(className, loginCallback)
}
export function HomeHTTPListener (callback) {
  const className = 'home'
  if (listeners[className]) {
    return
  }
  listeners[className] = callback
  ipcRenderer.on(className, homeCallback)
}

function loginCallback(event, msg) {
  listeners['login'](msg.eventName, msg.data)
}
function homeCallback(event, msg) {
  listeners['home'](msg.eventName, msg.data)
}

export function destroyOn (className) {
  let targetFunc = null
  switch (className) {
    case 'login':
      targetFunc = loginCallback
      break;
    default: // home
      targetFunc = homeCallback
      break;
  }
  ipcRenderer.removeListener(className, targetFunc)
  listeners[className] = null
}
