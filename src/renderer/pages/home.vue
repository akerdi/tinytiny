<template lang="pug">
  div
    main.flex-colume-center.f-m-t-44
      span.maxWidth450 &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp本程序帮助用户选取压缩文件. 请选中下面按钮选取要进行压缩的文件目录, 目录查找层级为1层.
      div.f-m-t-10
        el-button(:disabled="startCompressing" type="primary" @click="buttonClick") 选取读取的目录
      div.f-m-t-10
        span(v-show="fileList.length") 压缩文件目录: {{filePath}}
        span.f-m-t-10(v-show="!fileList.length") {{getFilePathErr}}
      el-table.f-m-t-20.f-m-l-20.tableMarginBottom(:data='fileList' style='width: 500px'  highlight-current-row='')
        el-table-column(type="index" align='left' width='40')
          template(slot-scope='scope')
            span {{scope.$index + 1}}
        el-table-column(prop='imgPath' label='文件路径' width="300")
        el-table-column(prop='select' label="是否选中" width="60")
          template(slot-scope='scope')
            el-checkbox(v-model="scope.row.select" @change="selectChange(scope.row, scope.$index)" :disabled="startCompressing")
        el-table-column(prop='finish' label="是否完成" width="60")
          template(slot-scope='scope')
            el-checkbox(v-model="scope.row.success" :disabled="true")
    .personal
      div 用户名: {{this.user.username}}
      div 剩&nbsp&nbsp&nbsp&nbsp余: {{this.user.rest}}
    el-button.clearCookie(type="primary" @click='clearCookie') 清除Cookie
    el-button.startCompress(v-show="fileList.length" @click="startCompress" :loading="startCompressing" type="primary") {{compressBtnTitle}}
</template>

<script>
  export default {
    name: 'home',
    data () {
      return {
        filePath: "",
        getFilePathErr: '',
        fileList: [], // png、jpeg、jpg 文件列出
        getFilePathErr: '',
        startCompressing: false,
        compressBtnTitle: '开始压缩',
        user: {
          username: 'aker',
          rest: 100
        }
      }
    },
    methods: {
      clearCookie () {
        this.$electron.ipcRenderer.send('clearCookieAction', {})
      },
      buttonClick () {
        this.$electron.ipcRenderer.send('dialogToGetFilePath', {})
      },
      startCompress () {
        this.startCompressing = true
        this.$electron.ipcRenderer.send('startCompressImgFile', {})
      },
      getUserProfile () {
        this.$electron.ipcRenderer.send('getUserProfile')
      },
      selectChange(data, index) {
        const message = {
          index,
          data
        }
        this.$electron.ipcRenderer.send('selectImgChanged', message)
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('getedFilePath', (event, msg) => {
        if (msg.err) {
          this.getFilePathErr = msg.err
        } else {
          this.filePath = msg.path
        }
      })
      this.$electron.ipcRenderer.on('didReadFileList', (event, msg) => {
        if (msg.code === 500) {
          this.getFileListErr = msg.err
        } else {
          this.fileList = msg.res
        }
        this.compressBtnTitle = '开始压缩'
      })
      this.$electron.ipcRenderer.on('indexImgIsFinished', (event, msg) => {
        this.fileList[msg.index].success = true
      })
      this.$electron.ipcRenderer.on('compressComplete', (event, msg) => {
        this.startCompressing = false
        this.$notify({
          title: '压缩完成',
          message: '文件路径: ' + msg.folder,
          duration: 0,
          offset: 120
        }),
        this.compressBtnTitle = '再次压缩'
      })
    }
  }
</script>

<style <style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  main {
    max-width: 600px;
    min-width: 500px;
    margin: 0 auto;
  }
  .tableMarginBottom {
    margin-bottom: 70px;
  }
  .maxWidth450 {
    max-width: 450px;
  }

  body {
    font-family: 'Source Sans Pro', sans-serif;
    width: 100%;
    height: 100%;
  }
  .clearCookie {
    position: fixed;
    bottom: 20px;
    left: 20px;
  }
  .startCompress {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%); // 这句话可以让position fixed 的div 居中
  }
  .personal {
    position: fixed;
    top: 20px;
    left: 20px;
    max-width: 150px;
    padding: 10px;
    background-color: white;
    opacity: 0.8;
  }
</style>
