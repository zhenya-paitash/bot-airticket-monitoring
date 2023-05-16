const moment = require('moment')
const { fields } = require('./buttons')

const { TICKETS_PER_PAGE, TICKETS_PER_PAGE_DAYS } = process.env

module.exports = {
  // * MESSAGES
  helpMessage: `<b>🏳️ Помощь:</b>\n\n<b>Команды приложения:</b>\n▫️ /help - <i>вызов помощи</i>\n▫️ /about - <i>данные о приложении</i>\n▫️ /menu - <i>быстро вернуться в главное меню приложения</i>\n\n<b>Как начать:</b>\n<i>▫️ Для начала добавьте интересующий билет, нажав в главном меню на кнопку "<code>${fields.addBtnField}</code>" в нижней панели</i>\n<i>️▫️ Следуя инструкции на экране добавления билета, добавтье интересующее направление, дату и лимит цены</i>\n<i>▫️ Вернитесь в главное меню и подождите пока наши сервисы найдут подходящие для вашего запроса билеты</i>\n<i>▫️ Используя интерактивные кнопки в сообщении на главном меню, найдите ваш билет</i>\n<i>️▫️ Приятного путишествия</i>\n\n<b>Полезная информация:</b>\n<i>▫️ По умолчанию все приходящие уведомления приложения включены. Вы в любой момент можете отключить (и включить соответственно) их нажав на кнопку "<code>${fields.notificationOnBtnField}</code>" / "<code>${fields.notificationOffBtnField}</code>" в нижней панели управления в главном меню</i>\n<i>▫️ Для удобной навигации и сравнения нескольких дат, вы можете вызвать несколько интерактивных окон, нажав на "<code>${fields.showFlightsBtnField}</code>" в главном меню</i>`,
  chooseTicket: '<b>Выберите билет</b>',
  noFlightMessage: '<i>Вы не отслеживаете рейсы</i>',
  cancelFlightMessage: '<b>Выберите рейс, который хотите отменить</b>',
  clickToDeleteMessage: '<i>(нажмите, чтобы удалить)</i>',
  userNotFound: '<i>Пользователь не найден</i>',
  noFlightDashboardMessage: `<b>Нет отслеживаемых билетов.</b>\n\n<i>Нажмите на кнопку "${fields.addBtnField}" на нижней панели и следуйте инструкции на экране.</i>`,
  errorReportFile: `<i>Возникла ошибка. Мы будем работать над её устранением</i>`,
  clearReportMessages: '<i>(очистить отчет)</i>',

  // * FUNCTIONS
  aboutMessage: ({ version, description, author, license }) => {
    const message = `<i><b>Версия:</b> ${version}\n<b>Автор:</b> ${author}\n<b>Лицензия:</b> ${license}\n<b>Описание:</b> ${description}</i>`
    return message
  },

  addTicketMessage: (from, to, next) => {
    const message = `<i>❔ Напишите откуда и куда вы бы хотели найти билет в формате:\n\n▫️ Укажите откуда и куда вы хотите найти билет. Например: <b>Стамбул - Дубай</b>\n▫️ Укажите даты(у) диапазона поиска дешевого билета формата <b>DD.MM.YY</b>. Например: <b>01.03.23 - 26.06.23</b> или только один день <b>07.08.23</b> (обратите внимание что год указан в формате <b>YY</b> из 2 последних чилел)</i>\n▫️ Укажите верхний предел цены на искомый билет в <b>долларах</b>. Например: <b>1000</b>\n▫️ Все данные должны бить разделены символом "," и соблюдены пробелы.\n▫️ Билеты <b>можно</b> добавлять несколько за раз, разделенные символом переноса <b>(Ctrl + Enter)</b>\n\n<code>Екатеринбург - Гоа, ${from} - ${to}, 3000</code>\n\n<i>Или только на <b>конкретное число</b>:</i>\n\n<code>Милан - Париж, ${next}, 1000</code>\n\n<i>(нажмите чтобы скопировать)</i>`
    return message
  },

  menuTicketMessage: ({ direction, date, price }) => {
    const message = `🎟 <i><b>${direction.from} - ${direction.to}</b>\n\t\t\t<b>${
      date.from === date.to
        ? moment(date.from).format('DD.MM.YY')
        : `${moment(date.from).format('DD.MM.YY')} - ${moment(date.to).format('DD.MM.YY')}`
    }</b>\n\t\t\t<b>Цена билета:</b> до ${price} $</i>`

    return message
  },

  menuMessage: ticketsStr => {
    const message = `<b>Ваши отслеживаемые рейсы:</b>\n\n${ticketsStr}\n\n#menu`
    return message
  },

  ticketDayDataHeader: (flight, date) => {
    // const defaultMomentLocale = moment.locale()
    // const momentLoc = moment.locale('ru')
    const weekDay = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][moment(date).day()]
    const message = `<b>Направление: </b>${flight.direction.from} - ${flight.direction.to}\n<b>Цена: </b> до ${
      flight.price
    }$\n<b>Дата: </b>${moment(date).format('DD.MM.YYYY')} (${weekDay})\n\n`
    // moment.locale(defaultMomentLocale)

    return message
  },

  ticketMonthDataHeader: (flight, year, month) => {
    const message = `<b>Направление: </b>${flight.direction.from} - ${flight.direction.to}\n<b>Цена: </b> до ${
      flight.price
    }$\n<b>Дата: </b>○○ . ${moment(`${+month + 1}.${year}`, 'M.YYYY').format('MM.YYYY')}\n\n`

    return message
  },

  ticketYearDataHeader: (flight, year) => {
    const message = `<b>Направление: </b>${flight.direction.from} - ${flight.direction.to}\n<b>Цена: </b> до ${flight.price}$\n<b>Дата: </b>○○ . ○○ . ${year}\n\n`
    return message
  },

  // ticketAllTimeDataHeader: flight => {
  //   const message = `<b>Направление: </b>${flight.direction.from} - ${flight.direction.to}\n<b>Дата: </b>${flight.date.from}-${flight.}\n<b>Цена: </b> до ${flight.price}$\n\n`
  //   return message
  // },

  ticketDayDataContent: (flight, data, source, page) => {
    const haveContent = Boolean(data?.tickets?.length)
    const filter = data?.tickets?.filter(i => i.price <= flight.price)
    const pages = Math.ceil(filter?.length / TICKETS_PER_PAGE)

    const dataStr = !flight.available
      ? `<i>✖️ Нет подходящих билетов</i>`
      : filter
      ? filter
          ?.slice(TICKETS_PER_PAGE * page - TICKETS_PER_PAGE, TICKETS_PER_PAGE * page)
          ?.map((i, idx) => {
            let h = Math.floor(i.duration / 60)
            let m = i.duration % 60

            return `${idx + 1 + (page - 1) * TICKETS_PER_PAGE}) <a href="${i.link}">${i.price}$</a>, ${i.departure}-${
              i.arrival
            }, ⏱${h ? `${h}h ${m}m` : `${m}m`}, 🔄${i.stops}`
          })
          ?.join('\n') || '<i>✖️ Нет подходящих билетов</i>'
      : `<i>💤 Данные еще не получены.</i>`

    return {
      content: `<b><a href="${data?.url}">${'Источник'}</a></b>\n${dataStr}`,
      page,
      pages,
      haveContent,
    }
  },

  ticketRangeDataContent: (flight, data, source) => {
    const len = data?.filter(i => i.__v > 0 && i.tickets.length > 0)?.length
    const sortedData = data
      ?.map(d => {
        d.tickets = d.tickets.filter(ticket => ticket.price <= flight.price)
        return d
      })
      ?.filter(i => i.tickets.length)
      ?.sort((a, b) => a.minPrice - b.minPrice)
      ?.slice(0, TICKETS_PER_PAGE_DAYS)

    const content = sortedData?.length
      ? sortedData
          .map((i, idx) => {
            if (!i.tickets?.length) return

            return `${idx + 1}) ${moment(i.date).format('DD.MM.YYYY')}: <a href="${i?.tickets[0]?.link}">${
              i?.tickets[0]?.price + '$'
            }</a>`
          })
          ?.join('\n')
      : (!data.length || data.filter(i => i.__v > 0).length !== data.length) && flight.available
      ? '<i>💤 Данные еще не получены.</i>'
      : `<i>✖️ Нет подходящих билетов</i>`

    const message = [content].join('\n')

    return { content: message, len }
  },

  notificationOnOffMessage: notif => {
    const message = `<i>Уведомления <b>${notif ? 'включены' : 'отключены'}</b>.</i>`
    return message
  },

  notificationOnPriceReduction: ({ data, diff, prevPrice, curPrice }) => {
    const message = `<i>💲 ${data.direction.from} - ${data.direction.to}, <b>${moment(data.date).format(
      'DD.MM.YYYY'
    )}</b>\n💲 Цена снизилась на <b>${diff}%</b>\n💲 <b>${prevPrice}$</b>  ➜  <a href="${
      data.tickets?.at(0)?.link
    }">${curPrice}$</a></i>`

    return message
  },
}
