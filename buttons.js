const moment = require('moment')
const { getYearsRange, getMonthsRange } = require('./utils')

/* -----------------------------------------------------------------------------
  * CONFIG
----------------------------------------------------------------------------- */
const config = {
  resize_keyboard: true,
  one_time_keyboard: false,
}

const fields = {
  addBtnField: '➕ Доб. Билет',
  skipBtnField: '⏭️ до 1000 By',
  backBtnField: '⬅️ Назад',
  cancelBtnField: '✖️',
  cancelFlightBtnField: '🚫 Отм. Билет',
  cancelFlightAllBtnField: '❌ Отменить все',
  scheduleBtnField: '⏰ Рассылка',
  searchBtnField: '✈️ Начать поиск',
  dashboardField: '📉 Смотреть результаты',
  notificationBtnField: '🔔 Уведомления',
  // notificationOnBtnField: '🔔 Уведомления включены',
  // notificationOffBtnField: '🔕 Уведомления отключены',
  notificationOnBtnField: '🔕 Отключить уведомления',
  notificationOffBtnField: '🔔 Включить уведомления',

  showFlightsBtnField: '🎟 Показать все билеты',
  reportInFileTxt: '📎 .txt',
  reportInFileJson: '📎 .json',
  reportInMessage: '📑 Отчёт',
  getSingleRequestBtnField: '🔛 Быстрый запрос-ответ',
  getChartMonthField: '📊 График',
}

function toRows(arr, row) {
  const keyboard = []
  for (let i = 0; i < Math.ceil(arr.length / 2); i++) keyboard.push(arr.slice(i * row, (i + 1) * row))

  return keyboard
}

