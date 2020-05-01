<template lang="pug">
  .m-home
    .flex-colume-center.f-m-t-44
      .header
      span.titleDescript 本程序帮助用户选取压缩文件. 请选中下面按钮选取要进行压缩的文件目录, 目录按照递归方式查找.
      .execOptions
        span 执行压缩文件
        el-switch.f-m-l-20(v-model="isTodoTiny" :disabled="startCompressing")
        span.f-m-l-50 执行重命名文件
        el-switch.f-m-l-20(v-model="isTodoRename" :disabled="startCompressing")
        el-input.input.f-m-l-20(v-if="isTodoRename" :disabled="startCompressing" v-model="renamePrefix" placeholder="重命名文件name. 默认: default")
      div.f-m-t-10
        el-button(:disabled="startCompressing" type="primary" @click="buttonClick") 选取读取的目录
      div.f-m-t-10
        span(v-show="fileList.length") 压缩文件目录: {{filePath}}
        span.f-m-t-10(v-show="!fileList.length") {{getFilePathErr}}
      .mainTable
        el-table(:data='fileList'  highlight-current-row='')
          el-table-column(type="index" align='left' width='40')
            template(slot-scope='scope')
              span {{scope.$index + 1}}
          el-table-column(prop='imgPath' label='文件路径' width="300")
          el-table-column(prop='select' label="选择" width="60")
            template(slot-scope='scope')
              el-checkbox(v-model="scope.row.select" @change="selectChange(scope.row, scope.$index)" :disabled="startCompressing")
          el-table-column(prop='finish' label="执行状态" width="120")
            template(slot-scope='scope')
              el-checkbox(v-model="scope.row.success" :disabled="true")
      .tac(style="color: #545454") 更多咨询/定制/合作请联系QQ: 767838865
    .personal
      div 用户名: {{this.user.username}}
      div.f-m-t-5 剩&nbsp&nbsp&nbsp&nbsp余: {{this.user.rest}}
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
      isTodoRename: false, // 是否执行重命名
      renamePrefix: 'default', // 重命名文件basename
      isTodoTiny: true, // 是否执行tiny
      compressBtnTitle: '开始压缩',
      user: {
        username: '',
        rest: 0
      }
    }
  },
  methods: {
    buttonClick () {
      HTTPSend('dialogToGetFilePath')
    },
    startCompress () {
      if (!this.isTodoRename && !this.isTodoTiny) return this.$message.info("请至少指定一种任务:【压缩 / 重命名】")
      this.startCompressing = true
      const params = {
        isTodoTiny: this.isTodoTiny,
        isTodoRename: this.isTodoRename,
        renamePrefix: this.renamePrefix
      }
      HTTPSend('startCompressImgFile', params)
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
  .m-home {
    margin: 0 auto;
  }
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
  .tableMarginBottom {
    margin-bottom: 70px;
  }
  .titleDescript {
    text-align: left;
    max-width: 75%;
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
  .mainTable {
    margin-top: 20px;
    margin-bottom: 70px;
    width: 75%;
  }
  .personal {
    position: fixed;
    top: 20px;
    left: 20px;
    max-width: 230px;
    padding: 10px;
    background-color: white;
    opacity: 0.8;
  }
  .execOptions {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 75%;
    height: 70px;
    .input {
      width: 30%;
    }
  }
</style>

