/* -----------------------------------------------------------------------------
  * IMPORT HANDLERS
----------------------------------------------------------------------------- */
const helpHandler = require('./helpHandler')
const aboutHandler = require('./aboutHandler')
const stuckHandler = require('./stuckHandler')
const menuHandler = require('./menuHandler')
const addFlightHandler = require('./addFlightHandler')
const cancelFlightHandler = require('./cancelFlightHandler')
const deleteFlightHandler = require('./deleteFlightHandler')
const dashboardHandler = require('./dashboardHandler')
const dashboardSelectFlightHandler = require('./dashboardSelectFlightHandler')
const dashboardReportFlightHandler = require('./dashboardReportFlightHandler')
const dashboardClearReportFlightHandler = require('./dashboardClearReportFlightHandler')
const dashboardChartHandler = require('./dashboardChartHandler')
const updateFlightsHandler = require('./updateFlightsHandler')
const notificationHandler = require('./notificationHandler')

/* -----------------------------------------------------------------------------
  * EXPORTS
----------------------------------------------------------------------------- */
module.exports = {
  helpHandler,
  aboutHandler,
  stuckHandler,
  menuHandler,
  addFlightHandler,
  cancelFlightHandler,
  deleteFlightHandler,
  dashboardHandler,
  dashboardSelectFlightHandler,
  dashboardReportFlightHandler,
  dashboardClearReportFlightHandler,
  dashboardChartHandler,
  updateFlightsHandler,
  notificationHandler,
}
