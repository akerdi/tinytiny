import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import router from '../router'
import { ipcRenderer } from 'electron'

export default new Vuex.Store({
  state: {
    login: false,
    userData: null
  }
})

// 指定监听
ipcRenderer.on('userStatusChange', (event, msg) => {
  console.log('[userStatusChange] msg:', msg)
  let err = null
  if (msg.err) {
    err = msg.err.response.data
  }
  const userLoginStatus = msg.status
  changeRoute(userLoginStatus, err)
})

function changeRoute(userLoginStatus, err) {
  let routeInfo = null
  switch (userLoginStatus) {
    case 1:
      routeInfo = {name: 'home'}
      break;
    case 2:
      routeInfo = {name: 'login'}
      break;
    default: // 0
      routeInfo = {name: 'wait'}
      break;
  }
  if (err) {
    routeInfo.query = { err }
  }
  router.push(routeInfo)
}
ipcRenderer.send('getCookie')
// ipcRenderer.send('getUserProfile')
