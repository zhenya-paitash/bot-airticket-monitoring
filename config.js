const mongoose = require('mongoose')
const { HELP, MENU_CMD, ABOUT } = require('./commands')
const { logCurrentIpAddress } = require('./request')
const { getLogTime } = require('./utils')

/* -----------------------------------------------------------------------------
  * CONFIG
----------------------------------------------------------------------------- */
const connectDB = async () => {
  logCurrentIpAddress()

  try {
    const {
      NODE_ENV,
      DATABASE_URI,
      DATABASE_REPLICA,
      DATABASE_USERNAME,
      DATABASE_PASSWORD,
      DATABASE_MECHANISM,
      DATABASE_AUTH,
    } = process.env

    let connect
    let connectOptions = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }

    switch (NODE_ENV) {
      case 'production':
        if (DATABASE_REPLICA) connectOptions.replicaSet = DATABASE_REPLICA
        connect = await mongoose.connect(DATABASE_URI, connectOptions)
      case 'development':
        connectOptions = {
          ...connectOptions,
          auth: {
            username: DATABASE_USERNAME,
            password: DATABASE_PASSWORD,
          },
          authSource: DATABASE_AUTH,
          authMechanism: DATABASE_MECHANISM,
          replicaSet: DATABASE_REPLICA,
        }
        mongoose.set('strictQuery', false)
        connect = await mongoose.connect(DATABASE_URI, connectOptions)
    }
    console.log(`${getLogTime()} Mongodb connected: ${connect.connection.host}`.cyan.underline)
  } catch (e) {
    console.error(`${getLogTime()} MongodbError: ${e.message}`.red.underline.bold)
  }
}

const botConfig = async bot => {
  return await bot.setMyCommands([
    { command: HELP, description: '🏳️ Помощь' },
    { command: ABOUT, description: '📂 О приложении' },
    { command: MENU_CMD, description: '🎟 В главное меню' },
  ])
}

/* -----------------------------------------------------------------------------
  * EXPORTS
----------------------------------------------------------------------------- */
module.exports = { connectDB, botConfig }
