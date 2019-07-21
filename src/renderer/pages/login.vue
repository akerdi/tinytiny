<template lang="pug">
  .container
    .loginPanel
      .logo
        img(src='@/assets/images/logo.png' alt='qi fan')
      transition(name='el-zoom-in-center')
        el-form.formClass(v-show="showContent" ref="loginForm" :model="loginForm" :rules="loginRule" auto-complete="off" label-position="left")
          el-form-item(prop='username')
            el-input.input.account(type="text" v-model="loginForm.username", size="medium" placeholder="account length >= 3" auto-complete="off")
          el-form-item(prop="password")
            el-input.input(type="password" v-model="loginForm.password" placeholder='password length >= 3' size="medium" @keyup.enter.native="login" :maxlength="40" auto-complete="off")
          el-form-item
            .flex-row-center
              el-button.login_btn.f-m-r-10.f-m-r-20(type="primary" @click.native.prevent="login" :loading="loginLoading") Login
              el-button.login_btn(type="primary" @click.native.prevent="gotoRegister" :loading="loginLoading") Regist
    .f-tac SALES!!! Gain 200 useage after regist
    .f-tac.f-m-t-5 活动日!!! 注册送200张任意使用券
    .tac.f-m-t-5(style="color: #545454") 更多咨询/定制/合作请联系QQ: 767838865
</template>

<script>
import { HTTPSend, LoginHTTPListener, destroyOn } from '@/service'
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRule: {
        username: [{ required: true, message: 'please enter account', trigger: 'blur', min: 3, max: 20 }],
        password: [{ required: true, message: 'password length < 40 charactor', trigger: 'blur', min:3, max: 40}]
      },
      showContent: false,
      loginLoading: false
    }
  },
  methods: {
    login () {
      this.verifyForm((message) => {
        HTTPSend('userLogin', message)
      })
    },
    gotoRegister () {
      this.verifyForm((message) => {
        HTTPSend('userRegister', message)
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
    },
    httpCallback (eventName, data) {
      switch (eventName) {
        case 'userLoginCallback':
          if (data.err) {
            this.$message.error(data.err.response.data)
            this.loginLoading = false
          }
          break
        case 'userRegisterCallback':
          if (data.err) {
            this.$message.error(data.err.response.data)
            this.loginLoading = false
          }
          break
      }
    }
  },
  mounted () {
    this.showContent = true
    LoginHTTPListener(this.httpCallback)
  },
  beforeDestroy () {
    destroyOn('login')
  }
}
</script>

<style lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  .f-tac {
    font-weight: bold;
    font-size: 15px;
  }

  .loginPanel {
    margin: 0 auto;
    background-color: blueviolet;
    margin-top: 20vh;
    width: calc(100% - 50%);
    min-width: 320px;
    display: block;
    border-radius: 8px;
    .logo {
      margin: 0 auto;
      img {
        margin-top: 20px;
        margin-bottom: 20px;
      }
    }
    .formClass {
      width: 100%;
    }
    .input {
      min-width: 250px;
    }
    .login_btn {
      max-width: 100px;
      min-width: 85px;
      margin-bottom: 20px;
    }
  }

}
</style>

