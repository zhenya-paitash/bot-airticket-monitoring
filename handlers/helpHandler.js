const lng = require('../language')

async function helpHandler({ bot, msg }) {
  const message = lng.helpMessage
  return bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
}

module.exports = helpHandler
