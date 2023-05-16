const moment = require('moment')

const sleep = s => new Promise(resolve => setTimeout(resolve, s * 1_000))

const numToEmoji = n => {
  const numbers = {
    0: '0️⃣',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
  }

  return String(n)
    .split('')
    .map(i => numbers[+i])
    .join('')
}

const getDateRange = (start, end, year, month) => {
  let dates = []

  let now = start
  while (now <= end) {
    dates.push(now)
    now = moment(now).add(1, 'day')
  }

  if (year !== undefined) dates = dates.filter(i => i.year() == year)
  if (month !== undefined) dates = dates.filter(i => i.month() == month)

  return dates
}

const getYearsRange = (start, end) => {
  const dates = getDateRange(start, end)
  return [...new Set(dates.map(i => i.year()))]
}

const getMonthsRange = (start, end, year) => {
  const dates = getDateRange(start, end, year)
  return [...new Set(dates.map(i => i.month()))]
}

const getDaysRange = (start, end, year, month) => {
  const dates = getDateRange(start, end, year, month)
  return [...new Set(dates.map(i => i.date()))]
}

const getDiffPercentage = (a, b) => {
  const [min, max] = [Math.min(a, b), Math.max(a, b)]
  const diff = ((max - min) / max) * 100
  return +diff.toFixed(2)
}

const getLogTime = () => {
  const now = moment().format('HH:mm:ss DD.MM.YY')
  return `[${now}]`
}

const getLog = message => {
  const time = moment().format('HH:mm:ss DD.MM.YY')
  return `[${time}] ${message}`
}

module.exports = {
  sleep,
  numToEmoji,
  getDateRange,
  getYearsRange,
  getMonthsRange,
  getDaysRange,
  getDiffPercentage,
  getLogTime,
  getLog,
}
