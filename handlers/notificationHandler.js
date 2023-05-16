const Flight = require('../models/flightModel')
const Kayak = require('../models/kayakModel')
const Skyscanner = require('../models/skyscannerModel')
const KayakNotification = require('../models/kayakNotificationModel')
const SkyscannerNotification = require('../models/skyscannerNotificationModel')
const lng = require('../language')
const { getDiffPercentage } = require('../utils')

async function onChangeHandler(bot, data, dbname, db, dbnotification) {
  if (data.operationType !== 'insert') return

  const doc = data.fullDocument
  if (doc.read) return

  // ? read false > true
  const { prevPrice, curPrice } = doc
  await dbnotification.findByIdAndUpdate(doc._id, { read: true })

  if (doc.type === 'create') return
  if (doc.type !== 'update') return // ? для возможных других типов
  if (!curPrice || !prevPrice || curPrice >= prevPrice) return

  const dbdata = await db.findById(doc[dbname])
  if (!dbdata) return

  const flights = await Flight.find({
    'direction.from': dbdata.direction.from,
    'direction.to': dbdata.direction.to,
    'date.from': { $lte: dbdata.date },
    'date.to': { $gte: dbdata.date },
  }).populate('user')

  // ? выслать уведомление пользователю
  for (let flight of flights) {
    if (curPrice <= flight.price && flight.user.notification) {
      const diff = getDiffPercentage(prevPrice, curPrice)
      const message = lng.notificationOnPriceReduction({ data: dbdata, diff, prevPrice, curPrice })
      // TODO: if (diff > 5) {}
      await bot.sendMessage(flight.user.id, message, { parse_mode: 'HTML' })
    }
  }
}

/* -----------------------------------------------------------------------------
  * STREAM NOTIFICATION DATABASE & SEND NOTIFICATIONS
----------------------------------------------------------------------------- */
async function notificationHandler({ bot }) {
  KayakNotification.watch().on('change', async data => {
    await onChangeHandler(bot, data, 'kayak', Kayak, KayakNotification)
  })

  SkyscannerNotification.watch().on('change', async data => {
    await onChangeHandler(bot, data, 'skyscanner', Skyscanner, SkyscannerNotification)
  })
}

module.exports = notificationHandler
