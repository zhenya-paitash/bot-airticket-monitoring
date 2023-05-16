// const { sleep } = require('../utils')

/* -----------------------------------------------------------------------------
  * DASHBOARD CLEAR REPORT FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function dashboardClearReportFlightHandler({ bot, q }) {
  const id = q.from.id
  const [_, ...messages] = q.data.split('_')

  for (let msg of messages.reverse()) {
    bot.deleteMessage(id, msg).catch(e => {})
  }

  // try {
  //   // await bot.answerCallbackQuery(q.id)
  //   await bot.deleteMessage(id, q.message?.message_id)
  // } catch (e) {}
  await bot.deleteMessage(id, q.message?.message_id).catch(e => {})
}

module.exports = dashboardClearReportFlightHandler
