require('colors')
require('dotenv').config({ path: './.env' })
const TelegramBot = require('node-telegram-bot-api')
const cron = require('node-cron')
const { connectDB, botConfig } = require('./config')
const { START, HELP, MENU_CMD, ABOUT } = require('./commands')
const {
  helpHandler,
  stuckHandler,
  deleteFlightHandler,
  dashboardSelectFlightHandler,
  updateFlightsHandler,
  notificationHandler,
  aboutHandler,
  dashboardReportFlightHandler,
  dashboardClearReportFlightHandler,
  dashboardChartHandler,
} = require('./handlers')
const { main } = require('./main')

/* -----------------------------------------------------------------------------
  * START APP
----------------------------------------------------------------------------- */
start()

async function start() {
  // * CONFIG
  const bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true })
  await botConfig(bot)
  await connectDB()

  // * ON MESSAGE
  bot.on('message', async msg => {
    switch (msg.text) {
      case START:
      case HELP:
        return helpHandler({ bot, msg })
      case ABOUT:
        return aboutHandler({ bot, msg })
      case MENU_CMD:
        return stuckHandler({ bot, msg })
      default:
        return main({ bot, msg })
    }
  })

  // * ON QUERY
  bot.on('callback_query', async q => {
    // console.log(q.data?.grey)
    const data = { bot, q }
    if (q.data.startsWith('DELETE_')) return deleteFlightHandler(data)
    if (q.data.startsWith('SELECT_')) return dashboardSelectFlightHandler(data)
    if (q.data.startsWith('REPORT_')) return dashboardReportFlightHandler(data)
    if (q.data.startsWith('CLEAR_')) return dashboardClearReportFlightHandler(data)
    if (q.data.startsWith('CHART_')) return dashboardChartHandler(data)

    return bot.answerCallbackQuery(q.id)
  })

  // * CRON (при запуске бота и по времени)
  await updateFlightsHandler()
  cron.schedule('1 0 * * * *', async () => await updateFlightsHandler())

  // * CHECK NOTIFICATIONS
  notificationHandler({ bot })
}
