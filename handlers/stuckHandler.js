const User = require('../models/userModel')
const { MENU } = require('../commands')

async function stuckHandler({ bot, msg }) {
  // * USER
  let user = await User.findOne({ id: msg.chat.id })
  if (user) {
    // user = await userUpdateTicketDates(user)
    user.status = MENU
    await user.save()
  } else {
    let { id, username, first_name, last_name } = msg.chat
    let { language_code, is_bot, is_premium } = msg.from
    user = await User.create({ id, username, first_name, last_name, language_code, is_bot, is_premium })
  }

  return require('../main').main({ bot, msg })
}

module.exports = stuckHandler
