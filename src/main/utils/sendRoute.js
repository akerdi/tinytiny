export default function SendRoute () {
}
SendRoute.mainWindow = null

SendRoute.initialMainWindow = function (mainWindow) {
  SendRoute.mainWindow = mainWindow
},
SendRoute.sendPromise = function (eventName="", message={}) {
  return new Promise((resolve) => {
    SendRoute.mainWindow.webContents.send(eventName, message, (result) => {
      resolve(result)
    })
  })
}
SendRoute.sendHttp = function (eventName="", message={}) {
  message = {
    eventName,
    data: message
  }
  return SendRoute.sendPromise('http', message)
}
SendRoute.sendLogin = function (eventName="", message={}) {
  message = {
    eventName,
    data: message
  }
  return SendRoute.sendPromise('login', message)
}
SendRoute.sendHome = function (eventName="", message={}) {
  message = {
    eventName,
    data: message
  }
  return SendRoute.sendPromise('home', message)
}
SendRoute.sendUserStatusChange = function (message) {
  return SendRoute.sendPromise('userStatusChange', message)
}