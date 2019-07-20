<template lang="pug">
  .container
    .loginPanel
      .logo
        img(src='@/assets/images/logo.png' alt='qi fan')
      transition(name='el-zoom-in-center')
        el-form(v-show="showContent" ref="loginForm" :model="loginForm" :rules="loginRule" auto-complete="off" label-position="left")
          el-form-item(prop='username')
            el-input.account(type="text" v-model="loginForm.username", size="medium" placeholder="account length >= 3" auto-complete="off")
          el-form-item(prop="password")
            el-input(type="password" v-model="loginForm.password" placeholder='password length >= 3' size="medium" @keyup.enter.native="login" :maxlength="40" auto-complete="off")
          el-form-item
            .flex-row-center
              el-button.login_btn.f-m-r-10.f-m-r-5(type="primary" @click.native.prevent="login" :loading="loginLoading") login
              el-button.login_btn(type="primary" @click.native.prevent="gotoRegister" :loading="loginLoading") register
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRule: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur', min: 3, max: 20 }],
        password: [{ required: true, message: '请输入密码, 长度为3~40个字符', trigger: 'blur', min:3, max: 40}]
      },
      showContent: false,
      loginLoading: false,
    }
  },
  methods: {
    login () {
      this.verifyForm((message) => {
        this.$electron.ipcRenderer.send('userLogin', message)
      })
    },
    gotoRegister () {
      this.verifyForm((message) => {
        this.$electron.ipcRenderer.send('userRegister', message)
      })
    },
    verifyForm (cb) {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) return
        const message = {
          ...this.loginForm
        }
        cb(message)
        this.loginLoading = true
      })
    }
  },
  mounted () {
    this.showContent = true
    this.$electron.ipcRenderer.on('userRegisterCallback', (event, msg) => {
      console.log('userRegisterCallback:', msg)
      if (msg.err) {
        this.$message.error(msg.err.response.data)
        this.loginLoading = false
      }
    })
    this.$electron.ipcRenderer.on('userLoginCallback', (event, msg) => {
      console.log('userLoginCallback:', msg)
      if (msg.err) {
        this.$message.error(msg.err.response.data)
        this.loginLoading = false
      }
    })
  }
}
</script>

<style lang="scss">
.container {
  width: 100vw;
  height: 100vh;

  .loginPanel {
    margin: 0 auto;
    background-color: blueviolet;
    margin-top: 20vh;
    width: calc(100% - 50%);
    display: block;
    // flex-direction: column;
    // justify-content: center;
    border-radius: 8px;
    .logo {
      margin: 0 auto;
      img {
        margin-top: 20px;
        margin-bottom: 20px;
      }
    }
    .login_btn {
      max-width: 100px;
      margin-bottom: 20px;
    }
  }
}
</style>
