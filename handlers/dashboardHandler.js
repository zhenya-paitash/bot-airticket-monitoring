const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const lng = require('../language')
const { MENU } = require('../commands')
const { fields, menuBtn, dashboardBtn, flightsDashboardBtn } = require('../buttons')

/* -----------------------------------------------------------------------------
  * ON BUTTON
----------------------------------------------------------------------------- */
// ? BACK BTN
async function onBackBtnClick({ bot, msg, id, user }) {
  user = await User.findOneAndUpdate({ id }, { status: MENU }, { new: true })
  msg.text = ''

  return require('./menuHandler')({ bot, msg, id, user })
}

/* -----------------------------------------------------------------------------
  * DASHBOARD HANDLER
----------------------------------------------------------------------------- */
async function dashboardHandler({ bot, msg, id, user }) {
  // * BUTTONS
  if (msg.text === fields.backBtnField) return onBackBtnClick({ bot, msg, id, user })

  const flights = await Flight.find({ user })

  // * Выход, если нет рейсов
  if (!flights.length) {
    user = await User.findOneAndUpdate({ id }, { status: MENU }, { new: true })
    await bot.sendMessage(id, lng.noFlightDashboardMessage, {
      parse_mode: 'HTML',
      ...menuBtn(user.notification, flights.length),
    })

    msg.text = ''

    return require('./menuHandler')({ bot, msg, id, user })
  }

  await bot.sendMessage(id, '#dashboard', dashboardBtn)
  return bot.sendMessage(id, `<i>Выберите билет</i>`, {
    parse_mode: 'HTML',
    ...flightsDashboardBtn(flights),
  })
}

module.exports = dashboardHandler
