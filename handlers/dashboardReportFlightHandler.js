const fs = require('fs')
const path = require('path')
const moment = require('moment')
const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const Kayak = require('../models/kayakModel')
const Skyscanner = require('../models/skyscannerModel')
const lng = require('../language')
const { sleep } = require('../utils')
const { deleteReportMessagesBtn } = require('../buttons')

/* -----------------------------------------------------------------------------
  * GET DATA FROM DB
----------------------------------------------------------------------------- */
async function getTicketData({ flight, date }) {
  // const data = await Kayak.findOne({
  //   'direction.from': flight.direction.from,
  //   'direction.to': flight.direction.to,
  //   date,
  //   __v: { $ne: 0 },
  // })
  const data = await Skyscanner.findOne({
    'direction.from': flight.direction.from,
    'direction.to': flight.direction.to,
    date,
    __v: { $ne: 0 },
  })

  return data
}

function getFile({ flight, date, tickets }) {
  const fileName = `${moment(date).format('YYMMDD')}[${flight.direction.from
    .slice(0, 3)
    .toLowerCase()}-${flight.direction.to.slice(0, 3).toLowerCase()}].json`
  const filePath = path.join(__dirname, '..', 'reports', fileName)
  fs.writeFileSync(filePath, JSON.stringify(tickets), 'utf-8')
  return filePath
}

function getReportFile({ flight, date, dayData, type }) {
  const extname = type.toLowerCase()
  const { from, to, fromCode, toCode } = flight.direction

  let text
  if (type === 'TXT') text = getReportFileTxt({ from, to, date, dayData })
  if (type === 'JSON') text = getReportFileJson(dayData)

  const buffer = Buffer.from(text, 'utf-8')
  const filename = `${fromCode}-${toCode}_${moment(date).format('DDMMYY')}.${extname}`
  const fileOptions = {
    filename,
    // contentType: 'document/json',
  }

  return { buffer, fileOptions }
}

function getReportFileTxt({ from, to, date, dayData }) {
  const header = `Направление: ${from} - ${to}\nДата: ${moment(date).format('DD.MM.YYYY')}\n\n`
  const text =
    header +
    dayData.tickets
      ?.map(({ departure, arrival, stops, duration, price, link }) => {
        const priceStr = `Цена: ${price}$`
        const timeStr = `Отправление: ${departure} - ${arrival}`
        let h = Math.floor(duration / 60)
        let m = duration % 60
        const durationStr = `Вермя в пути: ${h ? `${h}h ${m}m` : `${m}m`}`
        const stopsStr = `Остановок: ${stops}`
        const linkStr = `Ссылка: ${link}`
        const str = [priceStr, timeStr, durationStr, stopsStr, linkStr].join('\n')

        return str
      })
      .join('\n\n')

  return text
}

function getReportFileJson({ direction, date, url, minPrice, tickets }) {
  const res = { direction, date: moment(date).add(3, 'hours'), url, minPrice, tickets }
  const json = JSON.stringify(res, null, 2)
  return json
}

function getReportMessages({ flight, date, dayData }) {
  const messageOptions = { parse_mode: 'HTML', disable_web_page_preview: true }
  const messages = []

  const { fromCode, toCode } = flight.direction
  const header = `<b><u>${fromCode} - ${toCode}, ${moment(date).format('DD.MM.YYYY')}</u></b>`
  const rows = getReportMessagesText({ dayData })

  // const TELEGRAM_MESSAGE_MAX_LENGTH = 4096
  const TELEGRAM_MESSAGE_MARKDOWN_MAX_LENGTH = 9500
  rows.reduce((acc, cur, idx) => {
    if (acc.length + cur.length + header.length > TELEGRAM_MESSAGE_MARKDOWN_MAX_LENGTH) {
      messages.push(header + acc)
      acc = ''
    }

    acc = [acc, cur].join('\n')
    if (idx === rows.length - 1) messages.push(header + acc)

    return acc
  }, '')

  return { messages, messageOptions }
}

function getReportMessagesText({ dayData }) {
  const rows = dayData.tickets?.map(ticket => {
    const { departure, arrival, stops, duration, price, link } = ticket

    let h = Math.floor(duration / 60)
    let m = duration % 60
    const timeStr = `${departure} - ${arrival}`
    const durationStr = `${h ? `${h}h ${m}m` : `${m}m`}`
    const stopsStr = `<b>${stops}</b> остановок`
    const str = `▫️ <a href="${link}">${price}$</a>, <i>${timeStr}, ${durationStr}, ${stopsStr}</i>`

    return str
  })

  return rows
}

/* -----------------------------------------------------------------------------
  * DASHBOARD REPORT FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function dashboardReportFlightHandler({ bot, q }) {
  const id = q.from.id
  // * USER
  const user = await User.findOne({ id })
  if (!user) {
    return bot.sendMessage(id, lng.userNotFound, { parse_mode: 'HTML' })
  }

  // * GET SELECTED DATA
  let [_, type, flightId, year, month, day] = q.data?.split('_')
  if (![flightId, year, month, day].every(Boolean)) {
    return bot.sendMessage(id, lng.errorReportFile, { parse_mode: 'HTML' })
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
      return bot.sendMessage(id, `<i>Билет не найден</i>`, { parse_mode: 'HTML' })
    }
  }

  const date = moment(`${day}.${+month + 1}.${year}`, 'D.M.YYYY')
  const dayData = await getTicketData({ flight, date })

  const data = { bot, q, id, user, flightId, date, flight, dayData, type }

  switch (type) {
    case 'TXT':
      return dashboardReportFileFlightHandler(data)
    case 'JSON':
      return dashboardReportFileFlightHandler(data)
    case 'MSG':
      return dashboardReportMessageFlightHandler(data)
  }
}

async function dashboardReportFileFlightHandler({ bot, q, id, date, flight, dayData, type }) {
  try {
    const { buffer, fileOptions } = getReportFile({ flight, date, dayData, type })
    await bot.sendDocument(id, buffer, {}, fileOptions)
    return bot.answerCallbackQuery(q.id)
  } catch (e) {
    console.log(e?.message?.red)
  }
}

async function dashboardReportMessageFlightHandler({ bot, q, id, date, flight, dayData }) {
  try {
    const messagesId = []
    const { messages, messageOptions } = getReportMessages({ flight, date, dayData })
    for (let msg of messages) {
      const { message_id } = await bot.sendMessage(id, msg, messageOptions)
      messagesId.push(message_id)
      // await sleep(0.1)
    }

    await bot.sendMessage(id, lng.clearReportMessages, { parse_mode: 'HTML', ...deleteReportMessagesBtn(messagesId) })

    return bot.answerCallbackQuery(q.id)
  } catch (e) {
    console.log(e?.message?.red)
  }
}

module.exports = dashboardReportFlightHandler
