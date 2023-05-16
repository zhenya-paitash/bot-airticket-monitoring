const moment = require('moment')
const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const lng = require('../language')
const { ADD_FLIGHT, CANCEL_FLIGHT } = require('../commands')
const { fields, menuBtn, backBtn, flightsDashboardBtn } = require('../buttons')

/* -----------------------------------------------------------------------------
  * ON BUTTON
----------------------------------------------------------------------------- */
// ? ADD FLIGHT
async function onAddBtnClick({ bot, msg, id, user }) {
  user = await User.findOneAndUpdate({ id }, { status: ADD_FLIGHT }, { new: true })

  const fromExample = moment().format('DD.MM.YY')
  const toExample = moment().add(7, 'days').format('DD.MM.YY')
  const startNextMonthExample = moment().add(1, 'month').startOf('month').format('DD.MM.YY')
  const message = lng.addTicketMessage(fromExample, toExample, startNextMonthExample)
  await bot.sendMessage(id, message, {
    parse_mode: 'HTML',
    ...backBtn,
  })

  msg.text = ''
  return require('./addFlightHandler')({ bot, msg, id, user })
}

// ? CANCEL FLIGHT
async function onCancelFlightBtnClick({ bot, msg, id, user }) {
  const flights = await Flight.find({ user })
  if (!flights.length) {
    const message = lng.noFlightMessage
    return bot.sendMessage(id, message, {
      parse_mode: 'HTML',
      ...menuBtn(user.notification, flights.length),
    })
  }

  user = await User.findOneAndUpdate({ id }, { status: CANCEL_FLIGHT }, { new: true })

  msg.text = ''
  return require('./cancelFlightHandler')({ bot, msg, id, user })
}

// ? SHOW FLIGHTS
async function onShowFlightBtnClick({ bot, msg, id, user }, showTag = true) {
  const flights = await Flight.find({ user })
  if (showTag) {
    await bot.sendMessage(id, '#menu', menuBtn(user.notification, flights.length))
  }

  if (!flights.length) return

  msg.text = ''
  return bot.sendMessage(id, lng.chooseTicket, {
    parse_mode: 'HTML',
    ...flightsDashboardBtn(flights),
  })
}

// ? NOTIFICATION
async function onNotificationBtnClick({ bot, msg, id, user }) {
  user = await User.findOneAndUpdate({ id: msg.chat.id }, { notification: !user.notification }, { new: true })
  const flights = await Flight.find({ user })

  return bot.sendMessage(id, lng.notificationOnOffMessage(user.notification), {
    parse_mode: 'HTML',
    ...menuBtn(user.notification, flights.length),
  })
}

/* -----------------------------------------------------------------------------
  * MENU HANDLER
----------------------------------------------------------------------------- */
async function menuHandler({ bot, msg, id, user }) {
  // * BUTTONS
  if (msg.text === fields.addBtnField) return onAddBtnClick({ bot, msg, id, user })
  if (msg.text === fields.cancelFlightBtnField) return onCancelFlightBtnClick({ bot, msg, id, user })
  if (msg.text === fields.showFlightsBtnField) return onShowFlightBtnClick({ bot, msg, id, user }, false)
  if ([fields.notificationOnBtnField, fields.notificationOffBtnField].includes(msg.text))
    return onNotificationBtnClick({ bot, msg, id, user })

  // * LOGIC
  return onShowFlightBtnClick({ bot, msg, id, user })
}

module.exports = menuHandler
