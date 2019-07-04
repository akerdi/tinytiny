import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const LandingPage = require('@/components/LandingPage').default

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: LandingPage
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
