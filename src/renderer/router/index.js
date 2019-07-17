import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const HomePage = require('@/pages/home').default
const Login = require('@/pages/login').default
const Wait = require('@/pages/wait').default

export default new Router({
  routes: [
    { path: '/home', name: 'home',
      component: HomePage },
    { path: '/', name: 'login',
      component: Login },
    { path: '/wait', name: 'wait',
      component: Wait },
    { path: '*',
      redirect: '/login' }
  ]
})
