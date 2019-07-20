import SendRoute from '../utils/sendRoute'
import logger from '../utils/logger'
/**
 * userLoginStatus
 * wait = 0  // when err, redirect => /wait/text=err
 * home = 1
 * login = 2
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
  SendRoute.sendUserStatusChange(message)
}

export default {
  status: userLoginStatus,
  userProfile: null
}