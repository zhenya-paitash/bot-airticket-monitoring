const moment = require('moment')
const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const Kayak = require('../models/kayakModel')
const Skyscanner = require('../models/skyscannerModel')
const { getYearsRange, getMonthsRange, getDaysRange, getDateRange, getLog } = require('../utils')
const { selectYearBtn, flightsDashboardBtn, selectMonthBtn, selectDayBtn, dayTicketsBtn } = require('../buttons')
const lng = require('../language')

/* -----------------------------------------------------------------------------
  * GET DATA FROM DB
----------------------------------------------------------------------------- */
async function getDataOne({ flight, year, month, day, page }) {
  const date = moment(`${day}.${+month + 1}.${year}`, 'D.M.YYYY')

  // ? get data from DB
  // let kayak = await Kayak.findOne({
  //   'direction.from': flight.direction.from,
  //   'direction.to': flight.direction.to,
  //   date,
  //   __v: { $ne: 0 },
  // })
  let skyscanner = await Skyscanner.findOne({
    'direction.from': flight.direction.from,
    'direction.to': flight.direction.to,
    date,
    __v: { $ne: 0 },
  })

  // ? create message
  const header = lng.ticketDayDataHeader(flight, date)
  const { content, pages, haveContent } = lng.ticketDayDataContent(flight, skyscanner, 'Skyscanner', page)
  const message = header + content

  // return message
  return { message, pages, haveContent }
}

async function getDataRange({ flight, year, month }) {
  let start = moment(flight.date.from)
  let end = moment(flight.date.to)
  const range = getDateRange(start, end, year, month)
  ;[start, end] = [range[0], range.at(-1)]

  // ? get data from DB
  // const kayak = await Kayak.find({
  //   'direction.from': flight.direction.from,
  //   'direction.to': flight.direction.to,
  //   date: {
  //     $gte: start.toISOString(),
  //     $lte: end.toISOString(),
  //   },
  // })
  const skyscanner = await Skyscanner.find({
    'direction.from': flight.direction.from,
    'direction.to': flight.direction.to,
    date: {
      $gte: start.toISOString(),
      $lte: end.toISOString(),
    },
  })

  // ? create message
  let header
  if (year && month) {
    header = lng.ticketMonthDataHeader(flight, year, month)
  } else if (year) {
    header = lng.ticketYearDataHeader(flight, year)
  }
  const { content, len } = lng.ticketRangeDataContent(flight, skyscanner, 'Skyscanner')
  const message = header + content

  return { message, len }
}

/* -----------------------------------------------------------------------------
  * SELECT FLIGHT > YEAR > MONTH > DAY
----------------------------------------------------------------------------- */
async function selectFlight({ bot, q, flights }) {
  try {
    await bot.editMessageText(`<i>Выберите билет</i>`, {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...flightsDashboardBtn(flights),
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }

  return
}

async function selectYear({ bot, q, flight, isBack }) {
  try {
    const start = moment(flight.date.from)
    const end = moment(flight.date.to)
    const years = getYearsRange(start, end)

    // ? если выбор только 1, то SKIP
    if (years.length === 1) {
      if (isBack) {
        q.data = q.data + '<'
        return dashboardSelectFlightHandler({ bot, q })
      }

      return selectMonth({ bot, q, flight, year: years[0] })
    }

    // ? get data message
    // const message = await getDataRange({ flight })

    await bot.editMessageText(`<b>Выберите год</b>`, {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...selectYearBtn(flight, years),
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }

  return
}

async function selectMonth({ bot, q, flight, isBack, year }) {
  try {
    const start = moment(flight.date.from)
    const end = moment(flight.date.to)
    const months = getMonthsRange(start, end, year)

    // ? если выбор только 1, то SKIP
    if (months.length === 1) {
      if (isBack) {
        q.data = q.data + '<'
        return dashboardSelectFlightHandler({ bot, q })
      }

      return selectDay({ bot, q, flight, year, month: months[0] })
    }

    // ? get data message
    const { message } = await getDataRange({ flight, year })

    await bot.editMessageText(`<b>Выберите месяц</b>\n\n${message}`, {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...selectMonthBtn(flight, year, months),
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }

  return
}

async function selectDay({ bot, q, flight, isBack, year, month }) {
  try {
    const start = moment(flight.date.from)
    const end = moment(flight.date.to)
    const months = getMonthsRange(start, end, year)
    const days = getDaysRange(start, end, year, month)
    // ? если выбор только 1, то SKIP
    if (days.length === 1) {
      if (isBack) {
        q.data = q.data + '<'
        return dashboardSelectFlightHandler({ bot, q })
      }

      return showDayTickets({ bot, q, flight, year, month, day: days[0] })
    }

    // ? get data message
    const { message, len } = await getDataRange({ flight, year, month })

    await bot.editMessageText(`<b>Выберите день</b>\n\n${message}`, {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...selectDayBtn(flight, year, month, days, months, len),
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }

  return
}

async function showDayTickets({ bot, q, flight, year, month, day, page }) {
  try {
    page = +page || 1

    // ? GET DATA
    const { message, pages, haveContent } = await getDataOne({ flight, year, month, day, page })
    const range = getDateRange(moment(flight.date.from), moment(flight.date.to)).map(i => i.format('DD.MM.YY'))
    const currentDate = moment({ year, month, day }).format('DD.MM.YY')
    const currentDateIdx = range.indexOf(currentDate)
    // const [prevDate, nextDate] = [
    //   range[currentDateIdx - 1 < 0 ? range.length - 1 : currentDateIdx - 1],
    //   range[currentDateIdx + 1 > range.length - 1 ? 0 : currentDateIdx + 1],
    // ]
    const prevDate = range[currentDateIdx - 1] || null
    const nextDate = range[currentDateIdx + 1] || null

    await bot.editMessageText(message, {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...dayTicketsBtn(flight, year, month, day, page, pages, haveContent, {
        prev: prevDate,
        next: nextDate,
        all: range,
      }),
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }

  return
}

/* -----------------------------------------------------------------------------
  * DASHBOARD SELECT FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function dashboardSelectFlightHandler({ bot, q }) {
  const id = q.from.id
  // * USER
  const user = await User.findOne({ id })
  if (!user) {
    return bot.sendMessage(id, lng.userNotFound, { parse_mode: 'HTML' })
  }

  // * BACK BTN HANDLER
  const isBack = q.data.endsWith('<')
  if (isBack) q.data = q.data.split('_')?.slice(0, -1)?.join('_')

  // * GET SELECTED DATA
  let [_, flightId, year, month, day, page, pages] = q.data?.split('_')
  if (!flightId) {
    const flights = await Flight.find({ user })
    return selectFlight({ bot, q, flights })
  }

  const flight = await Flight.findOne({ user, _id: flightId })
  if (!flight) {
    try {
      return await bot.editMessageText(`<i>Действие заблокированно. Сообщение устарело</i>`, {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
        reply_markup: { inline_keyboard: [] },
        parse_mode: 'HTML',
      })
    } catch (e) {
      return bot.sendMessage(id, `<i>Билет не найден</i>`, {
        parse_mode: 'HTML',
      })
    }
  }

  // * HANDLERS
  if (year && month && day) return showDayTickets({ bot, q, flight, isBack, year, month, day, page, pages })
  if (year && month) return selectDay({ bot, q, flight, isBack, year, month })
  if (year) return selectMonth({ bot, q, flight, isBack, year })
  return selectYear({ bot, q, flight, isBack })
}

module.exports = dashboardSelectFlightHandler
