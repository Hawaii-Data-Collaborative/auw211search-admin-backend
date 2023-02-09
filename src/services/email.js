const debug = require('debug')('app:email')
const axios = require('axios')
const querystring = require('querystring')

const { EMAIL_API_URL, EMAIL_API_KEY, SEND_EMAILS } = process.env

const mailgun = axios.create({
  baseURL: EMAIL_API_URL,
  auth: {
    username: 'api',
    password: EMAIL_API_KEY
  }
})

async function send({ email, subject, body }) {
  if (!SEND_EMAILS) {
    debug('SEND_EMAILS not set, return')
  }

  const data = {
    from: 'AUW Admin <noreply@windwardapps.com>',
    to: email,
    subject,
    html: body
  }

  const formData = querystring.stringify(data)
  const res = await mailgun.post('/messages', formData)

  debug('res=%o', res)
}

exports.send = send
