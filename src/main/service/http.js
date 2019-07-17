import axios from 'axios'
import User, { updateUserStatus } from './user'

axios.defaults.timeout = 5000
axios.defaults.retry = 3
axios.defaults.retryDelay = 800
axios.defaults.withCredentials = true

if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://localhost:7700/'
}

export const baseURL = axios.defaults.baseURL
console.log('axios.defaults.baseURL::: ', axios.defaults.baseURL)

axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error.response.data)
  }
)

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          if (error.response.data === 'Login Request') {
            User.userProfile = null
            updateUserStatus(2, new Error('Login Request'))
          }
      }
    }
    return Promise.reject(error)
  }
)

export default axios
