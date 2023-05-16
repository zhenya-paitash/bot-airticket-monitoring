const moment = require('moment')
const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const { fields, backBtn } = require('../buttons')
const { MENU } = require('../commands')
const { getCity } = require('../request')
const { getLog } = require('../utils')

/* -----------------------------------------------------------------------------
  * ON BUTTON
----------------------------------------------------------------------------- */
async function onBackBtnClick({ bot, msg, id, user }) {
  await User.findOneAndUpdate({ id }, { status: MENU }, { new: true })

  msg.text = ''
  return require('../main').main({ bot, msg })
}

/* -----------------------------------------------------------------------------
  * VALIDATION & ADD NEW FLIGHT
----------------------------------------------------------------------------- */
async function addValidFlight({ bot, msg, id, user, input }) {
  let data = input.current?.split(',').map(i => i?.trim())
  let [flight, date, price] = data

  const flightIsValid = /^[а-яА-Яa-zA-Z- ]+ - [а-яА-Яa-zA-Z- ]+$/gm.test(flight)
  const dateSingleIsValid = /^\d{2}.\d{2}.\d{2}$/gm.test(date)
  const dateTwoIsValid = /^\d{2}.\d{2}.\d{2} - \d{2}.\d{2}.\d{2}$/gm.test(date)

  const dataIsValid =
    data.length === 3 && flightIsValid && (dateTwoIsValid || dateSingleIsValid) && !isNaN(price) && +price > 0

  if (!dataIsValid) {
    msg.text = ''
    await bot.sendMessage(id, `<i>⁉️ Не соответствует шаблону.</i>\n<b>${data}</b>`, {
      parse_mode: 'HTML',
      ...backBtn,
    })
    // return require('./main').main({ bot, msg })
    return
  }

  // * FLIGHT
  const [fromF, toF] = flight.split(' - ')?.map(i => i.trim())
  const fromCity = await getCity(fromF)
  const toCity = await getCity(toF)
  // ? VALIDATION FLIGHT
  if (!fromCity?.name || !fromCity?.code || !toCity?.name || !toCity?.code) {
    return await bot.sendMessage(id, `<i>⁉️ Проверьте пункты вылета - прилета</i>\n<b>${data}</b>`, {
      parse_mode: 'HTML',
    })
  }

  // * DATE
  let fromD
  let toD
  if (dateTwoIsValid) {
    ;[fromD, toD] = date.split(' - ')
    const now = moment().startOf('day').format('DD.MM.YY')
    fromD = moment(fromD, 'DD.MM.YY')
    toD = moment(toD, 'DD.MM.YY')
    // ? VALIDATION from-to DATE
    if (!fromD.isValid() || !toD.isValid() || moment(now, 'DD.MM.YY') > fromD || fromD >= toD) {
      return await bot.sendMessage(id, `<i>⁉️ Проверьте даты.</i>\n<b>${data}</b>`, {
        parse_mode: 'HTML',
        reply_to_message_id: msg.message_id,
      })
    }

    if (toD.diff(fromD, 'years')) {
      return await bot.sendMessage(
        id,
        `<i>⁉️ Проверьте даты. Допустим только диапазон меньше года.</i>\n<b>${data}</b>`,
        {
          parse_mode: 'HTML',
          reply_to_message_id: msg.message_id,
        }
      )
    }
  } else if (dateSingleIsValid) {
    const now = moment().startOf('day').format('DD.MM.YY')
    const day = moment(date, 'DD.MM.YY')
    // ? VALIDATION single DATE
    if (!day.isValid() || moment(now, 'DD.MM.YY') > day) {
      return await bot.sendMessage(id, `<i>⁉️ Проверьте вводимые данные.</i>\n<b>${data}</b>`, {
        parse_mode: 'HTML',
        reply_to_message_id: msg.message_id,
      })
    }
    ;[fromD, toD] = [day, day]
  }

  // * PRICE
  price = +price
  // ? int32 max value 2_147_483_647
  if (price > 2147483647) price = 2147483647

  // * ADD NEW FLIGHT
  try {
    const ticket = {
      user: user._id,
      direction: {
        from: fromCity.name,
        fromCode: fromCity.code,
        to: toCity.name,
        toCode: toCity.code,
      },
      date: { from: fromD, to: toD },
      price: price,
    }

    await Flight.create(ticket)

    msg.text = ''
    return await bot.sendMessage(user.id, `<i>✔️ Билет добавлен</i>\n<b>${data}</b>`, {
      parse_mode: 'HTML',
      reply_to_message_id: msg.message_id,
      ...backBtn,
    })
  } catch (e) {
    console.log(getLog(e?.message).red)
  }
}

/* -----------------------------------------------------------------------------
  * ADD FLIGHT HANDLER
----------------------------------------------------------------------------- */
async function addFlightHandler({ bot, msg, id, user }) {
  // * BUTTONS
  if (msg.text === fields.backBtnField) return onBackBtnClick({ bot, msg, id, user })

  if (!msg?.text) return

  const dataArr = msg?.text?.split('\n')
  for (let dataIdx = 0; dataIdx < dataArr.length; dataIdx++) {
    await addValidFlight({
      bot,
      msg,
      id,
      user,
      input: { arr: dataArr, idx: dataIdx, current: dataArr[dataIdx] },
    })
  }

  return
  // return bot.sendMessage(id, '#add', backBtn)
}

module.exports = addFlightHandler