function getPagination({ page, pages, flight, year, month, day }) {
  const row = []
  const maxRowButtons = 5
  const center = Math.ceil(maxRowButtons / 2)

  // ? Left pages
  if (pages > maxRowButtons) {
    if (page <= center) {
      for (let i = 1; i < maxRowButtons; i++) {
        if (page > i) row.push({ text: i, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${i}` })
      }
    } else {
      row.push({ text: `<< 1`, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${1}` })

      if (page - 1 > pages - center) {
        row.push({
          text: `< ${pages - center}`,
          callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${pages - center}`,
        })
        for (let i = page - (pages - center); i > 1; i--) {
          row.push({
            text: pages - (pages - page) - i + 1,
            callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${pages - (pages - page) - i + 1}`,
          })
        }
      } else {
        row.push({ text: `< ${page - 1}`, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page - 1}` })
      }
    }

    // ? Add current page
    row.push({ text: `- ${page} -`, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page}` })

    // ? Right pages
    if (page < pages - center + 1) {
      if (page > center) {
        row.push({ text: `${page + 1} >`, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page + 1}` })
      } else {
        for (let i = 1; i <= center - page; i++) {
          row.push({ text: page + i, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page + 1}` })
        }

        row.push({
          text: `${center + 1} >`,
          callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${center + 1}`,
        })
      }

      row.push({ text: `${pages} >>`, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${pages}` })
    } else {
      for (let i = 2; i <= pages; i++) {
        if (page < i) row.push({ text: i, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${i}` })
      }
    }
  } else {
    for (let i = 1; i < pages; i++) {
      if (page > i) row.push({ text: i, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${i}` })
    }

    row.push({ text: `- ${page} -`, callback_data: page })
    for (let i = 2; i <= pages; i++) {
      if (page < i) row.push({ text: i, callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${i}` })
    }
  }

  return row
}

/* -----------------------------------------------------------------------------
  * BUTTONS
----------------------------------------------------------------------------- */
const backBtn = {
  reply_markup: {
    keyboard: [[fields.backBtnField]],
    input_field_placeholder: 'add',
    ...config,
  },
}

const dashboardBtn = {
  reply_markup: {
    keyboard: [[fields.backBtnField]],
    input_field_placeholder: 'dashboard',
    ...config,
  },
}

const backSkipBtn = {
  reply_markup: {
    keyboard: [[fields.skipBtnField], [fields.backBtnField, fields.cancelBtnField]],
    input_field_placeholder: 'add',
    ...config,
  },
}

const cancelBtn = {
  reply_markup: {
    keyboard: [[fields.cancelFlightAllBtnField], [fields.backBtnField]],
    input_field_placeholder: 'add',
    ...config,
  },
}

const scheduleBtn = {
  reply_markup: {
    keyboard: [[fields.backBtnField]],
    input_field_placeholder: 'schedule',
    ...config,
  },
}

/* -----------------------------------------------------------------------------
  * DYNAMIC BUTTONS
----------------------------------------------------------------------------- */
const menuBtn = (notif, show = 0) => {
  return {
    reply_markup: {
      keyboard: [
        [fields.addBtnField, fields.cancelFlightBtnField],
        // [fields.getSingleRequestBtnField],
        show ? [fields.showFlightsBtnField] : [],
        [notif ? fields.notificationOnBtnField : fields.notificationOffBtnField],
      ],
      input_field_placeholder: 'menu',
      ...config,
    },
  }
}

const scheduleSelectBtn = schedule => {
  const inline_keyboard = toRows(
    Array.from({ length: 24 }, (_, i) => {
      let text = `${i < 10 ? '0' + i : i}:00`
      if (schedule.includes(text)) text = `● ` + text

      return { text, callback_data: `schedule_select_${i}` }
    }),
    4
  )

  return {
    reply_markup: {
      inline_keyboard,
      ...config,
    },
  }
}

const flightsBtn = flights => {
  const data = flights.map(({ _id, direction, date }) => {
    const text = `${direction.from} - ${direction.to} | ${
      date.from.toString() === date.to.toString()
        ? moment(date.from).format('DD.MM.YY')
        : moment(date.from).format('DD.MM.YY') + ' - ' + moment(date.to).format('DD.MM.YY')
    }`
    const callback_data = `DELETE_${_id}`
    const length = text.length

    return { text, callback_data, length }
  })
  const maxLength = Math.max(...data.map(i => i.length))
  const inline_keyboard = data.map(({ text, length, callback_data }) => [
    {
      // text: '❌ ' + ' '.repeat(maxLength - length) + text,
      // text: '❌ ' + text + '▫️'.repeat(maxLength - length),
      // text: `❌ ${text}`,
      text: `✖️ ${text}`,
      callback_data,
    },
  ])

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'remove',
      ...config,
    },
  }
}

const flightsDashboardBtn = flights => {
  // const inline_keyboard = flights.map(({ _id, direction, date }) => [
  //   {
  //     text: `${direction.from} - ${direction.to} | ${
  //       date.from.toString() === date.to.toString()
  //         ? moment(date.from).format('DD.MM.YY')
  //         : moment(date.from).format('DD.MM.YY') + ' - ' + moment(date.to).format('DD.MM.YY')
  //     }`,
  //     callback_data: `SELECT_${_id}`,
  //   },
  // ])
  const inline_keyboard = flights.map(({ _id, direction, date }) => {
    let callback_data = `SELECT_${_id}`

    const start = moment(date.from)
    const end = moment(date.to)
    const years = getYearsRange(start, end)
    const months = getMonthsRange(start, end)
    if (years.length === 1) callback_data += `_${years[0]}_${months[0]}`

    return [
      {
        text: `${direction.from} - ${direction.to} | ${
          date.from.toString() === date.to.toString()
            ? moment(date.from).format('DD.MM.YY')
            : moment(date.from).format('DD.MM.YY') + ' - ' + moment(date.to).format('DD.MM.YY')
        }`,
        callback_data,
      },
    ]
  })

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'select flight',
      ...config,
    },
  }
}

const selectYearBtn = (flight, years) => {
  const inline_keyboard = toRows(
    years.map(year => ({
      text: String(year),
      callback_data: `SELECT_${flight._id}_${year}`,
    })),
    2
  )

  // * add back btn
  inline_keyboard.push([{ text: fields.backBtnField, callback_data: `SELECT_<` }])

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'select year',
      ...config,
    },
  }
}

const selectMonthBtn = (flight, year, months) => {
  // const inline_keyboard = toRows(
  //   months.map(month => ({
  //     text: moment({ month }).format('MMM'),
  //     callback_data: `SELECT_${flight._id}_${year}_${month}`,
  //   })),
  //   3
  // )

  const defaultMomentLocale = moment.locale()
  moment.locale('ru')
  const arrMonths = Array.from({ length: 12 }, (_, idx) => {
    return months.includes(idx)
      ? {
          text: moment({ month: idx }).format('MMM'),
          callback_data: `SELECT_${flight._id}_${year}_${idx}`,
        }
      : {
          text: ` `,
          callback_data: ` `,
        }
  })
  moment.locale(defaultMomentLocale)
  const inline_keyboard = toRows(arrMonths, 4)

  // * add back btn
  inline_keyboard.push([
    {
      text: fields.backBtnField,
      callback_data: `SELECT_${flight._id}_${year}<`,
    },
  ])

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'select month',
      ...config,
    },
  }
}

