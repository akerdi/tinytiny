
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
</template>


<script>
  import SystemInformation from './LandingPage/SystemInformation'
  export default {
    name: 'landing-page',
    components: { SystemInformation },
    data () {
      return {
        filePath: "",
        getFilePathErr: ''
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      change (value) {
        console.log('-0--00000', value)
      },
      buttonClick () {
        this.$electron.ipcRenderer.send('dialogToGetFilePath', '')
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('messageOne', (event, msg) => {
        console.log(event, ' :::event, msg::::', msg)
        console.log('thisthisthis', this)
        this.filePath = '2222222'
        setTimeout(() => {
          this.$electron.ipcRenderer.send('messageTwo', 'heihei')
        }, 3000)
      })
      this.$electron.ipcRenderer.on('getedFilePath', (event, msg) => {
        if (msg.err) {
          this.getFilePathErr = msg.err
        } else {
          this.filePath = msg.path
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
  }

  body { font-family: 'Source Sans Pro', sans-serif; }
  .f-m-t-10 {
    margin-top: 10px;
  }
</style>
