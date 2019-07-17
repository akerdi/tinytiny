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

ipcRenderer.on('userStatusChange', (event, msg) => {
  console.log('[userStatusChange] msg:', msg)
  if (msg.err) {
    router.push({path: 'wait', query: {err: msg.err.response.data}})
  } else {
    const userLoginStatus = msg.status
    changeRoute(userLoginStatus)
  }
})

function changeRoute(userLoginStatus) {
  switch (userLoginStatus) {
    case 1:
      router.push({name: 'home'})
      break;
    case 2:
      router.push({name: 'login'})
      break;
    default: // 0
      router.push({name: 'wait'})
      break;
  }
}
ipcRenderer.send('getUserProfile')
