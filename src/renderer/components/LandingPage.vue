
<template lang="pug">
  main
    //- span 本程序帮助用户选取压缩文件。
    //- br
    //- span 请选中下面按钮选取要进行压缩的文件目录
    div
      el-button(type="primary" @click="buttonClick") 选取读取的目录
    div.f-m-t-10
      span 压缩文件目录: {{filePath}}
      span.f-m-t-10 {{getFilePathErr}}
    div.f-m-t-10
      div(v-for="(imgName, index) in fileList" :key="index") {{imgName}}
      span.f-m-t-10 {{getFilePathErr}}
    el-button(@click="startCompress") 开始压缩
</template>


<script>
  import SystemInformation from './LandingPage/SystemInformation'
  export default {
    name: 'landing-page',
    components: { SystemInformation },
    data () {
      return {
        filePath: "",
        getFilePathErr: '',
        fileList: '', // png、jpeg、jpg 文件列出
        getFilePathErr: ''
      }
    },
    methods: {
      buttonClick () {
        this.$electron.ipcRenderer.send('dialogToGetFilePath', {})
      },
      startCompress () {
        this.$electron.ipcRenderer.send('startCompressImgFile', {})
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
        console.log('didReadFileList:::: ', msg)
        if (msg.code === 500) {
          this.getFileListErr = msg.err
        } else {
          this.fileList = msg.res // msg.res.join('\n\r')
          console.log(msg.res)
        }
      })
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  main {
    padding: 20px;
    margin: 0px auto;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }
  .f-m-t-10 {
    margin-top: 10px;
  }
</style>
