<template lang="pug">
  div
    main.flex-colume-center.f-m-t-44
      .header
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
      .tac(style="color: #545454") 更多咨询/定制/合作请联系QQ: 767838865
    .personal
      div 用户名: {{this.user.username}}
      div.f-m-t-5 剩&nbsp&nbsp&nbsp&nbsp余: {{this.user.rest}}
    //- el-button.clearCookie(type="primary" @click='clearCookie') 清除Cookie
    el-button.startCompress(v-show="fileList.length" @click="startCompress" :loading="startCompressing" type="primary") {{compressBtnTitle}}
</template>

<script>
import { HTTPSend, HomeHTTPListener, destroyOn } from '@/service'
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
        username: '',
        rest: 0
      }
    }
  },
  methods: {
    // clearCookie () {
    //   HTTPSend('clearCookieAction', {})
    // },
    buttonClick () {
      HTTPSend('dialogToGetFilePath')
    },
    startCompress () {
      this.startCompressing = true
      HTTPSend('startCompressImgFile')
    },
    getUserProfile () {
      HTTPSend('getUserProfile')
    },
    selectChange(data, index) {
      const message = { index, select: data.select }
      HTTPSend('selectImgChanged', message)
    },
    httpCallback (eventName, data) {
      switch (eventName) {
        case 'getedFilePath':
          if (data.err) {
            this.getFilePathErr = data.err
          } else {
            this.filePath = data.path
          }
          break
        case 'didReadFileList':
          if (data.code === 500) {
            this.getFileListErr = data.err
          } else {
            this.fileList = data.res
          }
          this.compressBtnTitle = '开始压缩'
          break
        case 'indexImgIsFinished':
          this.fileList[data.index].success = true
          break
        case 'compressComplete': {
          this.startCompressing = false
          this.$notify({
            title: '压缩完成',
            message: '文件路径: ' + data.folder,
            duration: 0,
            offset: 120
          }),
          this.compressBtnTitle = '再次压缩'
        }
          break
        case 'getUserProfileCallback':
          this.user.username = data.username
          this.user.rest = data.tinyNum
          break
        case 'startCompressImgFileCallback': {
          this.startCompressing = false
          this.$message.error(data.err)
        }
        break
      }
    }
  },
  mounted () {
    HomeHTTPListener(this.httpCallback)
    this.getUserProfile()
  },
  beforeDestroy () {
    destroyOn('home')
  }
}
</script>

<style <style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
  .header{
    background: #ccc;
    width: 100%;
    height: 50px;
    -webkit-app-region: drag;
  }
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
    max-width: 200px;
    padding: 10px;
    background-color: white;
    opacity: 0.8;
  }
</style>

