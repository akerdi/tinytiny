<template lang="pug">
  .container(v-loading="loading") qiafan11111
</template>

<script>
export default {
  data () {
    return {
      loading: true
    }
  },
  mounted () {
    const errText = this.$route.query.err
    console.log('111111:', errText)
  }
}
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 500px;
}
</style>
