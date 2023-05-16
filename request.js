const axios = require('axios')
const { sleep, getLog } = require('./utils')

/* -----------------------------------------------------------------------------
  * CITY & code IATA
----------------------------------------------------------------------------- */
// ? travelpayouts API
const getCity = async str => {
  try {
    str = str.toLowerCase()

    const url = encodeURI(
      `https://autocomplete.travelpayouts.com/places2?locale=ru&types[]=airport&types[]=city&term=${str?.trim()}`
    )
    const { data } = await axios.get(url)

    const filter = data?.filter(i => i.name.toLowerCase().includes(str))
    // ? если на английском
    if (!filter.length) {
      const url = encodeURI(
        `https://autocomplete.travelpayouts.com/places2?locale=en&types[]=airport&types[]=city&term=${str?.trim()}`
      )
      const { data } = await axios.get(url)
      const filter = data?.filter(i => i.name.toLowerCase().includes(str))
      if (!filter.length) return null

      return filter[0]
    }

    return filter[0]
  } catch (e) {
    console.log(getLog(e?.message).red)
    return null
  }
}

/* -----------------------------------------------------------------------------
  * CURRENCY
----------------------------------------------------------------------------- */
// ? From nbrb.by
// const getUSDexrate = async () => {
//   try {
//     const { data } = await axios.get(
//       'https://www.nbrb.by/api/exrates/rates/usd?parammode=2'
//     )
//     return +data?.Cur_OfficialRate
//   } catch (e) {
//     console.log(e?.message?.red)
//     return 0
//   }
// }

// ? RAPIDAPI.com
const getUSDexrate = async () => {
  try {
    const { data } = await axios.get('https://currency-exchange.p.rapidapi.com/exchange', {
      params: { from: 'USD', to: 'BYN', q: '1.0' },
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'currency-exchange.p.rapidapi.com',
      },
    })
    return +data?.toFixed(2)
  } catch (e) {
    console.log(getLog(e?.message).red)
    return 0
  }
}

/* -----------------------------------------------------------------------------
  * CAPTCHA
----------------------------------------------------------------------------- */
// ? ruCaptcha
const getCaptchaSolve = async scr => {
  try {
    const inCaptcha = await axios.post(`http://rucaptcha.com/in.php`, {
      key: process.env.CAPTCHA_API_KEY,
      method: 'base64',
      body: scr,
      phrase: 0,
      regsense: 1,
      numeric: 4,
      min_len: 5,
      max_len: 5,
      language: 2,
      json: 1,
    })

    const { status: inStatus, request: inId } = inCaptcha?.data
    if (!inStatus) {
      throw { message: 'Не удалось загрезить капчу на сервис API' }
    }

    let resCaptcha
    while (!resCaptcha?.data?.status) {
      resCaptcha = await axios.get(
        `http://rucaptcha.com/res.php?key=${process.env.CAPTCHA_API_KEY}&action=get&id=${inId}&json=1`
      )

      let { status, request } = resCaptcha?.data
      let msg = `🟤  ${status}: ${request}`
      console.log(status ? msg.green : msg.gray)

      await sleep(5)
    }

    const { status: resStatus, request: resSolve } = resCaptcha?.data
    if (!resStatus) {
      throw { message: 'Не удалось получить ответ на капчу от сервиса API' }
    }

    return { success: true, error: null, data: resSolve }
  } catch (e) {
    console.log(getLog(e?.message).red)
    return { success: false, error: e?.message, data: null }
  }
}

/* -----------------------------------------------------------------------------
  * GET CURRENT IP ADDRESS
----------------------------------------------------------------------------- */
const logCurrentIpAddress = async () => {
  try {
    const url = 'https://api.ipify.org?format=json'
    const { data } = await axios.get(url)
    console.log(getLog(`Current IP address: ${data.ip}`).yellow)
  } catch (e) {
    console.log(getLog(e?.message).red)
  }
}

/* -----------------------------------------------------------------------------
  * EXPORTS
----------------------------------------------------------------------------- */
module.exports = { getCity, getCaptchaSolve, getUSDexrate, logCurrentIpAddress }
