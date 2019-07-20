<template lang="pug">
  .container(v-loading="loading")
    .f-tac.f-m-t-44 {{errText}}
    div
      el-button.gotoLogin(v-show="!loading" @click="gotoLogin" type="primary") 登录
</template>

<script>
export default {
  data () {
    return {
      loading: true,
      errText: ''
    }
  },
  methods: {
    gotoLogin () {
      this.$router.push({name: "login"})
    }
  },
  mounted () {
    this.errText = this.$route.query.err
    if (this.errText) {
      this.loading = false
    }
  }
}
</script>
<style lang="scss">
.container {
  height: 100vh;
  div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    .gotoLogin {
      margin-top: 50px;
    }
  }
  // .gotoLogin {
  //   margin-top: 1vh;
  //   // margin: 0 auto;
  //   text-align:center;
  // }
}
</style>
