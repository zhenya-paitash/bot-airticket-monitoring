const moment = require('moment')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const User = require('../models/userModel')
const Flight = require('../models/flightModel')
const Skyscanner = require('../models/skyscannerModel')
const lng = require('../language')

/* -----------------------------------------------------------------------------
  * CREATE CHART .PNG FILE
----------------------------------------------------------------------------- */
async function createChartFile(data, flight) {
  // ? COLORS
  const colors = [
    {
      primary: '114,134,211', // #7286d3
      bg: '#FFF4D2',
    },
    {
      primary: '255,136,75', // #ff884b
      bg: '#F5EAEA',
    },
    {
      primary: '234,84,85', // #ea5455
      bg: '#FFF6C3',
    },
    {
      primary: '96,153,102', // #609966
      bg: '#FFFBE9',
    },
    {
      primary: '129,91,91', // #815b5b
      bg: '#F2E5E5',
    },
  ]
  const color = colors[Math.floor(Math.random() * colors.length)]

  const canvas = new ChartJSNodeCanvas({
    width: 1080,
    height: 480,
    // backgroundColour: color.bg,
    backgroundColour: '#FAFAFA',
    chartCallback: ChartJS => {
      ChartJS.defaults.elements.line.borderColor = '#313131'
      ChartJS.defaults.color = '#313131'
      ChartJS.defaults.elements.line.borderWidth = 2
    },
  })

  const labels = []
  const dataset = {
    label: 'Самый дешевый билет',
    data: [],
    backgroundColor: `rgba(${color.primary}, .5)`,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: `rgba(${color.primary}, .75)`,
  }
  data.forEach(i => {
    labels.push(moment(i.date).format('DD.MM.YY'))
    dataset.data.push(i.minPrice)
  })

  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [dataset],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          display: true,
          // display: false,
          // position: 'bottom',
        },
        title: {
          display: true,
          text: `График цен ${flight.direction.from} - ${flight.direction.to} ${moment(flight.date.from).format(
            'DD.MM.YYYY'
          )} - ${moment(flight.date.to).format('DD.MM.YYYY')}`,
        },
        scales: {
          xAxes: [
            {
              display: false,
            },
          ],
          yAxes: [
            {
              display: false,
            },
          ],
        },
      },
    },
  }

  const buffer = await canvas.renderToBuffer(configuration)
  const direction = [flight.direction.fromCode, flight.direction.toCode]
  const dates = [moment(flight.date.from).format('DDMMYY'), moment(flight.date.to).format('DDMMYY')]
  const name = [direction.join('-'), dates.join('-')]
  const caption = name.join(' ')
  const fileOptions = { filename: name.join('_') + '.png' }

  return { buffer, fileOptions, caption }
}

async function getDataRange(flightId) {
  const flight = await Flight.findById(flightId)
  const start = moment(flight.date.from)
  const end = moment(flight.date.to)
  const data = await Skyscanner.find({
    'direction.from': flight.direction.from,
    'direction.to': flight.direction.to,
    date: {
      $gte: start.toISOString(),
      $lte: end.toISOString(),
    },
  })

  return { flight, start, end, data }
}

/* -----------------------------------------------------------------------------
  * ON CHART HANDLER
----------------------------------------------------------------------------- */
async function dashboardChartHandler({ bot, q }) {
  const { id } = q.from
  const [_, flightId, year, month] = q.data.split('_')

  const user = await User.findOne({ id })
  if (!user) {
    return bot.sendMessage(id, lng.userNotFound, { parse_mode: 'HTML' })
  }

  const { data, flight } = await getDataRange(flightId)
  const { buffer, fileOptions, caption } = await createChartFile(data, flight)
  await bot.sendPhoto(id, buffer, { caption }, fileOptions)

  return bot.answerCallbackQuery(q.id)
}

module.exports = dashboardChartHandler
