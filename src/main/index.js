import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import util from 'util'
import _ from 'lodash'
import tinify from 'tinify'

import callAsync from './awaitCall'

tinify.key = 'xAt3TXhah69ifArpJduRsVXMCJ2jSKgF'
const fsreadirAsync = util.promisify(fs.readdir)
const fsexistAsync = util.promisify(fs.exists)
const fsmkdirAsync = util.promisify(fs.mkdir)

let selectPath = ''
let tinytinyPath = ''
let selectFiles = []
let isStartedCompress = false

ipcMain.on('startCompressImgFile', async () => {
  if (!tinytinyPath) return console.log("-------hav't select images path")
  if (!selectFiles || !selectFiles.length) return console.log('-------no file to compress')
  if (isStartedCompress) return
  isStartedCompress = true
  // tinytiny 文件夹是否生成检查
  const [existErr, existDir] = await callAsync(fsexistAsync(tinytinyPath))
  if (existErr) throw err
  if (!existDir) {
    await callAsync(fsmkdirAsync(tinytinyPath))
  }
  const files = selectFiles
  for (const imgFileName of files) {
    const fromFile = path.join(selectPath, imgFileName)
    const source = tinify.fromFile(fromFile)
    const toFile = path.join(tinytinyPath, imgFileName)
    const [err, result] = await callAsync(source.toFile(toFile))
    if (err) {
      console.log('imgFileName:', imgFileName, ' getErr: ', err)
    } else {
      console.log('imgFileName:', imgFileName, ' successComressed: ', result)
    }
  }
})

ipcMain.on('dialogToGetFilePath', () => {
  dialog.showSaveDialog({title: '选取保存路径', message: '选取保存路径', nameFieldLabel: '选取保存路径'}, (fileName) => {
    const message = {}
    if (fileName === undefined) {
      message.err = "您没有选择保存的路径"
    } else {
      message.err = null
      const posix = path.parse(fileName)
      message.path = posix.dir
      selectPath = message.path
      tinytinyPath = path.join(selectPath, 'tinytiny')
    }
    mainWindow.webContents.send('getedFilePath', message)
    readFileList(selectPath)
  })
})

async function readFileList(filePath) {
  const [err, res] = await callAsync(fsreadirAsync(filePath))
  const message = {}
  if (err) {
    message.code = 500
    message.err = err
  } else {
    message.code = 200
    message.res = res.filter(imgFileName => {
      return _.endsWith(imgFileName, '.jpg') || _.endsWith(imgFileName, '.png') || _.endsWith(imgFileName, 'jpeg')
    })
    selectFiles = message.res
  }
  await callAsync(sendToRenderPromise('didReadFileList', message))
}

function sendToRenderPromise(eventName="", message={}) {
  return new Promise((resolve) => {
    mainWindow.webContents.send(eventName, message, (result) => {
      resolve(result)
    })
  })
}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
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