const selectDayBtn = (flight, year, month, days, months, len) => {
  // let inline_keyboard = toRows(
  //   days.map(day => ({
  //     text: String(day),
  //     callback_data: `SELECT_${flight._id}_${year}_${month}_${day}`,
  //   })),
  //   7
  // )

  const arrDays = Array.from({ length: moment({ year, month }).daysInMonth() }, (_, idx) => {
    return days.includes(idx + 1)
      ? {
          text: String(idx + 1),
          callback_data: `SELECT_${flight._id}_${year}_${month}_${idx + 1}`,
        }
      : {
          text: '○',
          callback_data: '○',
        }
  })
  const startWeekDay = moment({ year, month }).startOf('month').day() || 7
  const endWeekDay = moment({ year, month }).endOf('month').day() || 7
  arrDays.unshift(
    ...Array.from({ length: startWeekDay - 1 }, () => ({
      text: ' ',
      callback_data: ' ',
    }))
  )
  arrDays.push(
    ...Array.from({ length: 7 - endWeekDay }, () => ({
      text: ' ',
      callback_data: ' ',
    }))
  )
  // ? moment module ! todo: add locale
  // arrDays.unshift(
  //   ...Array.from({ length: 7 }, (_, i) => ({
  //     text: moment()
  //       .startOf('week')
  //       .add(i + 1, 'days')
  //       .format('ddd'),
  //     callback_data: ' ',
  //   }))
  // )
  arrDays.unshift(
    ...[
      { text: 'пн', callback_data: ' d' },
      { text: 'вт', callback_data: ' d' },
      { text: 'ср', callback_data: ' d' },
      { text: 'чт', callback_data: ' d' },
      { text: 'пт', callback_data: ' d' },
      { text: 'сб', callback_data: ' d' },
      { text: 'вс', callback_data: ' d' },
    ]
  )

  const inline_keyboard = toRows(arrDays, 7)

  // * add months selector
  if (months.length > 1) {
    const defaultMomentLocale = moment.locale()
    moment.locale('ru')
    const curMonth = months.indexOf(+month)
    inline_keyboard.unshift([
      {
        text: '<<',
        callback_data: `SELECT_${flight._id}_${year}_${curMonth - 1 < 0 ? months.at(-1) : months[curMonth - 1]}`,
      },
      {
        text: `${moment({ month }).format('MMM')} ${moment({ year }).format('YYYY')}`,
        callback_data: `SELECT_${flight._id}_${year}_${month}<`,
      },
      {
        text: '>>',
        callback_data: `SELECT_${flight._id}_${year}_${
          curMonth + 1 === months.length ? months[0] : months[curMonth + 1]
        }`,
      },
    ])
    moment.locale(defaultMomentLocale)
  }

  // ? CHART ROW if data.length > 0
  len &&
    inline_keyboard.push([
      {
        text: fields.getChartMonthField,
        callback_data: `CHART_${flight._id}_${year}_${month}`,
      },
    ])

  // * add back btn
  inline_keyboard.push([
    {
      text: fields.backBtnField,
      callback_data: `SELECT_${flight._id}_${year}<`,
    },
  ])

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'select day',
      ...config,
    },
  }
}

