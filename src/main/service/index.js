import axios, { baseURL } from './http'
// import { session } from 'electron'
import storage from 'electron-json-storage'
import callAsync, { call } from '../lib/awaitCall'
import User, { updateUserStatus } from '../user'
import SendRoute from '../utils/sendRoute'
import logger from '../utils/logger'

export const login = params => {
  return axios.post('/api/user/login', params)
}
export const register = params => {
  console.log('~~~~~~~~~~~~~~~~~', params)
  return axios.post('/api/user/register', params)
}
export const userProfile = params => {
  return axios({
    method: 'get', url: '/api/user/profile',
    headers: { Cookie: userCookie }
  })
}
export const getTinyKeyWithAmount = params => {
  return axios({
    method: 'post', url: '/api/tiny/getTinyKey',
    headers: { Cookie: userCookie }, data: params
  })
}
export const finishTask = params => {
  return axios({
    method: 'post', url: '/api/tiny/finishTiny',
    headers: { Cookie: userCookie }, data: params
  })
}


//////////////
export const clearCookie = () => {
  storage.clear(err => {
    console.log('start clear all cookies')
    if (err)
      console.log('clearCookieErr:' , err)
    userCookie = null
    updateUserStatus(2, new Error('Login required'))
  })
}
let userCookie = ''
export const getCookie = async () => {
  const [err, res] = await callAsync(sessionGetCookie(baseURL))
  if (err || !res || !res.length) {
    logger('当前没有cookie')
    User.userProfile = null
    updateUserStatus(2)
    return
  }
  userCookie = res
  axios.defaults.headers.post['Cookie'] = userCookie
  updateUserStatus(1)
  logger('[getCookie] currentCookie is :', userCookie)
}
export const userLoginValidation = async (username, password) => {
  const [err, res] = await callAsync(sessionGetCookie(baseURL))
  if (err || !res || !res.length) {
    console.log('get defaultSession err or res is empty:', err)
    if (!username || !password) {
      // send login page to user
      return updateUserStatus(2)
    }
    return loginFuction(username, password)
  }
  userCookie = res
  axios.defaults.headers.post['Cookie'] = userCookie
  console.log("user's cookie is :", res)
}
export const userRegister = async (username, password) => {
  console.log('@@@@@@@@@@@@@@@@2', username, password)
  const [err, res] = await callAsync(register({username, password}))
  if (err) {
    // TODO 用户注册错误
    SendRoute.sendPromise('userRegisterCallback', { err })
    return logger.log('register Error:', err.response)
  }
  loginAfterWithResponse(res)
}

const loginFuction = async function (username, password) {
  // 用户开始准备登陆
  console.log('user is starting login')
  if (!username || !password) {
    throw new Error('参数有误!!!')
  }
  const params = {
    username, password
  }
  const [err, res] = await callAsync(login(params))
  if (err) {
    // TODO 用户登录错误
    SendRoute.sendPromise('userLoginCallback', { err })
    return console.log('loginError: ', err.response)
  }
  loginAfterWithResponse(res)
}
async function loginAfterWithResponse (res) {
  const _cookie = getCookieFromRes(res)
  if (_cookie) {
    const cookie = {
      url: baseURL,
      value: _cookie
    }
    console.log('cookie:::', cookie)
    userCookie = cookie.value
    axios.defaults.headers.post['Cookie'] = userCookie
    const [setCookieErr] = await callAsync(sessionSetCookie(cookie))
    if (setCookieErr) {
      console.log('没有保存成功用户的cookie', setCookieErr)
    }
    User.userProfile = res.data
    updateUserStatus(1)
    return true
  } else {
    User.userProfile = null
    updateUserStatus(2)
    console.log('没有登录成功')
    return false
  }
}
function getCookieFromRes(res) {
  const cookies = res.headers['set-cookie']
  for (const cookieStr of cookies) {
    console.log('!!!!!!!!!!!!!', cookieStr)
    if (/ahuang-budget=/.test(cookieStr)) {
      console.log(cookieStr)
      return cookieStr
    }
  }
  return null
}

function sessionGetCookie(url) {
  return new Promise((resolve, reject) => {
    storage.get(url, function(error, data) {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

function sessionSetCookie(cookie) {
  return new Promise((resolve, reject) => {
    storage.set(cookie.url, cookie.value, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}