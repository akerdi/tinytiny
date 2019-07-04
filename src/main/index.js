import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

const selectPath = ''
ipcMain.on('messageTwo', (event, msg) => {
  console.log(event)
  console.log('=====================')
  console.log(msg)
})
ipcMain.on('dialogToGetFilePath', (event, msg) => {
  dialog.showSaveDialog({title: '222222'}, (fileName) => {
    const message = {}
    if (fileName === undefined) {
      message.err = "您没有选择保存的路径"
    } else {
      message.err = null
      const posix = path.parse(fileName)
      message.path = posix.dir
      selectPath = message.path
    }
    mainWindow.webContents.send('getedFilePath', message, (data) => {
      console.log(data)
    })
  })
})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
function createWindow () {
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800
  })
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  setTimeout(() => {
    mainWindow.webContents.send('messageOne', 'haha', (data) => {
      console.log(data)
    })
  }, 4000)
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
