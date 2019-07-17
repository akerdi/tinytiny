import moment from 'moment'
export default function log(msg, ...addition) {
  const dateStr = moment().format('MM-DD hh:mm:ss ')
  console.log(dateStr + msg, addition)
}