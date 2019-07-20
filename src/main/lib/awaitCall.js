const util = require('util')

export function callAsync(promise) {
  return promise
    .then((data) => [null, data])
    .catch(err => [err, null])
}

export function call(func, ...args) {
  const promise = util.promisify(func).call(this, ...args)
  if (typeof promise !== 'object') {
    return Promise.reject('func should match util.promisify')
  }
  return callAsync(promise)
}

export default callAsync
