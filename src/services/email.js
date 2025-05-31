const debug = require('debug')('app:email')
const { Resend } = require('resend')

const { EMAIL_API_KEY, SEND_EMAILS, SMTP_FROM } = process.env

async function send({ to, subject, text, html }) {
  if (!SEND_EMAILS) {
    debug('SEND_EMAILS not set, return')
    return
  }

  const resend = new Resend(EMAIL_API_KEY)

  try {
    const result = await resend.emails.send({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html
    })

    debug('[send] result=%j', result)

    return result
  } catch (err) {
    debug('[send] %s', err)
    throw err
  }
}

exports.send = send
