const debug = require('debug')('app:email')
const Mailgun = require('mailgun.js')

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, SEND_EMAILS, SMTP_FROM } = process.env

async function send({ to, subject, text, html }) {
  if (!SEND_EMAILS) {
    debug('SEND_EMAILS not set, return')
    return
  }

  const mailgun = new Mailgun(FormData)

  const mg = mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY
  })

  const result = await mg.messages.create(MAILGUN_DOMAIN, {
    from: SMTP_FROM,
    to: [to],
    subject,
    text,
    html
  })

  debug('[send] result=%j', result)

  return result
}

exports.send = send
