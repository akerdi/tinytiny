import { ipcMain, dialog, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import util from 'util'
import callAsync from '../lib/awaitCall'
import tinify from 'tinify'
import _ from 'lodash'
import {
  getCookie, getTinyKeyWithAmount, finishTask, userProfile,
  clearCookie, userLoginValidation, userRegister
} from '../service'
import User, { updateUserStatus } from '../user'
import { getFileMimeType } from '../utils/fileOperation'
import logger from '../utils/logger'

import SendRoute from '../utils/sendRoute'

const fsreadirAsync = util.promisify(fs.readdir)
const fsexistAsync = util.promisify(fs.exists)
const fsmkdirAsync = util.promisify(fs.mkdir)

let selectPath = ''
let tinytinyPath = ''
let selectFiles = []
let isStartedCompress = false

let DEBUG = process.env.NODE_ENV === 'development'

ipcMain.on('http', (event, message) => {
  logger('[ipcMain http] receive message:', JSON.stringify(message))
  switch (message.eventName) {
    case 'userLogin':
      userLoginValidation(message.data.username, message.data.password)
      break
    case 'userRegister':
      userRegister(message.data.username, message.data.password)
      break
    case 'getUserProfile':
      getUserProfile()
      break
    case 'clearCookieAction':
      clearCookie()
      User.userProfile = null
      updateUserStatus(2)
      break
    case 'selectImgChanged':
      const imgObject = selectFiles[message.data.index]
      imgObject.select = message.data.select
      break
    case 'startCompressImgFile':
      startCompressImgFile()
      break
    case 'dialogToGetFilePath':
      dialogToGetFilePath()
      break
  }
})

ipcMain.on('getCookie', () => {
  getCookie()
})

const getUserProfile = async () => {
  const [err, result] = await callAsync(userProfile())
  if (err) {
    User.userProfile = null
    updateUserStatus(2, err)
    return logger('[getUserProfile] got err:', err.response.data)
  }
  User.userProfile = result.data
  updateUserStatus(1)
  SendRoute.sendHome('getUserProfileCallback', User.userProfile)
  logger('[getUserProfile] get result:', result.data)
  // tell frontend to rerender!
}

const startCompressImgFile = async () => {
  const needCompressFiles = selectFiles.filter((f) => {
    return f.select === true
  })
  if (!tinytinyPath) {
    isStartedCompress = true
    return SendRoute.sendHome('startCompressImgFileCallback', {err: "haven't select images path"})
  }
  if (!needCompressFiles || !needCompressFiles.length) {
    isStartedCompress = true
    return SendRoute.sendHome('startCompressImgFileCallback', {err: 'no file to compress'})
  }
  if (isStartedCompress) return
  isStartedCompress = true
  // 每次要进行压缩，先询问服务器当前是否有tiny_key
  // 然后再开始，否则发通知出错了。
  const params = { amount: needCompressFiles.length }
  const [err, res] = await callAsync(getTinyKeyWithAmount(params))
  if (err) {
    isStartedCompress = true
    return SendRoute.sendHome('startCompressImgFileCallback', {err: err.response.data})
  }
  const readyUseDetail = res.data.readyUseDetail
  if (!readyUseDetail || !readyUseDetail.length) return
  let rowIndex = 0 // 使用账号从第一个开始, 逐个使用填充key 完毕
  let columnIndex = 0 // 每个账号量使用完毕，rowIndex+1, 使用下一个

  // tinytiny 文件夹是否生成检查
  const [existErr, existDir] = await callAsync(fsexistAsync(tinytinyPath))
  if (existErr) throw err
  if (!existDir) {
    const [err] = await callAsync(fsmkdirAsync(tinytinyPath))
    if (err) {
      isStartedCompress = true
      return SendRoute.sendHome('startCompressImgFileCallback', {err: err})
    }
  }

  //现在才开始压缩
  const files = needCompressFiles
  // 使用情况记录
  const useSituation = {}
  for (const index in files) {
    const imgFileObject = files[index]
    const account = readyUseDetail[rowIndex]
    tinify.key = account.key
    if (DEBUG) {
      await callAsync(debugSimulator(1.3))
      if (useSituation[account.account]) {
        useSituation[account.account] ++
      } else {
        useSituation[account.account] = 1
      }
      columnIndex ++
      // 大于等于，说明columnIndex 超了, rowIndex ++
      if (columnIndex >= account.dirtyNum) {
        columnIndex = 0
        rowIndex ++
      }
      imgFileObject.finish = true
      imgFileObject.finishSuccess = true
      SendRoute.sendHome('indexImgIsFinished', { index: imgFileObject.index, success: imgFileObject.finishSuccess })
    } else {
      const imgFileName = imgFileObject.imgPath
      // const select = imgFileObject.select
      const fromFile = path.join(selectPath, imgFileName)
      const source = tinify.fromFile(fromFile)
      const toFile = path.join(tinytinyPath, imgFileName)
      const [err] = await callAsync(source.toFile(toFile))
      imgFileObject.finish = true
      if (err) {
        logger('compress meet err with img:', imgFileObject)
        logger('err:', err)
        imgFileObject.finishSuccess = false
        SendRoute.sendHome('indexImgIsFinished', { index: imgFileObject.index, success: false})
        continue
      }
      if (useSituation[account.account]) {
        useSituation[account.account] ++
      } else {
        useSituation[account.account] = 1
      }
      columnIndex ++
      // 大于等于，说明columnIndex 超了, rowIndex ++
      if (columnIndex >= account.dirtyNum) {
        columnIndex = 0
        rowIndex ++
      }
      // 标记finish
      imgFileObject.finishSuccess = true
      SendRoute.sendHome('indexImgIsFinished', { index: imgFileObject.index, success: imgFileObject.finishSuccess })
    }
  }
  // compress 全部完成
  // tell frontend to show compress complete
  isStartedCompress = false
  const finishParams = {
    taskId:res.data._id,
    useCost: JSON.stringify(useSituation)
  }
  const [finisheErr, finishNetRes] = await callAsync(finishTask(finishParams))
  if (finisheErr) logger('用户网络有问题??:', finisheErr)
  SendRoute.sendHome('compressComplete', { folder: tinytinyPath })
  // 完成时，顺便查询下用户资料
  getUserProfile()

  setTimeout(() => {
    shell.showItemInFolder(tinytinyPath)
  }, 1200)
}

const dialogToGetFilePath = () => {
  dialog.showOpenDialog({properties: ['openDirectory'], title: '选取保存路径', message: '选取保存路径', nameFieldLabel: '选取保存路径'}, (fileNames) => {
    const message = {}
    if (!fileNames.length) {
      message.err = "您没有选择保存的路径"
    } else {
      const fileName = fileNames[0]
      message.err = null
      const posix = path.parse(fileName)
      message.path = posix.dir
      selectPath = message.path
      tinytinyPath = path.join(selectPath, 'tinytiny')
    }
    SendRoute.sendHome('getedFilePath', message)
    readFileList(selectPath)
  })
}

async function readFileList(readFilePath) {
  const [err, res] = await callAsync(fsreadirAsync(readFilePath))
  const message = {}
  if (err) {
    message.code = 500
    message.err = err
  } else {
    message.code = 200
    message.res = res.filter(imgFileName => {
      const fileTypeObject = getFileMimeType(path.join(readFilePath, imgFileName))
      if (!fileTypeObject) {
        logger('imgFileName:', imgFileName, ' getFileMimeType fail ')
        return false
      }
      if (fileTypeObject.fileType === 'unknown') {
        return _.endsWith(imgFileName, '.jpg') || _.endsWith(imgFileName, '.png') || _.endsWith(imgFileName, 'jpeg')
      }
      return _.indexOf(['jpg', 'png', 'jpeg'], fileTypeObject.fileType) !== -1
    })
    let index = -1
    message.res = message.res.map(imgFileName => {
      index ++
      return {
        imgPath: imgFileName,
        select: true, // 任务是否选中为执行
        finish: false, // 任务是否处理过
        finishSuccess: false, // 任务处理过是否成功
        index
      }
    })
    selectFiles = message.res
  }
  await callAsync(SendRoute.sendHome('didReadFileList', message))
}

function debugSimulator(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms * 1000)
  })
}
