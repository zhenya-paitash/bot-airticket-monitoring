const User = require('./models/userModel')
const { MENU, ADD_FLIGHT, CANCEL_FLIGHT, DASHBOARD, NOTIFICATION } = require('./commands')
const { menuHandler, addFlightHandler, cancelFlightHandler, dashboardHandler } = require('./handlers')

/* -----------------------------------------------------------------------------
  * MAIN
----------------------------------------------------------------------------- */
async function main({ bot, msg }) {
  // * USER
  let user = await User.findOne({ id: msg.chat.id })
  if (!user) {
    let { id, username, first_name, last_name } = msg.chat
    let { language_code, is_bot, is_premium } = msg.from
    user = await User.create({ id, username, first_name, last_name, language_code, is_bot, is_premium })
  }

  const { id, status } = user
  const data = { bot, msg, id, user }

  // * STATUS
  switch (status) {
    case MENU:
      return menuHandler(data)
    case ADD_FLIGHT:
      return addFlightHandler(data)
    case CANCEL_FLIGHT:
      return cancelFlightHandler(data)
    case DASHBOARD:
      return dashboardHandler(data)
    case NOTIFICATION:
      return
  }
}

/* -----------------------------------------------------------------------------
  * EXPORTS
----------------------------------------------------------------------------- */
module.exports = { main }
