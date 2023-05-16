const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const lng = require('../language')
const { MENU, CANCEL_FLIGHT } = require('../commands')
const { flightsBtn } = require('../buttons')
const { getLog } = require('../utils')

/* -----------------------------------------------------------------------------
  * CANCEL FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function deleteFlightHandler({ bot, q }) {
  try {
    const user = await User.findOne({ id: q.from.id })
    if (!user) {
      return bot.sendMessage(id, lng.userNotFound, { parse_mode: 'HTML' })
    }

    if (user.status !== CANCEL_FLIGHT) {
      await bot.editMessageText(`<i>Действие заблокированно. Сообщение устарело</i>`, {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
        reply_markup: { inline_keyboard: [] },
        parse_mode: 'HTML',
      })

      return
    }

    const deleteId = q.data?.split('_')[1]

    await Flight.deleteOne({ user, _id: deleteId })
    const flights = await Flight.find({ user })

    try {
      await bot.editMessageReplyMarkup(flightsBtn(flights).reply_markup, {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
      })
    } catch (e) {}

    if (!flights.length) {
      user.status = MENU
      await user.save()

      q.message.text = ''
      return require('../main').main({ bot, msg: q.message })
    }

    return
  } catch (e) {
    console.log(getLog(e?.message).red)
  }
}

module.exports = deleteFlightHandler
