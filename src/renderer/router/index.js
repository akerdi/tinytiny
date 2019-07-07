import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const HomePage = require('@/pages/home').default

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
