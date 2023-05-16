const lng = require('../language')
const fs = require('fs')
const path = require('path')

async function aboutHandler({ bot, msg }) {
  const filePath = path.join(__dirname, '..', 'package.json')
  const package = JSON.parse(fs.readFileSync(filePath).toString())

  const message = lng.aboutMessage(package)
  return bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
}

module.exports = aboutHandler
