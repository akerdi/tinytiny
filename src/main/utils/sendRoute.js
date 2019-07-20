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