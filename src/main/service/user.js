import SendMessage from '../sendRoute'
import logger from '../utils/logger'
/**
 * userLoginStatus
 * wait = 0  // when err, redirect => /wait/text=err
 * login = 1
 * logout = 2
 */
export let userLoginStatus = 0

export function updateUserStatus (status, err) {
  logger('currentUserLoginStatus: ', userLoginStatus, ' : status: : ', status)
  if (userLoginStatus === status) {
    // 没有必要改变
    return
  }
  userLoginStatus = status
  const message = { status: userLoginStatus }
  if (err)
    message.err = err
  SendMessage.sendPromise('userStatusChange', message)
}

export default {
  status: userLoginStatus,
  userProfile: null
}