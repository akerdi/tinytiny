<template lang="pug">
  div(v-loading="loading") qiafan
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
