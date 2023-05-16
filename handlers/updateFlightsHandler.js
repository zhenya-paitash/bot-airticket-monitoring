const moment = require('moment')
const { getLogTime } = require('../utils')
const Flight = require('../models/flightModel')

/* -----------------------------------------------------------------------------
  * UPDATE FLIGHTS HANDLER
----------------------------------------------------------------------------- */
async function updateFlightsHandler() {
  const now = moment().startOf('day')
  let deleteCount = 0
  let editCount = 0

  // ? удаляем все билеты, в которых конечная дата просрочена
  const deleted = await Flight.deleteMany({ 'date.to': { $lt: now } })
  deleteCount += deleted?.deletedCount

  // ? обновляем дату, нижнее значение которой просрочено
  const updated = await Flight.updateMany({ 'date.from': { $lt: now } }, { 'date.from': now })
  editCount += updated?.modifiedCount

  console.log(`${getLogTime()} Проверка билетов. Удалено: ${deleteCount}, Отредактированно: ${editCount}`.magenta)
}

module.exports = updateFlightsHandler
