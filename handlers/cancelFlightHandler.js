const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const lng = require('../language')
const { fields, cancelBtn, flightsBtn } = require('../buttons')
const { MENU } = require('../commands')

/* -----------------------------------------------------------------------------
  * ON BUTTON
----------------------------------------------------------------------------- */
async function onBackBtnClick({ bot, msg, id, user, flights }) {
  await User.findOneAndUpdate({ id }, { status: MENU })
  msg.text = ''

  return require('../main').main({ bot, msg })
}

async function onCancelFlightAllBtnClick({ bot, msg, id, user, flights }) {
  await Flight.deleteMany({ user })
  await User.findOneAndUpdate({ id }, { status: MENU })
  msg.text = ''

  return require('../main').main({ bot, msg })
}

/* -----------------------------------------------------------------------------
  * CANCEL FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function cancelFlightHandler({ bot, msg, id, user }) {
  const flights = await Flight.find({ user })
  if (!flights.length) {
    await User.findOneAndUpdate({ id }, { status: MENU })
    msg.text = ''
    return require('../main').main({ bot, msg })
  }

  // * BUTTONS
  if (msg.text === fields.backBtnField) return onBackBtnClick({ bot, msg, id, user, flights })
  if (msg.text === fields.cancelFlightAllBtnField) return onCancelFlightAllBtnClick({ bot, msg, id, user, flights })

  await bot.sendMessage(id, lng.cancelFlightMessage, {
    parse_mode: 'HTML',
    ...cancelBtn,
  })

  return bot.sendMessage(id, lng.clickToDeleteMessage, {
    parse_mode: 'HTML',
    ...flightsBtn(flights),
  })
}

module.exports = cancelFlightHandler
