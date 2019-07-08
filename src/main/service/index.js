import axios, { baseURL } from './http'
import { session } from 'electron'
import callAsync, { call } from '../awaitCall'

export const login = params => {
  return axios.post('/api/user/login', params, {withCredentials: true})
}
export const userProfile = params => {
  return axios.get('/api/user/profile', params, {withCredentials: true})
}
export const getTinyKeyWithAmount = params => {
  return axios.post('/api/tiny/getTinyKey', params, {withCredentials: true})
}
let userCookie = ''
export const userLoginValidation = async () => {
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  const [err, res] = await callAsync(sessionGetCookie({ url: baseURL }))
  console.log('res"""!!!!!!!', res)
  console.log('~~~~~err', err)
  if (err || !res || !res.length) {
    console.log('get defaultSession err or res is empty:', err)
    // TODO send login page to user
    return loginFuction('aker', '123')
  }
  userCookie = res
  console.log("user's cookie is :", res)
}

const loginFuction = async function (username, password) {
  // 用户开始准备登陆
  console.log('user is starting login')
  if (!username || !password) {
    throw new Error('参数有误!!!')
  }
  const params = {
    username,
    password
  }
  const [err, res] = await callAsync(login(params))
  if (err) {
    return console.log('11111111', err)
  }
  const cookie = {
    url: baseURL,
    name: 'cookie',
    value: getCookieFromRes(res)
  }
  console.log('cookie:::', cookie)
  userCookie = cookie.value
  const [setCookieErr] = await callAsync(sessionSetCookie(cookie))
  if (setCookieErr) {
    console.log('没有保存成功用户的cookie', setCookieErr)
  }
}
function getCookieFromRes(res) {
  return res.headers['set-cookie']
}

function sessionGetCookie(url) {
  return new Promise((resolve, reject) => {
    session.defaultSession.cookies.get({ url })
      .then(res => resolve(res))
      .catch(err => reject(err))
  })
}

function sessionSetCookie(cookie) {
  return new Promise((resolve, reject) => {
    session.defaultSession.cookies.set(cookie)
      .then(() => resolve())
      .reject(err => reject(err))
  })
}