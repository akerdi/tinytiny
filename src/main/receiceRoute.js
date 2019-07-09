import { ipcMain, dialog, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import util from 'util'
import callAsync from './awaitCall'
import tinify from 'tinify'
import _ from 'lodash'
import { getTinyKeyWithAmount, userProfile, clearCookie } from './service/index'

import SendRoute from './sendRoute'

const fsreadirAsync = util.promisify(fs.readdir)
const fsexistAsync = util.promisify(fs.exists)
const fsmkdirAsync = util.promisify(fs.mkdir)

let selectPath = ''
let tinytinyPath = ''
let selectFiles = []
let isStartedCompress = false

let DEBUG = true

ipcMain.on('clearCookieAction', () => {
  clearCookie()
})

ipcMain.on('selectImgChanged', (event, message) => {
  const imgObject = selectFiles[message.index]
  imgObject.select = message.data.select
})

ipcMain.on('startCompressImgFile', async () => {
  // 每次要进行压缩，先询问服务器当前是否有tiny_key
  // 然后再开始，否则发通知出错了。
  const needCompressFiles = selectFiles.filter((f) => {
    return f.select === true
  })
  const params = {
    amount: needCompressFiles.length
  }
  const [err, res] = await callAsync(getTinyKeyWithAmount(params))
  if (err) {
    console.log('errrrrrr', err.response.data)
  }
  console.log('getTinykeyWithAmount result::', res.data)
  //现在才开始压缩
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
  const files = needCompressFiles
  for (const index in files) {
    const imgFileObject = files[index]
    if (DEBUG) {

    } else {
      const imgFileName = imgFileObject.imgPath
      const select = imgFileObject.select
      const fromFile = path.join(selectPath, imgFileName)
      const source = tinify.fromFile(fromFile)
      const toFile = path.join(tinytinyPath, imgFileName)
      const [err, result] = await callAsync(source.toFile(toFile))
      if (err) {
        console.log('imgFileName:', imgFileName, ' getErr: ', err)
        continue
      }
      SendRoute.sendPromise('indexImgIsFinished', { index })
    }
  }
  // compress 全部完成
  // tell frontend to show compress complete
  if (DEBUG) {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    const index = 1
    setTimeout(() => {
      SendRoute.sendPromise('indexImgIsFinished', { index })
    }, 500)
  }
  isStartedCompress = false
  SendRoute.sendPromise('compressComplete', { folder: tinytinyPath })
  setTimeout(() => {
    shell.showItemInFolder(tinytinyPath)
  }, 1200)
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
    SendRoute.sendPromise('getedFilePath', message)
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
    message.res = message.res.map(imgFileName => {
      return {
        imgPath: imgFileName,
        select: true, // 任务是否选中为执行
        finish: false // 任务是否完成
      }
    })
    selectFiles = message.res
  }
  await callAsync(SendRoute.sendPromise('didReadFileList', message))
}