const dayTicketsBtn = (flight, year, month, day, page, pages, haveContent, dates) => {
  const prev = dates.prev ? moment(dates.prev, 'DD.MM.YY') : null
  const next = dates.next ? moment(dates.next, 'DD.MM.YY') : null

  // * add back btn
  const inline_keyboard = [
    // TODO: добавить источник
    // ? SOURCE ROW
    // pages > 1
    //   ? [
    //       {
    //         text: '<<',
    //         callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page - 1 ? page - 1 : pages}`,
    //       },
    //       {
    //         text: `${page} | ${pages}`,
    //         callback_data: ` `,
    //       },
    //       {
    //         text: '>>',
    //         callback_data: `SELECT_${flight._id}_${year}_${month}_${day}_${page + 1 <= pages ? page + 1 : 1}`,
    //       },
    //     ]
    //   : [],
    // ? PAGES ROW
    pages > 1 ? getPagination({ page, pages, flight, year, month, day }) : [],
    // ? REPORT ROW
    haveContent
      ? [
          {
            text: fields.reportInMessage,
            callback_data: `REPORT_MSG_${flight._id}_${year}_${month}_${day}`,
          },
          {
            text: fields.reportInFileTxt,
            callback_data: `REPORT_TXT_${flight._id}_${year}_${month}_${day}`,
          },
          {
            text: fields.reportInFileJson,
            callback_data: `REPORT_JSON_${flight._id}_${year}_${month}_${day}`,
          },
        ]
      : [],
    // ? NEXT/PREV DAY ROW
    dates.all.length > 1
      ? [
          prev
            ? {
                text: `< ${moment(prev).format('DD.MM.YYYY')}`,
                // text: '<',
                callback_data: `SELECT_${flight._id}_${moment(prev).format('YYYY')}_${prev.month()}_${moment(
                  prev
                ).format('D')}`,
              }
            : null,
          next
            ? {
                text: `${moment(next).format('DD.MM.YYYY')} >`,
                // text: '🔜',
                callback_data: `SELECT_${flight._id}_${moment(next).format('YYYY')}_${next.month()}_${moment(
                  next
                ).format('D')}`,
              }
            : null,
        ].filter(Boolean)
      : [],
    // ? BACK ROW
    [
      {
        text: fields.backBtnField,
        callback_data: `SELECT_${flight._id}_${year}_${month}_${day}<`,
      },
    ],
  ]

  return {
    reply_markup: {
      inline_keyboard,
      input_field_placeholder: 'res',
      ...config,
    },
  }
}

const deleteReportMessagesBtn = messages => {
  const inline_keyboard = [
    [
      {
        text: '✖️',
        callback_data: 'CLEAR_' + messages.join('_'),
      },
    ],
  ]

  return {
    reply_markup: {
      inline_keyboard,
      ...config,
    },
  }
}

/* -----------------------------------------------------------------------------
  * EXPORTS
----------------------------------------------------------------------------- */
module.exports = {
  fields,
  menuBtn,
  backBtn,
  backSkipBtn,
  cancelBtn,
  scheduleBtn,
  scheduleSelectBtn,
  flightsBtn,
  dashboardBtn,
  flightsDashboardBtn,
  selectYearBtn,
  selectMonthBtn,
  selectDayBtn,
  dayTicketsBtn,
  deleteReportMessagesBtn,
}
