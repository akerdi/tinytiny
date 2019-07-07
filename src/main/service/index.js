import axios from './http'

export const login = params => { return axios.post('/api/user/login', params, {withCredentials: true}) }
export const getTinyKeyWithAmount = params => { return axios.post('/api/tiny/getTinyKey', params, {withCredentials: true}) }
