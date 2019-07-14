import { ipcMain, dialog, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import util from 'util'
import callAsync from './awaitCall'
import tinify from 'tinify'
import _ from 'lodash'
import { getTinyKeyWithAmount, finishTask, userProfile, clearCookie } from './service/index'

import SendRoute from './sendRoute'

const fsreadirAsync = util.promisify(fs.readdir)
const fsexistAsync = util.promisify(fs.exists)
const fsmkdirAsync = util.promisify(fs.mkdir)

let selectPath = ''
let tinytinyPath = ''
let selectFiles = []
let isStartedCompress = false

let DEBUG = false

// const finishDic = {"5d2af57d347121197209d7ff":2,"5d2af582347121197209d800":3,"5d2af586347121197209d801":4,"5d2728ca5fff3b41f22c2a11":8}


ipcMain.on('clearCookieAction', () => {
  clearCookie()
})

ipcMain.on('selectImgChanged', (event, message) => {
  const imgObject = selectFiles[message.index]
  imgObject.select = message.data.select
})

ipcMain.on('startCompressImgFile', async () => {
  const needCompressFiles = selectFiles.filter((f) => {
    return f.select === true
  })
  if (!tinytinyPath) return console.log("-------hav't select images path")
  if (!needCompressFiles || !needCompressFiles.length) return console.log('-------no file to compress')
  if (isStartedCompress) return
  isStartedCompress = true
  // 每次要进行压缩，先询问服务器当前是否有tiny_key
  // 然后再开始，否则发通知出错了。
  const params = {
    amount: needCompressFiles.length
  }
  const [err, res] = await callAsync(getTinyKeyWithAmount(params))
  if (err) {
    console.log('errrrrrr', err.response.data)
  }
  const readyUseDetail = res.data.readyUseDetail
  console.log('readyUseDetailreadyUseDetailreadyUseDetailreadyUseDetailreadyUseDetail: ', readyUseDetail)
  if (!readyUseDetail || !readyUseDetail.length) return
  let rowIndex = 0 // 使用账号从第一个开始, 逐个使用填充key 完毕
  let columnIndex = 0 // 每个账号量使用完毕，rowIndex+1, 使用下一个

  // tinytiny 文件夹是否生成检查
  const [existErr, existDir] = await callAsync(fsexistAsync(tinytinyPath))
  if (existErr) throw err
  if (!existDir) {
    const [err] = await callAsync(fsmkdirAsync(tinytinyPath))
    if (err) {
      console.log('[startCompressImgFile] mkdir fail err:', err)
    }
  }

  //现在才开始压缩
  const files = needCompressFiles
  // 使用情况记录
  const useSituation = {}
  for (const index in files) {
    const imgFileObject = files[index]
    const account = readyUseDetail[rowIndex]
    console.log('current use account:::::::::', account.key)
    tinify.key = account.key
    console.log('use account ::', account)
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
      SendRoute.sendPromise('indexImgIsFinished', { index, success: imgFileObject.finishSuccess })
    } else {
      const imgFileName = imgFileObject.imgPath
      // const select = imgFileObject.select
      const fromFile = path.join(selectPath, imgFileName)
      const source = tinify.fromFile(fromFile)
      const toFile = path.join(tinytinyPath, imgFileName)
      const [err] = await callAsync(source.toFile(toFile))
      imgFileObject.finish = true
      if (err) {
        console.log('imgFileName:', imgFileName, ' getErr: ', err)
        imgFileObject.finishSuccess = false
        SendRoute.sendPromise('indexImgIsFinished', { index, success: false})
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
      SendRoute.sendPromise('indexImgIsFinished', { index, success: imgFileObject.finishSuccess })
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
  const finishParams = {
    taskId:res.data._id,
    useCost: JSON.stringify(useSituation)
  }
  console.log('~~~~~~~~~~finishParamsfinishParams~~~', finishParams)
  const [finisheErr, finishNetRes] = await callAsync(finishTask(finishParams))
  if (finisheErr) console.log('用户网络有问题??:', finisheErr)
  console.log('finishNetRes::::', finishNetRes.data)
  SendRoute.sendPromise('compressComplete', { folder: tinytinyPath })

  // setTimeout(() => {
  //   shell.showItemInFolder(tinytinyPath)
  // }, 1200)
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
        console.log('imgFileName:', imgFileName, ' getFileMimeType fail ')
        return false
      }
      if (fileTypeObject.fileType === 'unknown') {
        return _.endsWith(imgFileName, '.jpg') || _.endsWith(imgFileName, '.png') || _.endsWith(imgFileName, 'jpeg')
      }
      return _.indexOf(['jpg', 'png', 'jpeg'], fileTypeObject.fileType) !== -1
    })
    console.log('[readFileList] fileResult::::::', message.res)
    message.res = message.res.map(imgFileName => {
      return {
        imgPath: imgFileName,
        select: true, // 任务是否选中为执行
        finish: false, // 任务是否处理过
        finishSuccess: false // 任务处理过是否成功
      }
    })
    selectFiles = message.res
  }
  await callAsync(SendRoute.sendPromise('didReadFileList', message))
}

function debugSimulator(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms * 1000)
  })
}

//获取文件真实类型
const getFileMimeType = function(filePath) {
    try {
      var buffer = new Buffer(8)
      var fd = fs.openSync(filePath, 'r+');
      fs.readSync(fd, buffer, 0, 8, 0);
      var newBuf = buffer.slice(0, 4);
      var head_1 = newBuf[0].toString(16);
      var head_2 = newBuf[1].toString(16);
      var head_3 = newBuf[2].toString(16);
      var head_4 = newBuf[3].toString(16);
      var typeCode = head_1 + head_2 + head_3 + head_4;
      var filetype = '';
      var mimetype;
      switch (typeCode){
          case 'ffd8ffe1':
              filetype = 'jpg';
              mimetype = ['image/jpeg', 'image/pjpeg'];
              break;
          case '47494638':
              filetype = 'gif';
              mimetype = 'image/gif';
              break;
          case '89504e47':
              filetype = 'png';
              mimetype = ['image/png', 'image/x-png'];
              break;
          case '504b34':
              filetype = 'zip';
              mimetype = ['application/x-zip', 'application/zip', 'application/x-zip-compressed'];
              break;
          case '2f2aae5':
              filetype = 'js';
              mimetype = 'application/x-javascript';
              break;
          case '2f2ae585':
              filetype = 'css';
              mimetype = 'text/css';
              break;
          case '5b7bda':
              filetype = 'json';
              mimetype = ['application/json', 'text/json'];
              break;
          case '3c212d2d':
              filetype = 'ejs';
              mimetype = 'text/html';
              break;
          default:
              filetype = 'unknown';
              break;
      }
          fs.closeSync(fd);
      return {
          fileType : filetype,
          mimeType : mimetype
      }
    } catch (error) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@ ', error)
    }
}